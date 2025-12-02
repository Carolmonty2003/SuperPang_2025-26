/**
 * Hero clásico de Pang. Dispara arpones.
 */
import { HeroBase } from "./HeroBase.js";
import { Harpoon } from "./Harpoon.js";
import { EVENTS } from "../core/events.js";

export class Hero extends HeroBase {
  constructor(scene, x, y, texture = "player_walk") {
    super(scene, x, y, texture);

    this.activeHarpoon = null; // Solo un arpón a la vez
    this.isShooting = false;

    // Crear animaciones del héroe (si no existen aún)
    this.createAnimations();
  }

  /**
   * Crea las animaciones del héroe en el Animation Manager de la escena.
   * Solo las crea si no existen para evitar duplicados entre escenas.
   */
  createAnimations() {
    const anims = this.scene.anims;

    // IDLE
    if (!anims.exists("idle")) {
      anims.create({
        key: "idle",
        frames: anims.generateFrameNumbers("player_walk", { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1,
      });
    }

    // RUN
    if (!anims.exists("run")) {
      anims.create({
        key: "run",
        frames: anims.generateFrameNumbers("player_walk", { start: 0, end: 3 }),
        frameRate: 12,
        repeat: -1,
      });
    }

    // SHOOT
    if (!anims.exists("shoot")) {
      anims.create({
        key: "shoot",
        frames: anims.generateFrameNumbers("player_shoot", { start: 0, end: 1 }),
        frameRate: 8,
        repeat: 0,
      });
    }
  }

  /**
   * Invertimos el flip de las direcciones.
   * (si antes al ir a la izquierda miraba a la derecha, ahora será al revés)
   */
  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (!this.body) return;

    const vx = this.body.velocity.x;

    if (vx < 0) {
      // moviéndose a la IZQUIERDA
      // -> lo dejamos sin flip (o al revés de lo que tuvieras)
      this.setFlipX(false);
    } else if (vx > 0) {
      // moviéndose a la DERECHA
      this.setFlipX(true);
    }
  }

  /**
   * Lógica de disparo clásico (un solo arpón activo).
   * Este método lo llama HeroBase cuando detecta SPACE (JustDown).
   */
  handleShootingInput() {
    if (this.isShooting) return;

    // Si ya hay un arpón activo y sigue vivo, no disparamos otro
    if (this.activeHarpoon && this.activeHarpoon.active) {
      return;
    }

    this.isShooting = true;
    this.play("shoot", true);

    // Crear el arpón
    this.activeHarpoon = new Harpoon(this.scene, this.x, this.y);

    // Evento opcional (por si quieres sonido, UI, etc.)
    this.scene.game.events.emit(EVENTS.hero.SHOOT);

    // Cuando acabe la animación de disparo, volvemos a poder mover/disparar
    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.isShooting = false;
    });
  }
}
