import { BaseItem } from './BaseItem.js';

/**
 * PowerUpShield - Timed Invulnerability Item
 * 
 * Grants temporary invulnerability to the player.
 * 
 * DESIGN CHOICE: Timed Shield (5 seconds)
 * - Provides complete invulnerability for a fixed duration
 * - Does NOT stack (picking up multiple shields resets the timer)
 * - Visual indicator: cyan/blue glow around the hero
 * - Automatically reverts when duration expires
 */

export const SHIELD_CONFIG = {
  DURATION: 5000, // 5 seconds of invulnerability
  BLINK_INTERVAL: 200, // Visual feedback interval
  TINT_COLOR: 0x00FFFF // Cyan shield tint
};

export class PowerUpShield extends BaseItem {
  constructor(scene, x, y) {
    super(scene, x, y, 'item_shield', {
      itemType: 'SHIELD',
      ttl: 8000, // 8 seconds before despawn
      gravity: 400,
      bounce: 0.5
    });
    
    // Add shield visual effect (spinning shield icon)
    this.scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 1500,
      repeat: -1,
      ease: 'Linear'
    });
    
    // Add cyan glow
    this.setTint(SHIELD_CONFIG.TINT_COLOR);
  }

  /**
   * Grant shield protection to hero
   * @param {Hero} hero - The hero picking up this item
   */
  onPickup(hero) {
    // Apply shield using hero's method or manual implementation
    if (typeof hero.setShield === 'function') {
      hero.setShield(SHIELD_CONFIG.DURATION);
    } else {
      // Fallback: manual shield implementation
      this.applyShieldManually(hero);
    }
    
    // Show shield activated text
    const shieldText = this.scene.add.text(
      this.x,
      this.y - 20,
      'SHIELD!',
      {
        fontFamily: 'Arial',
        fontSize: '22px',
        color: '#00FFFF',
        stroke: '#000000',
        strokeThickness: 4
      }
    ).setOrigin(0.5);
    
    shieldText.setDepth(100);
    
    this.scene.tweens.add({
      targets: shieldText,
      y: shieldText.y - 60,
      alpha: 0,
      duration: 1000,
      ease: 'Cubic.easeOut',
      onComplete: () => shieldText.destroy()
    });
    
    // Optional: play sound
    // this.scene.sound.play('powerup_shield', { volume: 0.5 });
  }

  /**
   * Manual shield implementation if hero doesn't have setShield method
   * @param {Hero} hero - The hero to protect
   */
  applyShieldManually(hero) {
    // Clear any existing shield timer
    if (hero.shieldTimer) {
      hero.shieldTimer.destroy();
    }
    
    // Enable shield
    hero.hasShield = true;
    hero.isInvulnerable = true;
    
    // Visual feedback: cyan glow
    hero.setTint(SHIELD_CONFIG.TINT_COLOR);
    
    // Add pulsing effect
    const shieldPulse = this.scene.tweens.add({
      targets: hero,
      alpha: { from: 1, to: 0.7 },
      duration: SHIELD_CONFIG.BLINK_INTERVAL,
      yoyo: true,
      repeat: -1
    });
    
    // Set timer to remove shield
    hero.shieldTimer = this.scene.time.delayedCall(SHIELD_CONFIG.DURATION, () => {
      hero.hasShield = false;
      hero.isInvulnerable = false;
      hero.clearTint();
      hero.setAlpha(1);
      shieldPulse.stop();
      hero.shieldTimer = null;
      
      console.log('Shield expired');
    });
    
    console.log(`Shield activated for ${SHIELD_CONFIG.DURATION}ms`);
  }
}
