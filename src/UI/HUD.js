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

    const baseX = 24;
    const spacing = 40;
    const iconY = this.uiTop + this.uiHeight - 20;
    // Crear solo 3 iconos de vida
    for (let i = 0; i < 3; i++) {
      const icon = scene.add
        .image(baseX + i * spacing, iconY, 'player', 0)
        .setOrigin(0, 1)
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

    // Texto para vidas extra (x{número}) - oculto inicialmente
    this.extraLivesText = scene.add
      .text(baseX + (3 * spacing) + 10, iconY, '', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 2
      })
      .setOrigin(0, 1)
      .setVisible(false);

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
    //   BARRA DE EXPERIENCIA (solo PanicMode)
    // ==========================
    if (mode === 'PANIC') {
      this.expBarBg = scene.add.rectangle(GAME_SIZE.WIDTH / 2, this.uiTop + 10, 200, 20, 0x333333, 1).setOrigin(0.5, 0);
      this.expBar = scene.add.rectangle(GAME_SIZE.WIDTH / 2, this.uiTop + 10, 0, 20, 0x00ff00, 1).setOrigin(0.5, 0);
      this.expBarLevelText = scene.add.text(GAME_SIZE.WIDTH / 2, this.uiTop + 35, 'Nivel 1', {
        fontFamily: 'Arial', fontSize: '18px', color: '#ffffff'
      }).setOrigin(0.5, 0);
      this.exp = 0;
      this.expMax = 100;
      this.expLevel = 1;
    }

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

    // Mostrar hasta 3 sprites según las vidas
    // Ejemplo:
    // 1 vida  -> 1 sprite
    // 2 vidas -> 2 sprites
    // 3 vidas -> 3 sprites
    // 4 vidas -> 3 sprites + X1
    // 5 vidas -> 3 sprites + X2
    const actualValue = value ?? 0;
    const visibleIcons = Math.min(3, actualValue);
    this.lifeIcons.forEach((icon, index) => {
      icon.setVisible(index < visibleIcons);
    });
    // Vidas extra (solo si hay más de 3)
    const extraLives = Math.max(0, actualValue - 3);
    if (extraLives > 0) {
      this.extraLivesText.setText(`X${extraLives}`);
      this.extraLivesText.setVisible(true);
    } else {
      this.extraLivesText.setVisible(false);
    }
  }

  // ===== MODO ARMA =====
  setMode(mode) {
    this.modeText.setText(`MODE: ${mode}`);
  }

  // ===== EXPERIENCIA (solo PanicMode) =====
  setExp(value) {
    if (!this.expBar) return;
    this.exp = Math.max(0, Math.min(this.expMax, value));
    this.expBar.width = (this.exp / this.expMax) * 200;
    this.expBarBg.width = 200;
    this.expBar.x = this.expBarBg.x;
    this.expBarBg.x = GAME_SIZE.WIDTH / 2;
    this.expBarLevelText.setText(`Nivel ${this.expLevel}`);
  }
  addExp(delta) {
    if (!this.expBar) return;
    this.setExp(this.exp + delta);
    if (this.exp >= this.expMax) {
      this.expLevel++;
      this.exp = 0;
      this.setExp(this.exp);
      this.expBarLevelText.setText(`Nivel ${this.expLevel}`);
      if (this.onExpLevelUp) this.onExpLevelUp(this.expLevel);
    }
  }
  resetExp() {
    if (!this.expBar) return;
    this.exp = 0;
    this.expLevel = 1;
    this.setExp(this.exp);
    this.expBarLevelText.setText(`Nivel ${this.expLevel}`);
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
    this.extraLivesText?.destroy();
    this.modeText?.destroy();
    this.scoreText?.destroy();
    this.expBar?.destroy();
    this.expBarBg?.destroy();
    this.expBarLevelText?.destroy();
  }
}

export default Hud;
