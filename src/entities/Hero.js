/**
 * Hero clásico de Pang. Dispara arpones o balas según el arma equipada.
 */
import { HeroBase } from './HeroBase.js';
import { Harpoon } from './Harpoon.js';
import { Bullet } from './Bullet.js';
import { EVENTS } from '../core/events.js';

// "Enum" de tipos de arma del héroe
export const HERO_WEAPON = {
    HARPOON: 1,
    GUN: 2,
};

export class Hero extends HeroBase 
{
    constructor(scene, x, y, texture = 'player_walk') 
    {
        super(scene, x, y, texture);

        // Solo un arpón activo a la vez (modo HARPOON)
        this.activeHarpoon = null;

        // Flag para bloquear movimiento al disparar
        this.isShooting = false;

        // Tipo de arma actual (1 = arpón, 2 = balas)
        this.weaponType = HERO_WEAPON.HARPOON;
        // this.weaponType = HERO_WEAPON.GUN; // ← pon esto para empezar con la metralleta

        // Crear animaciones del héroe
        this.createAnimations();

        // --- TECLAS PARA CAMBIAR DE ARMA (1 y 2) ---
        this.key1 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.key2 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);

        this.key1.on('down', () => {
            this.setWeapon(HERO_WEAPON.HARPOON);
            // console.log('Arma: HARPOON');
        });

        this.key2.on('down', () => {
            this.setWeapon(HERO_WEAPON.GUN);
            // console.log('Arma: GUN');
        });

        // Empezar en idle
        this.play('idle');
    }

    /**
     * Permite cambiar el arma desde fuera:
     *   hero.setWeapon(HERO_WEAPON.GUN);
     */
    setWeapon(weaponType) {
        this.weaponType = weaponType;
    }

    /**
     * Crea las animaciones del héroe.
     * Solo se crean si no existen, para evitar duplicarlas entre escenas.
     */
    createAnimations() {
        const anims = this.scene.anims;

        // IDLE: 1 SOLO FRAME, SIN ANIMAR
        if (!anims.exists('idle')) {
            anims.create({
                key: 'idle',
                frames: [{ key: 'player_walk', frame: 0 }], // solo frame 0
                frameRate: 1,
                repeat: -1,
            });
        }

        // RUN: animación de caminar/correr
        if (!anims.exists('run')) {
            anims.create({
                key: 'run',
                frames: anims.generateFrameNumbers('player_walk', { start: 0, end: 3 }),
                frameRate: 12,
                repeat: -1,
            });
        }

        // SHOOT: disparo una vez
        if (!anims.exists('shoot')) {
            anims.create({
                key: 'shoot',
                frames: anims.generateFrameNumbers('player_shoot', { start: 0, end: 1 }),
                frameRate: 8,
                repeat: 0,
            });
        }
    }

    /**
     * Lógica de disparo.
     * Este método lo llama HeroBase CUANDO se pulsa SPACE (JustDown).
     */
    handleShootingInput() 
    {
        // Si ya está en anim de disparo, no permitir otro
        if (this.isShooting) {
            return;
        }

        // Si el arma es arpón: solo permitir un arpón activo
        if (this.weaponType === HERO_WEAPON.HARPOON) {
            if (this.activeHarpoon && this.activeHarpoon.active) {
                return;
            }
        }

        // A partir de aquí, vamos a disparar
        this.isShooting = true;

        // Bloquear movimiento mientras disparamos
        this.setVelocityX(0);

        // Reproducir animación de disparo UNA VEZ
        this.play('shoot', true);

        // Ejecutar el disparo según el arma equipada
        if (this.weaponType === HERO_WEAPON.HARPOON) {
            this.shootHarpoon();
        } else if (this.weaponType === HERO_WEAPON.GUN) {
            this.shootGunFan();
        }

        // Cuando termine la animación de "shoot", volvemos a dejarle moverse
        this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim) => {
            if (anim.key === 'shoot') {
                this.isShooting = false;
                // El HeroBase en el siguiente frame pondrá idle/run según se mueva
            }
        });
    }

    /**
     * Disparo clásico de arpón (un solo arpón vertical).
     */
    shootHarpoon() {
        // Crear el arpón en la posición actual del héroe
        this.activeHarpoon = new Harpoon(this.scene, this.x, this.y);

        // Evento por si quieres sonidos, efectos, etc.
        this.scene.game.events.emit(EVENTS.hero.SHOOT);
    }

    /**
     * Disparo de balas en abanico (metralleta).
     * Crea varias balas con distintos ángulos.
     */
    shootGunFan() {
        // Ángulos en grados respecto al eje X:
        // -90 es hacia arriba. Abrimos un abanico alrededor de -90.
        const angles = [-60, -75, -90, -105, -120];

        angles.forEach(angle => {
            const bullet = new Bullet(this.scene, this.x, this.y - 40, 'bullet');
            if (typeof bullet.fire === 'function') {
                bullet.fire(angle);
            }
        });

        this.scene.game.events.emit(EVENTS.hero.SHOOT);
    }
}
