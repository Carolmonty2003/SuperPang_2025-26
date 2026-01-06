import { PlatformBase } from './PlatformBase.js';

/**
 * PlatformBreakable - Breakable platform with crystal glass effect
 * 
 * Features:
 * - Breaks when hit by weapons
 * - Shimmering/glittering crystal effect
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
    
    // Glass shimmer effect properties
    this.shimmerTime = 0;
    this.shimmerSpeed = 2; // Speed of shimmer animation
    this.shimmerIntensity = 0.3; // How much alpha varies
    
    // Set collision properties on all tiles
    this.tiles.forEach(tile => {
      if (tile) {
        // Enable collision on all sides
        tile.setCollision(true, true, true, true);
        
        // Mark as breakable for collision detection
        tile.properties = tile.properties || {};
        tile.properties.breakable = true;
      }
    });
    
    // Start shimmer effect
    this.startShimmerEffect();
  }

  /**
   * Create subtle shimmering glass effect
   */
  startShimmerEffect() {
    const baseColor = 0x00FFFF; // Cyan color fixed
    
    // Apply shimmer to all tiles simultaneously
    this.tiles.forEach((tile) => {
      if (!tile) return;
      
      // Set initial color
      tile.tint = baseColor;
      
      // Simple tween from cyan to white
      this.scene.tweens.add({
        targets: tile,
        tint: 0xFFFFFF, // White
        duration: 2500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
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
