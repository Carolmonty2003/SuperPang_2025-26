import { BaseItem } from '../BaseItem.js';
import { ITEMS } from '../../../core/constants.js';

/**
 * PowerUpTimeFreeze - Time Stop Item (Reloj / Clock)
 * 
 * Freezes all balls in place for a duration.
 * Similar to the special ball time freeze effect.
 * Balls remain suspended in mid-air until effect expires.
 */

export class PowerUpTimeFreeze extends BaseItem {
  constructor(scene, x, y) {
    super(scene, x, y, 'bonus', {
      itemType: 'TIME_FREEZE',
      ttl: ITEMS.TTL.TIME_FREEZE,
      gravity: 450,
      bounce: 0.5
    });
    
    // Set to clock frame (frame 6)
    this.setFrame(6);
    
    // Blue/cyan visual effect for time
    this.setTint(0x00CCFF);
    
    // Pulsing animation
    this.scene.tweens.add({
      targets: this,
      scale: { from: 1.0, to: 1.2 },
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Slow rotation
    this.scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 3000,
      repeat: -1,
      ease: 'Linear'
    });
  }

  /**
   * Activate time freeze effect
   * @param {Hero} hero - The hero picking up this item
   */
  onPickup(hero) {
    const scene = this.scene;
    
    // Show time freeze text
    const freezeText = scene.add.text(
      scene.cameras.main.centerX,
      scene.cameras.main.centerY - 100,
      'TIME FREEZE!',
      {
        fontFamily: 'Arial',
        fontSize: '48px',
        color: '#00FFFF',
        stroke: '#0000FF',
        strokeThickness: 8
      }
    ).setOrigin(0.5);
    
    freezeText.setDepth(1000);
    freezeText.setScrollFactor(0);
    
    scene.tweens.add({
      targets: freezeText,
      scale: { from: 0.5, to: 1.5 },
      alpha: 0,
      duration: 2000,
      ease: 'Cubic.easeOut',
      onComplete: () => freezeText.destroy()
    });
    
    // Apply time freeze effect
    this.freezeAllBalls(scene, ITEMS.DURATION.TIME_FREEZE);
    
    // Optional: Camera flash effect
    scene.cameras.main.flash(200, 100, 200, 255);
    
    // Optional: play sound
    // scene.sound.play('time_freeze', { volume: 0.6 });
  }

  /**
   * Freeze all balls on screen
   * @param {Phaser.Scene} scene - The game scene
   * @param {number} duration - Duration of freeze in milliseconds
   */
  freezeAllBalls(scene, duration) {
    if (!scene.ballsGroup) {
      console.warn('No ballsGroup found in scene for time freeze');
      return;
    }
    
    const balls = scene.ballsGroup.getChildren();
    
    if (balls.length === 0) {
      console.log('No balls to freeze');
      return;
    }
    
    console.log(`Freezing ${balls.length} balls for ${duration}ms`);
    
    balls.forEach(ball => {
      if (!ball || !ball.active || !ball.body) return;
      
      // Store original velocity
      ball._frozenVelocity = {
        x: ball.body.velocity.x,
        y: ball.body.velocity.y
      };
      
      // Store original gravity
      ball._frozenGravity = ball.body.gravity.y;
      
      // Freeze the ball
      ball.body.setVelocity(0, 0);
      ball.body.setGravityY(0);
      ball.body.setAllowGravity(false);
      
      // Visual feedback - cyan tint
      ball.setTint(0x00FFFF);
      
      // Mark as frozen
      ball._isFrozen = true;
    });
    
    // Unfreeze after duration
    scene.time.delayedCall(duration, () => {
      this.unfreezeAllBalls(scene);
    });
  }

  /**
   * Unfreeze all balls
   * @param {Phaser.Scene} scene - The game scene
   */
  unfreezeAllBalls(scene) {
    if (!scene.ballsGroup) return;
    
    const balls = scene.ballsGroup.getChildren();
    
    balls.forEach(ball => {
      if (!ball || !ball.active || !ball.body || !ball._isFrozen) return;
      
      // Restore velocity
      if (ball._frozenVelocity) {
        ball.body.setVelocity(ball._frozenVelocity.x, ball._frozenVelocity.y);
        delete ball._frozenVelocity;
      }
      
      // Restore gravity
      if (ball._frozenGravity !== undefined) {
        ball.body.setGravityY(ball._frozenGravity);
        ball.body.setAllowGravity(true);
        delete ball._frozenGravity;
      }
      
      // Clear tint
      ball.clearTint();
      
      // Restore original tint if it had one
      if (ball.ballColor) {
        ball.setTint(ball.ballColor);
      }
      
      // Unmark frozen
      ball._isFrozen = false;
    });
    
    console.log('Time freeze ended');
  }
}
