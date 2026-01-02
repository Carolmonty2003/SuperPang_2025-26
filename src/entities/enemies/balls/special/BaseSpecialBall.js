import { EVENTS } from '../../../../core/events.js';
import { BALL_COLORS, BALL_SCORES } from '../BallConstants.js';

/**
 * BaseSpecialBall - Special ball that changes sprite on floor bounce
 * 
 * Features:
 * - Doesn't split in half when hit (no nextBallType)
 * - Uses spritesheets with 2 frames: 0 = Clock (green), 1 = Star (orange)
 * - Switches between Clock and Star every time it bounces off the FLOOR
 * - Only has 2 sizes: Big and Mid (no splitting)
 */

export const SPECIAL_BALL_VARIANTS = {
  CLOCK: 0,  // Frame 0 - Green tint
  STAR: 1    // Frame 1 - Orange tint
};

export const SPECIAL_BALL_TINTS = {
  CLOCK: 0x00ff00,  // Green
  STAR: 0xff8800    // Orange
};

export class BaseSpecialBall extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, speedX, scoreValue = 50) {
    super(scene, x, y, texture);
    
    scene.add.existing(this);
    scene.physics.world.enable(this);

    // Special balls don't split
    this.nextBallType = null;
    this.speedX = speedX;
    this.scoreValue = scoreValue;
    this.minBounceSpeed = 150;

    // Variant tracking (Clock or Star)
    this.currentVariant = SPECIAL_BALL_VARIANTS.CLOCK; // Start with Clock
    this.setFrame(this.currentVariant);
    this.setTint(SPECIAL_BALL_TINTS.CLOCK);

    // Track floor bounces
    this.wasOnFloor = false;
    
    // Prevent multiple effect triggers
    this.isConsumed = false;

    // Configure collider - use radius based on texture size
    const radius = this.width * 0.5;
    this.body.setCircle(radius);
    
    // Center the circle
    this.body.setOffset(
      (this.width - radius * 2) / 2,
      (this.height - radius * 2) / 2
    );

    // Scale after to fill the collider
    this.setScale(2, 2);

    // Physics - perfect bounce
    this.body.setBounce(1, 1);
    this.body.setCollideWorldBounds(true);
    this.body.setGravityY(300);
    
    this.body.immovable = false;
    this.body.moves = true;
    
    // Remove drag and friction
    this.body.setDrag(0, 0);
    this.body.setMaxVelocity(10000, 10000);
    this.body.allowGravity = true;
    
    // Enable collision faces
    this.body.checkCollision.up = true;
    this.body.checkCollision.down = true;
    this.body.checkCollision.left = true;
    this.body.checkCollision.right = true;
    
    // Initial velocity
    this.body.setVelocityX(this.speedX);
    
