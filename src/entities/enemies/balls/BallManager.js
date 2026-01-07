// src/entities/enemies/balls/BallManager.js

import { HugeBall } from './normal/HugeBall.js';
import { BigBall } from './normal/BigBall.js';
import { MidBall } from './normal/MidBall.js';
import { SmallBall } from './normal/SmallBall.js';
import { TinyBall } from './normal/TinyBall.js';

import { HexBigBall } from './hexagonal/HexBigBall.js';
import { HexMidBall } from './hexagonal/HexMidBall.js';
import { HexSmallBall } from './hexagonal/HexSmallBall.js';

import { BALL_COLORS } from './BallConstants.js';
import { EVENTS } from '../../../core/events.js';

export class BallManager {
  constructor(scene, map, ballsGroup) {
    this.scene = scene;
    this.map = map;
    this.ballsGroup = ballsGroup;
  }

  createFromObjectLayer(layerName = 'balls') {
    const layer = this.map.getObjectLayer(layerName);
    if (!layer?.objects) return;

    layer.objects.forEach(obj => {
      const type = obj.properties?.find(p => p.name === 'type')?.value ?? obj.name;
      if (!type) return;

      const dirX = this._numProp(obj, 'dirX');
      const speed = this._numProp(obj, 'initialSpeed');
      const color = this._parseColor(this._getProp(obj, 'color'));

      const ball = this.spawnBall(
        type,
        obj.x,
        obj.y,
        dirX,
        speed,
        color
      );

      if (ball) this.ballsGroup.add(ball);
    });
  }

  spawnBall(type, x, y, dirX, initialSpeed, color) {
    const finalDirX = dirX ?? Phaser.Math.Between(0, 1) ? 1 : -1;
    const finalSpeed = initialSpeed ?? undefined;
    const finalColor = color ?? this._randomBallColor();

    let ball;
    switch (type.toLowerCase()) {
      case 'n_huge': ball = new HugeBall(this.scene, x, y, finalDirX, finalColor, finalSpeed); break;
      case 'n_big': ball = new BigBall(this.scene, x, y, finalDirX, finalColor, finalSpeed); break;
      case 'n_mid': ball = new MidBall(this.scene, x, y, finalDirX, finalColor, finalSpeed); break;
      case 'n_small': ball = new SmallBall(this.scene, x, y, finalDirX, finalColor, finalSpeed); break;
      case 'n_tiny': ball = new TinyBall(this.scene, x, y, finalDirX, finalColor, finalSpeed); break;

      case 'h_big': ball = new HexBigBall(this.scene, x, y, finalDirX, -1, finalColor, finalSpeed); break;
      case 'h_mid': ball = new HexMidBall(this.scene, x, y, finalDirX, -1, finalColor, finalSpeed); break;
      case 'h_small': ball = new HexSmallBall(this.scene, x, y, finalDirX, -1, finalColor, finalSpeed); break;
      default: ball = null;
    }
    // Emit BALL_CREATED event
    if (ball && this.scene && this.scene.game && this.scene.game.events) {
      this.scene.game.events.emit(EVENTS.enemy.BALL_CREATED, ball);
    }
    return ball;
  }

  _getProp(obj, name) {
    return obj.properties?.find(p => p.name === name)?.value ?? null;
  }

  _numProp(obj, name) {
    const v = Number(this._getProp(obj, name));
    return Number.isFinite(v) ? v : null;
  }

  _parseColor(value) {
    if (!value || value === 'random') return null;
    return typeof value === 'string' ? Number(value.replace('#', '0x')) : value;
  }

  _randomBallColor() {
    const colors = Object.values(BALL_COLORS);
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

export default BallManager;
