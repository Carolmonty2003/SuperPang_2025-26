// src/UI/Hud.js

import { GAME_SIZE } from '../core/constants.js';
import { EVENTS } from '../core/events.js';

export class Hud {
  constructor(scene, { uiTop, mode = 'HARPOON' } = {}) {
    this.scene = scene;
    this.events = scene.game.events;

    const mapHeight = scene.walls?.height || scene.physics.world.bounds.height;
    this.uiTop = uiTop ?? mapHeight;
    this.uiHeight = GAME_SIZE.HEIGHT - this.uiTop;

    this.background = scene.add
      .rectangle(0, this.uiTop, GAME_SIZE.WIDTH, this.uiHeight, 0x000000, 1)
      .setOrigin(0);

    this.lives = 0;
    this.livesText = scene.add
      .text(24, this.uiTop + 18, 'LIVES: 0', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0, 0.5);

    this.modeText = scene.add
      .text(GAME_SIZE.WIDTH / 2, this.uiTop + 18, `MODE: ${mode}`, {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0.5, 0.5);

    this.score = 0;
    this.scoreText = scene.add
      .text(GAME_SIZE.WIDTH - 24, this.uiTop + 18, 'SCORE: 00', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(1, 0.5);

    this.events.on(EVENTS.game.SCORE_CHANGE, this.onScoreChange, this);
    this.events.on(EVENTS.hero.READY, this.onHeroReady, this);
    this.events.on(EVENTS.hero.DAMAGED, this.onHeroDamaged, this);

    // LISTENER NUEVO
    this.events.on('UI_WEAPON_CHANGE', (modeTxt) => {
      this.setMode(modeTxt);
    });

    scene.events.on(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    scene.events.on(Phaser.Scenes.Events.DESTROY, this.destroy, this);
  }

  onScoreChange(delta) {
    this.score += delta;
    const padded = this.score.toString().padStart(2, '0');
    this.scoreText.setText(`SCORE: ${padded}`);
  }

  onHeroReady(hero) {
    this.hero = hero;
    this.setLives(hero.lives ?? 0);
  }

  onHeroDamaged(remainingLives) {
    this.setLives(remainingLives);
  }

  setLives(value) {
    this.lives = value;
    this.livesText.setText(`LIVES: ${value}`);
  }

  setMode(mode) {
    this.modeText.setText(`MODE: ${mode}`);
  }

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
    this.livesText?.destroy();
    this.modeText?.destroy();
    this.scoreText?.destroy();
  }
}

export default Hud;
