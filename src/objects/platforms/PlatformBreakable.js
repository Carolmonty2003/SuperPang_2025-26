import { PlatformBase } from './PlatformBase.js';

/**
 * PlatformBreakable - Breakable platform
 * 
 * Features:
 * - Breaks when hit by weapons
 * - Optional item drop on destruction
 */

export class PlatformBreakable extends PlatformBase {
  /**
   * @param {Phaser.Scene} scene - The game scene
   * @param {object} config - Platform configuration
   * @param {object|null} config.dropItem - Item drop config { type: 'FRUITS', variant: 'LARGE' } or null
   */
  constructor(scene, config) {
    super(scene, config);
    
    this.type = 'BREAKABLE';
    this.dropItem = config.dropItem || null;
    
    // Set collision properties on all tiles
    this.tiles.forEach(tile => {
      if (tile) {
        // Enable collision on all sides
        tile.setCollision(true, true, true, true);
        
        // Mark as breakable for collision detection
        tile.properties = tile.properties || {};
        tile.properties.breakable = true;
        
        // Apply fixed color tint
        tile.tint = this.color;
      }
    });
  }

  /**
   * Break the platform
   * @param {object} weapon - The weapon that hit the platform (optional)
   */
  break(weapon = null) {
    if (this.isDestroyed) return;
    
    const center = this.getCenterPosition();
    
    // Create break effect particles
    this.createBreakEffect(center.x, center.y);
    
    // Drop item if configured
    if (this.dropItem && this.scene.dropper) {
      this.spawnDrop(center.x, center.y);
    }
    
    // Destroy weapon if provided
    if (weapon && weapon.destroy && weapon.active) {
      weapon.destroy();
    }
    
    // Destroy platform
    super.destroy();
    
    console.log('Breakable platform destroyed at', center);
  }

  /**
   * Create visual break effect
   */
  createBreakEffect(x, y) {
    // Create particle burst (without rotation)
    const particles = this.scene.add.particles(x, y, 'bonus', {
      frame: 0,
      speed: { min: 50, max: 150 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      quantity: 8,
      angle: { min: 0, max: 360 },
      rotate: 0, // No rotation
      tint: this.color,
      blendMode: 'ADD'
    });
    
    // Auto-destroy particle emitter
    this.scene.time.delayedCall(700, () => {
      particles.destroy();
    });
    
    // Flash effect
    this.tiles.forEach(tile => {
      if (!tile) return;
      
      this.scene.tweens.add({
        targets: tile,
        alpha: 0,
        duration: 200,
        ease: 'Power2'
      });
    });
  }

  /**
   * Spawn item drop
   */
  spawnDrop(x, y) {
    if (!this.scene.dropper || !this.dropItem) return;
    
    try {
      this.scene.dropper.spawnSpecificItem(x, y, this.dropItem.type, this.dropItem.variant);
      console.log(`Dropped ${this.dropItem.type} at platform location`);
    } catch (error) {
      console.warn('Failed to spawn drop:', error);
    }
  }

  /**
   * Update shimmer effect
   */
  update(time, delta) {
    if (this.isDestroyed) return;
    
    this.shimmerTime += delta * 0.001; // Convert to seconds
  }
}
