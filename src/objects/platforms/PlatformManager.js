/**
 * PlatformManager - Manages all platforms in the scene
 * 
 * Handles creation, updates, and collision detection for platforms.
 */

import { PlatformStatic } from './PlatformStatic.js';
import { PlatformBreakable } from './PlatformBreakable.js';

export class PlatformManager {
  /**
   * @param {Phaser.Scene} scene - The game scene
   * @param {Phaser.Tilemaps.Tilemap} map - The tilemap
   * @param {Phaser.Tilemaps.TilemapLayer} layer - The platform layer
   */
  constructor(scene, map, layer) {
    this.scene = scene;
    this.map = map;
    this.layer = layer;
    
    this.platforms = [];
    this.staticPlatforms = [];
    this.breakablePlatforms = [];
  }

  /**
   * Create a static platform
   * @param {number} x - Tile X coordinate
   * @param {number} y - Tile Y coordinate
   * @param {Array<number>} pattern - Tile pattern [0,1,1,2] or [6]
   * @param {number} color - Color tint
   */
  createStaticPlatform(x, y, pattern, color = 0xFFFFFF) {
    const platform = new PlatformStatic(this.scene, {
      x, y, pattern, color,
      map: this.map,
      layer: this.layer
    });
    
    this.platforms.push(platform);
    this.staticPlatforms.push(platform);
    
    return platform;
  }

  /**
   * Create a breakable platform
   * @param {number} x - Tile X coordinate
   * @param {number} y - Tile Y coordinate
   * @param {Array<number>} pattern - Tile pattern [0,1,1,2] or [6]
   * @param {number} color - Color tint
   * @param {object|null} dropItem - Drop configuration or null
   */
  createBreakablePlatform(x, y, pattern, color = 0xFFFFFF, dropItem = null) {
    const platform = new PlatformBreakable(this.scene, {
      x, y, pattern, color,
      map: this.map,
      layer: this.layer,
      dropItem
    });
    
    this.platforms.push(platform);
    this.breakablePlatforms.push(platform);
    
    return platform;
  }

  /**
   * Update all platforms
   */
  update(time, delta) {
    this.platforms.forEach(platform => {
      if (!platform.isDestroyed && platform.update) {
        platform.update(time, delta);
      }
    });
    
    // Clean up destroyed platforms
    this.platforms = this.platforms.filter(p => !p.isDestroyed);
    this.breakablePlatforms = this.breakablePlatforms.filter(p => !p.isDestroyed);
  }

  /**
   * Handle weapon collision with platform
   * @param {object} weapon - The weapon sprite
   * @param {Phaser.Tilemaps.Tile} tile - The tile that was hit
   */
  onWeaponHitPlatform(weapon, tile) {
    if (!tile || !tile.properties) return;
    
    const platform = tile.properties.platform;
    
    if (platform && platform.type === 'BREAKABLE' && !platform.isDestroyed) {
      platform.break(weapon);
    }
  }

  /**
   * Get all breakable platform tiles for collision detection
   */
  getBreakableTiles() {
    return this.breakablePlatforms.flatMap(p => p.tiles).filter(t => t);
  }

  /**
   * Example: Create platforms from level data
   */
  createExamplePlatforms() {
    // Example: 4-tile static platform (gray)
    this.createStaticPlatform(10, 10, [0, 1, 1, 2], 0x808080);
    
    // Example: Single tile breakable platform (cyan glass)
    this.createBreakablePlatform(15, 12, [6], 0x00FFFF, {
      type: 'FRUITS',
      variant: 'LARGE'
    });
    
    // Example: 3-tile breakable platform (red glass, no drop)
    this.createBreakablePlatform(8, 15, [0, 1, 2], 0xFF4444, null);
  }
}
