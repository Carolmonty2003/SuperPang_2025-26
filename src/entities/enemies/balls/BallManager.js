// src/entities/enemies/balls/BallManager.js
//
// Lee la capa de objetos "balls" del tilemap (Tiled) e instancia pelotas según su tipo.
//
// Tipos esperados (string en propiedad "type" del objeto):
//   Normales:     n_huge, n_big, n_mid, n_small, n_tiny
//   Hexagonales:  h_big, h_mid, h_small
//
// Propiedades opcionales por objeto:
//   dirX: -1 o 1 (si no existe, random)
//   dirY: -1 o 1 (solo hex; si no existe, random)
//   color: "random" o un valor numérico (0xRRGGBB) o string "#RRGGBB"

import { HugeBall } from './normal/HugeBall.js';
import { BigBall } from './normal/BigBall.js';
import { MidBall } from './normal/MidBall.js';
import { SmallBall } from './normal/SmallBall.js';
import { TinyBall } from './normal/TinyBall.js';

import { HexBigBall } from './hexagonal/HexBigBall.js';
import { HexMidBall } from './hexagonal/HexMidBall.js';
import { HexSmallBall } from './hexagonal/HexSmallBall.js';

import { BALL_COLORS } from './BallConstants.js';

export class BallManager {
  /**
   * @param {Phaser.Scene} scene
   * @param {Phaser.Tilemaps.Tilemap} map
   * @param {Phaser.Physics.Arcade.Group} ballsGroup
   */
  constructor(scene, map, ballsGroup) {
    this.scene = scene;
    this.map = map;
    this.ballsGroup = ballsGroup;
  }

  /**
   * Crea pelotas desde una capa de objetos.
   * @param {string} layerName
   */
  createFromObjectLayer(layerName = 'balls') {
    const layer = this.map.getObjectLayer(layerName);
    if (!layer || !layer.objects) {
      console.warn(`[BallManager] No existe la capa de objetos "${layerName}"`);
      return;
    }

    layer.objects.forEach(obj => {
      const type = this._getProp(obj, 'type') || obj.name;
      if (!type) return;

      const x = obj.x;
      const y = obj.y;

      const dirX = this._parseDir(this._getProp(obj, 'dirX'));
      const dirY = this._parseDir(this._getProp(obj, 'dirY'));
      const color = this._parseColor(this._getProp(obj, 'color'));

      const ball = this.spawnBall(type, x, y, dirX, dirY, color);
      if (ball && this.ballsGroup) {
        this.ballsGroup.add(ball);
      }
    });

    console.log(`[BallManager] Pelotas creadas desde capa "${layerName}" (${layer.objects.length})`);
  }

  /**
   * Instancia una pelota por tipo.
   * @param {string} type
   * @param {number} x
   * @param {number} y
   * @param {number|null} dirX
   * @param {number|null} dirY
   * @param {number|null} color
   */
  spawnBall(type, x, y, dirX = null, dirY = null, color = null) {
    const t = String(type).trim().toLowerCase();

    const finalDirX = dirX ?? (Phaser.Math.Between(0, 1) === 0 ? -1 : 1);
    const finalDirY = dirY ?? (Phaser.Math.Between(0, 1) === 0 ? -1 : 1);

    const finalColor = color ?? this._randomBallColor();

    switch (t) {
      // NORMAL
      case 'n_huge':
        return new HugeBall(this.scene, x, y, finalDirX, finalColor);
      case 'n_big':
        return new BigBall(this.scene, x, y, finalDirX, finalColor);
      case 'n_mid':
        return new MidBall(this.scene, x, y, finalDirX, finalColor);
      case 'n_small':
        return new SmallBall(this.scene, x, y, finalDirX, finalColor);
      case 'n_tiny':
        return new TinyBall(this.scene, x, y, finalDirX, finalColor);

      // HEX
      case 'h_big':
        return new HexBigBall(this.scene, x, y, finalDirX, finalDirY, finalColor);
      case 'h_mid':
        return new HexMidBall(this.scene, x, y, finalDirX, finalDirY, finalColor);
      case 'h_small':
        return new HexSmallBall(this.scene, x, y, finalDirX, finalDirY, finalColor);

      default:
        console.warn(`[BallManager] Tipo de pelota desconocido: ${type}`);
        return null;
    }
  }

  _getProp(obj, name) {
    if (!obj || !obj.properties) return undefined;
    const p = obj.properties.find(pp => String(pp.name).toLowerCase() === String(name).toLowerCase());
    return p ? p.value : undefined;
  }

  _parseDir(value) {
    if (value === undefined || value === null || value === '') return null;
    const n = Number(value);
    if (n === 1) return 1;
    if (n === -1) return -1;
    return null;
  }

  _parseColor(value) {
    if (value === undefined || value === null || value === '') return null;

    // "random"
    if (typeof value === 'string' && value.trim().toLowerCase() === 'random') {
      return this._randomBallColor();
    }

    // "#RRGGBB"
    if (typeof value === 'string' && value.trim().startsWith('#')) {
      const hex = value.trim().replace('#', '');
      const n = parseInt(hex, 16);
      return Number.isFinite(n) ? n : null;
    }

    // número
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  _randomBallColor() {
    const colors = Object.values(BALL_COLORS);
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

export default BallManager;
