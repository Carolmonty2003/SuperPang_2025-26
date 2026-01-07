import { BaseItem } from '../BaseItem.js';
import { ITEMS } from '../../../core/constants.js';

/**
 * PowerUpTimeSlow - Slow Motion Item (Reloj de Arena / Hourglass)
 * 
 * Slows down all balls to a fraction of their normal speed.
 * Balls continue moving but much slower, making them easier to hit.
 * Effect lasts for a duration before returning to normal speed.
 */

export class PowerUpTimeSlow extends BaseItem {
  constructor(scene, x, y) {
    super(scene, x, y, 'bonus', {
      itemType: 'TIME_SLOW',
      ttl: ITEMS.TTL.TIME_SLOW,
      gravity: 450,
      bounce: 0.5
    });
    
    // Set to hourglass frame (frame 7)
    this.setFrame(7);
    
    // Yellow/orange visual effect for hourglass
    this.setTint(0xFFCC00);
    
    // Pulsing animation
    this.scene.tweens.add({
      targets: this,
      scale: { from: 1.0, to: 1.15 },
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Flip animation (hourglass turning)
    this.scene.tweens.add({
      targets: this,
      angle: { from: 0, to: 180 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Activate slow motion effect
   * @param {Hero} hero - The hero picking up this item
   */
  onPickup(hero) {
    const scene = this.scene;
    
    // Show slow motion text
    const slowText = scene.add.text(
      scene.cameras.main.centerX,
      scene.cameras.main.centerY - 100,
      'SLOW MOTION!',
      {
        fontFamily: 'Arial',
        fontSize: '42px',
        color: '#FFCC00',
        stroke: '#FF6600',
        strokeThickness: 7
      }
    ).setOrigin(0.5);
    
    slowText.setDepth(1000);
    slowText.setScrollFactor(0);
    
    scene.tweens.add({
      targets: slowText,
      y: slowText.y - 70,
      alpha: 0,
      duration: 2000,
      ease: 'Cubic.easeOut',
      onComplete: () => slowText.destroy()
    });
    
    // Apply slow motion effect
    this.slowAllBalls(scene, ITEMS.DURATION.TIME_SLOW, ITEMS.MULTIPLIER.SLOW_MOTION);
    
    // Optional: Screen tint effect
    const tintOverlay = scene.add.rectangle(
      scene.cameras.main.centerX,
      scene.cameras.main.centerY,
      scene.cameras.main.width,
      scene.cameras.main.height,
      0xFFCC00,
      0.15
    );
    tintOverlay.setDepth(998);
    tintOverlay.setScrollFactor(0);
    
    scene.time.delayedCall(ITEMS.DURATION.TIME_SLOW, () => {
      scene.tweens.add({
        targets: tintOverlay,
        alpha: 0,
        duration: 500,
        onComplete: () => tintOverlay.destroy()
      });
    });
    
    // Optional: play sound
    // scene.sound.play('time_slow', { volume: 0.5 });
  }

  /**
   * Slow down all balls on screen
   * @param {Phaser.Scene} scene - The game scene
   * @param {number} duration - Duration of slow effect in milliseconds
   * @param {number} slowMultiplier - Speed multiplier (e.g., 0.4 = 40% speed)
   */
  slowAllBalls(scene, duration, slowMultiplier) {
    if (!scene.ballsGroup) {
      console.warn('No ballsGroup found in scene for time slow');
      return;
    }
    
    const balls = scene.ballsGroup.getChildren();
    
    if (balls.length === 0) {
      console.log('No balls to slow down');
      return;
    }
    
    console.log(`Slowing ${balls.length} balls to ${slowMultiplier * 100}% speed for ${duration}ms`);
    
    balls.forEach(ball => {
      if (!ball || !ball.active || !ball.body) return;
      
      // Skip if already slowed
      if (ball._isSlowed) return;
      
      // Store original velocity
      ball._originalVelocity = {
        x: ball.body.velocity.x,
        y: ball.body.velocity.y
      };
      
      // Apply slow motion
      ball.body.setVelocity(
        ball.body.velocity.x * slowMultiplier,
        ball.body.velocity.y * slowMultiplier
      );
      
      // Store original speed for future use
      if (ball.speedX !== undefined) {
        ball._originalSpeedX = ball.speedX;
        ball.speedX *= slowMultiplier;
      }
      
      // Visual feedback - orange tint
      ball.setTint(0xFFAA44);
      
      // Mark as slowed
      ball._isSlowed = true;
      ball._slowMultiplier = slowMultiplier;
    });
    
    // Restore normal speed after duration
    scene.time.delayedCall(duration, () => {
      this.restoreNormalSpeed(scene);
    });
  }

  /**
   * Restore normal speed to all balls
   * @param {Phaser.Scene} scene - The game scene
   */
  restoreNormalSpeed(scene) {
    if (!scene.ballsGroup) return;
    
    const balls = scene.ballsGroup.getChildren();
    
    balls.forEach(ball => {
      if (!ball || !ball.active || !ball.body || !ball._isSlowed) return;
      
      // Restore velocity by dividing by the slow multiplier
      const multiplier = ball._slowMultiplier || ITEMS.MULTIPLIER.SLOW_MOTION;
      ball.body.setVelocity(
        ball.body.velocity.x / multiplier,
        ball.body.velocity.y / multiplier
      );
      
      // Restore original speed
      if (ball._originalSpeedX !== undefined) {
        ball.speedX = ball._originalSpeedX;
        delete ball._originalSpeedX;
      }
      
      // Clear tint
      ball.clearTint();
      
      // Restore original tint if it had one
      if (ball.ballColor) {
        ball.setTint(ball.ballColor);
      }
      
      // Unmark slowed
      ball._isSlowed = false;
      delete ball._slowMultiplier;
      delete ball._originalVelocity;
    });
    
    console.log('Slow motion effect ended');
  }
}
