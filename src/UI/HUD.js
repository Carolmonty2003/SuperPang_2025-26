// src/UI/Hud.js

import { GAME_SIZE, HERO } from '../core/constants.js';
import { EVENTS } from '../core/events.js';

export class Hud {
  constructor(scene, { uiTop, mode = 'HARPOON' } = {}) {
    this.scene = scene;
    this.events = scene.game.events;

    // Altura donde empieza la HUD:
    //  - si la escena pasa uiTop, lo usamos (normalmente altura del mapa)
    //  - si no, usamos la altura física del mundo
    const mapHeight = scene.walls?.height || scene.physics.world.bounds.height;
    this.uiTop = uiTop ?? mapHeight;
    this.uiHeight = GAME_SIZE.HEIGHT - this.uiTop;

    // Fondo negro
    this.background = scene.add
      .rectangle(0, this.uiTop, GAME_SIZE.WIDTH, this.uiHeight, 0x000000, 1)
      .setOrigin(0);

    // ==========================
    //   VIDAS COMO ICONOS
    // ==========================
    this.lives = 0;
    this.maxLives = HERO?.MAX_LIVES ?? 3;
    this.lifeIcons = [];

    // En Pang: 3 vidas -> 2 iconos visibles
    const iconsToCreate = Math.max(0, this.maxLives - 1);
    const baseX = 24;
    const spacing = 40;

    // Iconos pegados a la parte baja de la HUD (como el original)
    const iconY = this.uiTop + this.uiHeight - 20;

    for (let i = 0; i < iconsToCreate; i++) {
      const icon = scene.add
        .image(baseX + i * spacing, iconY, 'player_walk', 0) // frame 0
        .setOrigin(0, 1) // esquina inferior izquierda
        .setScale(0.5);

      this.lifeIcons.push(icon);
    }

    // Texto "1-P" encima de las vidas
    this.playerLabel = scene.add
      .text(baseX, iconY - 70, '1-P', {
        fontFamily: 'Arial',
        fontSize: '28px',
        color: '#ffffff',
      })
      .setOrigin(0, 1); // anclado por abajo, justo encima de los iconos

    // ==========================
    //   TEXTO DE MODO
    // ==========================
    this.modeText = scene.add
      .text(
        GAME_SIZE.WIDTH / 2,
        this.uiTop + this.uiHeight / 2,
        `MODE: ${mode}`,
        {
          fontFamily: 'Arial',
          fontSize: '24px',
          color: '#ffffff',
        }
      )
      .setOrigin(0.5, 0.5);

    // ==========================
    //   TEXTO DE PUNTUACIÓN
    // ==========================
    this.score = 0;
    this.scoreText = scene.add
      .text(
        GAME_SIZE.WIDTH - 24,
        this.uiTop + this.uiHeight / 2,
        'SCORE: 00',
        {
          fontFamily: 'Arial',
          fontSize: '24px',
          color: '#ffffff',
        }
      )
      .setOrigin(1, 0.5);

    // ==========================
    //   LISTENERS DE EVENTOS
    // ==========================
    this.events.on(EVENTS.game.SCORE_CHANGE, this.onScoreChange, this);
    this.events.on(EVENTS.hero.READY, this.onHeroReady, this);
    this.events.on(EVENTS.hero.DAMAGED, this.onHeroDamaged, this);

    // Cambio de arma (texto central)
    this.events.on('UI_WEAPON_CHANGE', (modeTxt) => {
      this.setMode(modeTxt);
    });

    scene.events.on(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    scene.events.on(Phaser.Scenes.Events.DESTROY, this.destroy, this);
  }

  // ===== SCORE =====
  onScoreChange(delta) {
    this.score += delta;
    const padded = this.score.toString().padStart(2, '0');
    this.scoreText.setText(`SCORE: ${padded}`);
  }

  // ===== VIDAS =====
  onHeroReady(hero) {
    this.hero = hero;
    this.setLives(hero.lives ?? 0);
  }

  onHeroDamaged(remainingLives) {
    this.setLives(remainingLives);
  }

  setLives(value) {
    this.lives = value;

    // nº de iconos visibles = vidas - 1 (como en Pang)
    // 3 vidas -> 2 iconos
    // 2 vidas -> 1 icono
    // 1 o 0 vidas -> 0 iconos
    const visibleIcons = Math.max(
      0,
      Math.min(this.maxLives - 1, (value ?? 0) - 1)
    );

    this.lifeIcons.forEach((icon, index) => {
      icon.setVisible(index < visibleIcons);
    });
  }

  // ===== MODO ARMA =====
  setMode(mode) {
    this.modeText.setText(`MODE: ${mode}`);
  }

  // ===== LIMPIEZA =====
  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;

    this.events.off(EVENTS.game.SCORE_CHANGE, this.onScoreChange, this);
    this.events.off(EVENTS.hero.READY, this.onHeroReady, this);
    this.events.off(EVENTS.hero.DAMAGED, this.onHeroDamaged, this);
    this.events.off('UI_WEAPON_CHANGE');

    this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    this.scene.events.off(Phaser.Scenes.Events.DESTROY, this.destroy, this);

    this.background?.destroy();
    this.playerLabel?.destroy();
    this.lifeIcons?.forEach((icon) => icon.destroy());
    this.modeText?.destroy();
    this.scoreText?.destroy();
  }
}

export default Hud;