    // Store previous velocity for bounce
    this._prevVelocity = { x: this.speedX, y: 0 };
  }
  
  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    
    if (!this.body) return;
    
    // Save velocity before collisions
    this._prevVelocity = {
      x: this.body.velocity.x,
      y: this.body.velocity.y
    };
    
    // Check if ball just bounced off the floor
    const isOnFloor = this.body.blocked.down || this.body.touching.down;
    
    if (isOnFloor && !this.wasOnFloor) {
      // Just landed on floor - switch variant!
      this.switchVariant();
    }
    
    this.wasOnFloor = isOnFloor;
    
    // Apply minimum bounce speed if necessary
    if (this.body.blocked.down || this.body.blocked.up) {
      const absVelY = Math.abs(this.body.velocity.y);
      if (absVelY < this.minBounceSpeed) {
        const direction = this.body.velocity.y > 0 ? 1 : -1;
        this.body.setVelocityY(this.minBounceSpeed * direction);
      }
    }
  }

  /**
   * Switch between Clock and Star variants
   */
  switchVariant() {
    // Toggle between 0 and 1
    this.currentVariant = this.currentVariant === SPECIAL_BALL_VARIANTS.CLOCK 
      ? SPECIAL_BALL_VARIANTS.STAR 
      : SPECIAL_BALL_VARIANTS.CLOCK;
    
    // Update sprite frame
    this.setFrame(this.currentVariant);
    
    // Update tint
    const newTint = this.currentVariant === SPECIAL_BALL_VARIANTS.CLOCK
      ? SPECIAL_BALL_TINTS.CLOCK
      : SPECIAL_BALL_TINTS.STAR;
    
    this.setTint(newTint);
    
    console.log(`Special ball switched to ${this.currentVariant === 0 ? 'CLOCK (green)' : 'STAR (orange)'}`);
  }

  takeDamage() {
    // Prevent multiple triggers
    if (this.isConsumed || !this.active) return;
    this.isConsumed = true;
    
    // Determine effect based on current frame/state
    const effectType = this.currentVariant === SPECIAL_BALL_VARIANTS.CLOCK ? 'CLOCK' : 'STAR';
    
    // Award base score
    if (this.scene && this.scene.game && this.scene.game.events) {
      this.scene.game.events.emit(EVENTS.game.SCORE_CHANGE, this.scoreValue);
    }
    
    // Trigger special effect based on state
    if (effectType === 'CLOCK') {
      this.triggerClockEffect();
    } else {
      this.triggerStarEffect();
    }
    
    // Special balls don't split - just destroy with effect
    this.playDestructionEffect();
    
    // Drop items if dropper exists
    if (this.scene.dropper) {
      this.scene.dropper.dropFrom(this, this.x, this.y);
    }
    
    this.destroy();
  }

  /**
   * Clock Effect: Time Stop
   * Freezes all active balls for a configurable duration
   */
  triggerClockEffect() {
    const duration = 3000; // 3 seconds time stop
    const bonusScore = 100; // Bonus for triggering Clock
    
    console.log('⏰ CLOCK EFFECT: Time Stop activated!');
    
    // Award bonus score for Clock effect
    if (this.scene && this.scene.game && this.scene.game.events) {
      this.scene.game.events.emit(EVENTS.game.SCORE_CHANGE, bonusScore);
    }
    
    // Trigger time stop on scene
    if (this.scene && typeof this.scene.activateTimeStop === 'function') {
      this.scene.activateTimeStop(duration);
    }
    
    // Visual feedback: green flash and text
    this.showEffectText('TIME STOP!', 0x00ff00);
  }

  /**
   * Star Effect: Burst Clear
   * Instantly destroys all balls on screen (except this one)
   */
  triggerStarEffect() {
    const bonusScore = 150; // Higher bonus for Star effect
    
    console.log('⭐ STAR EFFECT: Burst Clear activated!');
    
    // Award bonus score for Star effect
    if (this.scene && this.scene.game && this.scene.game.events) {
      this.scene.game.events.emit(EVENTS.game.SCORE_CHANGE, bonusScore);
    }
    
    // Trigger burst clear on scene
    if (this.scene && typeof this.scene.activateBurstClear === 'function') {
      this.scene.activateBurstClear(this); // Pass self to exclude from clear
    }
    
    // Visual feedback: orange flash and text
    this.showEffectText('BURST CLEAR!', 0xff8800);
  }

  /**
   * Show effect text on screen
   */
  showEffectText(text, color) {
    if (!this.scene) return;
    
    const effectText = this.scene.add.text(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY - 100,
      text,
      {
        fontFamily: 'Arial',
        fontSize: '48px',
        color: `#${color.toString(16).padStart(6, '0')}`,
        stroke: '#000000',
        strokeThickness: 6
      }
    ).setOrigin(0.5);
    
    effectText.setDepth(1000);
    effectText.setScrollFactor(0);
    
    // Animate text
    this.scene.tweens.add({
      targets: effectText,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => effectText.destroy()
    });
  }

  /**
   * Play destruction effect with particles/flash
   */
  playDestructionEffect() {
    if (!this.scene) return;
    
    // Color based on current state
    const color = this.currentVariant === SPECIAL_BALL_VARIANTS.CLOCK 
      ? 0x00ff00 
      : 0xff8800;
    
    // Create flash effect
    const flash = this.scene.add.circle(this.x, this.y, this.width * 2, color, 0.8);
    flash.setDepth(100);
    
    this.scene.tweens.add({
      targets: flash,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => flash.destroy()
    });
  }
}
