import { EVENTS } from '../../../core/events.js';

/**
 * BaseBird - Flying enemy with looping movement pattern
 * 
 * Birds enter from top-left, perform a complete loop (pirueta),
 * then exit towards top-right.
 * 
 * Movement pattern:
 * 1. Spawn top-left
 * 2. Descend in arc
 * 3. PERFORM COMPLETE LOOP (360° rotation)
 * 4. Ascend and exit top-right
 */

export class BaseBird extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, speedX, scoreValue = 100) {
    super(scene, x, y, texture);
    
    scene.add.existing(this);
    scene.physics.world.enable(this);

    this.speedX = Math.abs(speedX);
    this.scoreValue = scoreValue;
    
    // Bird states
    this.isFlying = true;
    this.isFalling = false;
    this.isDead = false;
    
    // Looping movement state
    this.loopPhase = 'DESCENDING'; // DESCENDING, LOOPING, ASCENDING
    
    // Movement parameters
    this.startX = x;
    this.startY = y;
    this.startTime = scene.time.now;
    
    // Looping configuration
    this.loopCenterX = x + 400; // Center of loop (400px to the right)
    this.loopCenterY = y + 300; // Center of loop (300px down)
    this.loopRadius = 150;      // Radius of the loop
    
    // Full path duration (in milliseconds)
    this.totalDuration = 5000;  // 5 seconds for complete path
    this.descendDuration = 1500; // 1.5s to reach loop
    this.loopDuration = 2000;    // 2s for complete loop
    this.ascendDuration = 1500;  // 1.5s to exit
    
    // Progress tracking (0 to 1)
    this.pathProgress = 0;

    // Configure sprite
    this.setScale(2, 2);
    
    // Create animation
    this.createAnimation(texture);
    
    // Play animation
    const animKey = `${texture}_fly`;
    if (this.scene.anims.exists(animKey)) {
      this.play(animKey);
    }

    // Physics - custom movement, no standard physics
    this.body.setAllowGravity(false);
    this.body.setGravityY(0);
    this.body.setBounce(0, 0);
    this.body.setCollideWorldBounds(false);
    this.body.onWorldBounds = false;
    
    this.body.immovable = false;
    this.body.moves = true;
    this.body.setDrag(0, 0);
    this.body.setMaxVelocity(10000, 10000);
    
    // Hitbox - smaller than sprite
    const hitboxWidth = this.width * 0.6;
    const hitboxHeight = this.height * 0.6;
    this.body.setSize(hitboxWidth, hitboxHeight);
    this.body.setOffset(
      (this.width - hitboxWidth) / 2,
      (this.height - hitboxHeight) / 2
    );
    
    // Disable collision while flying
    this.body.checkCollision.down = false;
    this.body.checkCollision.up = false;
    this.body.checkCollision.left = false;
    this.body.checkCollision.right = false;
    
    // Track if we've already dropped an item
    this.hasDroppedItem = false;
    
