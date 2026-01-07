import { BaseItem } from '../BaseItem.js';

/**
 * PowerUpSpeed - Speed Boost Item
 * 
 * Temporarily increases the player's movement speed.
 * 
 * CONFIGURATION:
 * - Speed multiplier: 1.5x (50% faster)
 * - Duration: 8 seconds
 * - STACKING RULES: Resets timer (does NOT stack multipliers)
 *   Picking up multiple speed boosts extends the duration but doesn't
 *   make you faster than 1.5x speed.
 */

export const SPEED_CONFIG = {
  MULTIPLIER: 1.5, // 50% speed increase
  DURATION: 8000, // 8 seconds
  VISUAL_TINT: 0xFFFF00 // Yellow tint
};

export class PowerUpSpeed extends BaseItem {
  constructor(scene, x, y) {
    super(scene, x, y, 'item_speed', {
      itemType: 'SPEED_BOOST',
      ttl: 9000, // 9 seconds before despawn
      gravity: 500,
      bounce: 0.5
    });
    
    // Add lightning/speed visual effects
    this.setTint(SPEED_CONFIG.VISUAL_TINT);
    
    // Add zigzag motion effect
    this.scene.tweens.add({
      targets: this,
      scaleX: { from: 1.0, to: 1.3 },
      scaleY: { from: 1.0, to: 0.8 },
      duration: 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Apply speed boost to hero
   * @param {Hero} hero - The hero picking up this item
   */
  onPickup(hero) {
    // Apply speed buff using hero's method or manual implementation
    if (typeof hero.applySpeedBuff === 'function') {
      hero.applySpeedBuff(SPEED_CONFIG.MULTIPLIER, SPEED_CONFIG.DURATION);
    } else {
      // Fallback: manual speed buff implementation
      this.applySpeedBuffManually(hero);
    }
    
    // Show speed boost text
    const speedText = this.scene.add.text(
      this.x,
      this.y - 20,
      'SPEED UP!',
      {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#FFFF00',
        stroke: '#000000',
        strokeThickness: 4
      }
    ).setOrigin(0.5);
    
    speedText.setDepth(100);
    
    this.scene.tweens.add({
      targets: speedText,
      y: speedText.y - 60,
      alpha: 0,
      duration: 1000,
      ease: 'Cubic.easeOut',
      onComplete: () => speedText.destroy()
    });
    
    // Optional: play sound
    // this.scene.sound.play('powerup_speed', { volume: 0.5 });
  }

  /**
   * Manual speed buff implementation
   * @param {Hero} hero - The hero to buff
   */
  applySpeedBuffManually(hero) {
    // Store original speed if not already buffed
    if (!hero.originalSpeed) {
      hero.originalSpeed = hero.speed || 250; // Fallback to default
    }
    
    // Clear existing speed timer if any (reset duration, not stack)
    if (hero.speedBuffTimer) {
      hero.speedBuffTimer.destroy();
      console.log('Speed buff refreshed (timer reset)');
    } else {
      console.log('Speed buff applied');
    }
    
    // Apply speed multiplier
    const newSpeed = hero.originalSpeed * SPEED_CONFIG.MULTIPLIER;
    hero.speed = newSpeed;
    hero.moveSpeed = newSpeed; // Some implementations use moveSpeed
    
    // Visual feedback: yellow tint + trail effect
    hero.setTint(SPEED_CONFIG.VISUAL_TINT);
    
    // Optional: add particle trail effect
    // this.createSpeedTrail(hero);
    
    // Set timer to revert speed
    hero.speedBuffTimer = this.scene.time.delayedCall(SPEED_CONFIG.DURATION, () => {
      // Revert to original speed
      hero.speed = hero.originalSpeed;
      hero.moveSpeed = hero.originalSpeed;
      hero.clearTint();
      hero.speedBuffTimer = null;
      hero.originalSpeed = null;
      
      console.log('Speed buff expired');
    });
  }
}
