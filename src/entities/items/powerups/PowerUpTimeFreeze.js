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
    
    // Blue/cyan visual effect for time (sin animaciones que sobrescriben BaseItem)
    this.setTint(0x00CCFF);
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
    
    // Apply (and stack) time freeze effect using the scene manager
    if (scene && typeof scene.addTimeFreeze === 'function') {
      scene.addTimeFreeze(ITEMS.DURATION.TIME_FREEZE);
    } else {
      // Fallback (older scenes)
      this.freezeAllBalls(scene, ITEMS.DURATION.TIME_FREEZE);
    }
    
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
    let totalFrozen = 0;
    
    // Freeze balls
    if (scene.ballsGroup) {
      const balls = scene.ballsGroup.getChildren();
      totalFrozen += balls.length;
      
      balls.forEach(ball => {
        if (!ball || !ball.active || !ball.body) return;
        
        ball._frozenVelocity = {
          x: ball.body.velocity.x,
          y: ball.body.velocity.y
        };
        ball._frozenGravity = ball.body.gravity.y;
        
        ball.body.setVelocity(0, 0);
        ball.body.setGravityY(0);
        ball.body.setAllowGravity(false);
        ball.setTint(0x00FFFF);
        ball._isFrozen = true;
      });
    }
    
    // Freeze birds
    if (scene.birdsGroup) {
      const birds = scene.birdsGroup.getChildren();
      totalFrozen += birds.length;
      
      birds.forEach(bird => {
        if (!bird || !bird.active || !bird.body) return;
        
        bird._frozenVelocity = {
          x: bird.body.velocity.x,
          y: bird.body.velocity.y
        };
        bird._frozenGravity = bird.body.gravity.y;
        
        // Store freeze time to adjust startTime later
        bird._freezeTime = scene.time.now;
        
        bird.body.setVelocity(0, 0);
        bird.body.setGravityY(0);
        bird.body.setAllowGravity(false);
        bird.setTint(0x00FFFF);
        bird._isFrozen = true;
      });
    }
    
    console.log(`Freezing ${totalFrozen} entities for ${duration}ms`);
    
    if (totalFrozen === 0) {
      console.log('No entities to freeze');
      return;
    }
    
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
    // Unfreeze balls
    if (scene.ballsGroup) {
      const balls = scene.ballsGroup.getChildren();
      
      balls.forEach(ball => {
        if (!ball || !ball.active || !ball.body || !ball._isFrozen) return;
        
        if (ball._frozenVelocity) {
          ball.body.setVelocity(ball._frozenVelocity.x, ball._frozenVelocity.y);
          delete ball._frozenVelocity;
        }
        
        if (ball._frozenGravity !== undefined) {
          ball.body.setGravityY(ball._frozenGravity);
          ball.body.setAllowGravity(true);
          delete ball._frozenGravity;
        }
        
        ball.clearTint();
        if (ball.ballColor) {
          ball.setTint(ball.ballColor);
        }
        ball._isFrozen = false;
      });
    }
    
    // Unfreeze birds
    if (scene.birdsGroup) {
      const birds = scene.birdsGroup.getChildren();
      
      birds.forEach(bird => {
        if (!bird || !bird.active || !bird.body || !bird._isFrozen) return;
        
        // Adjust startTime to account for frozen duration
        if (bird.startTime !== undefined && bird._freezeTime !== undefined) {
          const frozenDuration = scene.time.now - bird._freezeTime;
          bird.startTime += frozenDuration;
          delete bird._freezeTime;
        }
        
        if (bird._frozenVelocity) {
          bird.body.setVelocity(bird._frozenVelocity.x, bird._frozenVelocity.y);
          delete bird._frozenVelocity;
        }
        
        if (bird._frozenGravity !== undefined) {
          bird.body.setGravityY(bird._frozenGravity);
          bird.body.setAllowGravity(true);
          delete bird._frozenGravity;
        }
        
        bird.clearTint();
        bird._isFrozen = false;
      });
    }
    
    console.log('Time freeze ended');
  }
}