    // Initial flip direction
    this.setFlipX(false);
  }

  /**
   * Create fly animation
   */
  createAnimation(texture) {
    const animKey = `${texture}_fly`;
    
    if (!this.scene.anims.exists(animKey)) {
      const textureFrames = this.scene.textures.get(texture).getFrameNames();
      
      if (textureFrames.length > 1) {
        this.scene.anims.create({
          key: animKey,
          frames: this.scene.anims.generateFrameNumbers(texture, { start: 0, end: textureFrames.length - 1 }),
          frameRate: 10,
          repeat: -1
        });
      } else {
        this.scene.anims.create({
          key: animKey,
          frames: [{ key: texture, frame: 0 }],
          frameRate: 1,
          repeat: -1
        });
      }
    }
  }

  /**
   * Calculate position along the looping path
   */
  updateLoopingMovement() {
    if (!this.isFlying || this.isFalling) return;
    
    // STOP MOVEMENT IF FROZEN
    if (this._isFrozen) return;
    
    // Safety check: ensure scene and time exist
    if (!this.scene || !this.scene.time) return;
    
    const now = this.scene.time.now;
    const elapsed = now - this.startTime;
    
    // Calculate overall progress (0 to 1)
    this.pathProgress = Math.min(elapsed / this.totalDuration, 1);
    
    let newX, newY;
    
    // PHASE 1: DESCENDING (0% - 30%)
    if (this.pathProgress < 0.3) {
      this.loopPhase = 'DESCENDING';
      const phaseProgress = this.pathProgress / 0.3; // 0 to 1 within this phase
      const eased = this.easeInOutQuad(phaseProgress);
      
      // Bezier curve from start to loop entry (RIGHT SIDE of loop for continuity)
      const entryX = this.loopCenterX + this.loopRadius; // RIGHT side of loop (angle 0)
      const entryY = this.loopCenterY; // Middle height of loop
      
      // Control point for smooth curve
      const controlX = this.startX + 200;
      const controlY = this.startY + 200;
      
      // Quadratic bezier
      newX = this.quadraticBezier(this.startX, controlX, entryX, eased);
      newY = this.quadraticBezier(this.startY, controlY, entryY, eased);
      
      this.setFlipX(false); // Facing right
    }
    // PHASE 2: LOOPING (30% - 70%)
    else if (this.pathProgress < 0.7) {
      this.loopPhase = 'LOOPING';
      const phaseProgress = (this.pathProgress - 0.3) / 0.4; // 0 to 1 within this phase
      
      // Complete 360° loop starting from RIGHT side
      // Start at right side (0°), go counterclockwise to complete loop
      const startAngle = 0; // 0° (right side)
      const angle = startAngle + (phaseProgress * Math.PI * 2); // Full 360° rotation counterclockwise
      
      newX = this.loopCenterX + Math.cos(angle) * this.loopRadius;
      newY = this.loopCenterY + Math.sin(angle) * this.loopRadius;
      
      // Rotate sprite to follow path
      const visualAngle = (angle * 180 / Math.PI) - 90; // Offset for sprite orientation
      this.setAngle(visualAngle);
      
      // Flip based on loop position (flip when going left/upside down)
      if (angle > Math.PI / 2 && angle < 3 * Math.PI / 2) {
        this.setFlipX(true); // Left/top side of loop
      } else {
        this.setFlipX(false); // Right/bottom side of loop
      }
    }
    // PHASE 3: ASCENDING (70% - 100%)
    else {
      this.loopPhase = 'ASCENDING';
      const phaseProgress = (this.pathProgress - 0.7) / 0.3; // 0 to 1 within this phase
      const eased = this.easeInOutQuad(phaseProgress);
      
      // Reset rotation
      this.setAngle(0);
      
      // Start from loop exit (RIGHT side - where loop ended)
      const loopExitX = this.loopCenterX + this.loopRadius;
      const loopExitY = this.loopCenterY;
      
      // Exit point (top-right, continuing the trajectory)
      const exitX = loopExitX + 300; // Continue to the right
      const exitY = this.startY - 50; // Go up (higher than start)
      
      // Control point for smooth upward curve
      const controlX = loopExitX + 150;
      const controlY = loopExitY - 100;
      
      // Quadratic bezier
      newX = this.quadraticBezier(loopExitX, controlX, exitX, eased);
      newY = this.quadraticBezier(loopExitY, controlY, exitY, eased);
      
      this.setFlipX(false); // Facing right
    }
    
    // Update position
    this.setPosition(newX, newY);
    
    // Calculate velocity for physics body (needed for collision detection)
    const deltaX = newX - this.x;
    const deltaY = newY - this.y;
    this.body.setVelocity(deltaX * 60, deltaY * 60); // Approximate velocity
    
    // Check if path is complete
    if (this.pathProgress >= 1) {
      console.log('Bird completed looping path, exiting');
      this.destroy();
    }
  }

  /**
   * Quadratic Bezier curve calculation
   * P(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
   */
  quadraticBezier(p0, p1, p2, t) {
    const oneMinusT = 1 - t;
    return oneMinusT * oneMinusT * p0 + 
           2 * oneMinusT * t * p1 + 
           t * t * p2;
  }

  /**
   * Easing function for smooth movement
   */
  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  /**
   * Check if bird is out of bounds
   */
  checkOutOfBounds() {
    // Safety check: ensure scene and physics exist
    if (!this.scene || !this.scene.physics || !this.scene.physics.world) {
      return false;
    }
    
    const bounds = this.scene.physics.world.bounds;
    const buffer = 200;
    
    if (this.x < -buffer || this.x > bounds.width + buffer ||
        this.y < -buffer || this.y > bounds.height + buffer) {
      // console.log('Bird out of bounds'); // Comentado para evitar spam
      this.destroy();
      return true;
    }
    
    return false;
  }

  /**
   * Called each frame
   */
  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    
    // Safety checks
    if (!this.scene || !this.body || this.isDead) return;
    
    if (this.isFlying) {
      // Update looping movement pattern
      this.updateLoopingMovement();
      
      // Check if out of bounds
      this.checkOutOfBounds();
    } 
    else if (this.isFalling) {
      // Check if bird hit the ground
      if (this.body.blocked.down || this.body.touching.down) {
        this.destroyBird();
      }
    }
  }

  /**
   * Bird takes damage from weapon
   */
  takeDamage() {
    if (this.isDead || this.isFalling) return;
    
    console.log(`Bird hit! Falling...`);
    
    // Show floating score
    this.showFloatingScore();
    
    // Award points
    if (this.scene && this.scene.game && this.scene.game.events) {
      this.scene.game.events.emit(EVENTS.game.SCORE_CHANGE, this.scoreValue);
    }
    
    // Drop item ONCE
    if (!this.hasDroppedItem && this.scene.dropper) {
      this.scene.dropper.dropFrom(this, this.x, this.y);
      this.hasDroppedItem = true;
    }
    
    // Switch to falling mode
    this.isFlying = false;
    this.isFalling = true;
    this.loopPhase = 'FALLING';
    
    // Reset rotation
    this.setAngle(0);
    
    // Enable gravity
    this.body.setAllowGravity(true);
    this.body.setGravityY(600);
    
    // Enable collision with ground
    this.body.checkCollision.down = true;
    this.body.checkCollision.up = true;
    this.body.setCollideWorldBounds(true);
    
    // Stop horizontal movement
    this.body.setVelocityX(0);
    
    // Visual feedback - tint red
    this.setTint(0xff0000);
    
    // Stop flying animation
    this.anims.stop();
    if (this.anims.currentAnim) {
      const lastFrame = this.anims.currentAnim.frames.length - 1;
      this.setFrame(lastFrame);
    }
  }

  /**
   * Show floating score text
   */
  showFloatingScore() {
    // Safety check
    if (!this.scene || !this.scene.add || !this.scene.tweens) return;
    
    const scoreText = this.scene.add.text(this.x, this.y, `+${this.scoreValue}`, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#00FFFF',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });
    
    scoreText.setOrigin(0.5, 0.5);
    scoreText.setDepth(100);
    
    this.scene.tweens.add({
      targets: scoreText,
      y: scoreText.y - 50,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        scoreText.destroy();
      }
    });
  }

  /**
   * Destroy bird when it hits the ground
   */
  destroyBird() {
    if (this.isDead) return;
    
    this.isDead = true;
    
    console.log('Bird destroyed on ground impact');
    
    // Particle effect on impact
    this.createImpactEffect();
    
    // Destroy after delay (with safety check)
    if (this.scene && this.scene.time) {
      this.scene.time.delayedCall(50, () => {
        this.destroy();
      });
    } else {
      // If scene is gone, destroy immediately
      this.destroy();
    }
  }

  /**
   * Create visual effect when bird hits ground
   */
  createImpactEffect() {
    // Safety check
    if (!this.scene || !this.scene.add || !this.scene.tweens) return;
    
    const flash = this.scene.add.circle(this.x, this.y, this.width, 0xffffff, 0.8);
    flash.setDepth(50);
    
    this.scene.tweens.add({
      targets: flash,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => flash.destroy()
    });
  }

  /**
   * Cleanup
   */
  destroy(fromScene) {
    // Reset rotation before destroying
    this.setAngle(0);
    super.destroy(fromScene);
  }
}