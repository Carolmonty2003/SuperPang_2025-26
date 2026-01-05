import { EVENTS } from '../../../core/events.js';

/**
 * BaseCrocodile - Ground patrolling enemy
 * 
 * Crocodiles patrol platforms, descend ladders to reach lowest level,
 * and can be stunned by weapons then knocked flying by player collision.
 * 
 * Behavior:
 * - Patrols left-right without falling off platforms
 * - Descends ladders when found
 * - Seeks lowest level in map
 * - Patrols at lowest level for 10+ seconds before exiting
 * - Stunned when hit by weapon (immobile)
 * - Flies away and explodes when player collides with stunned croc
 * - Does NOT damage player
 */

export class BaseCrocodile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, speed = 80, scoreValue = 200) {
    super(scene, x, y, texture);
    
    scene.add.existing(this);
    scene.physics.world.enable(this);

    this.baseSpeed = speed;
    this.scoreValue = scoreValue;
    this.direction = 1; // 1 = right, -1 = left
    
    // Crocodile states
    this.state = 'PATROLLING'; // PATROLLING, DESCENDING_LADDER, STUNNED, FLYING, DEAD
    this.isDead = false;
    
    // Patrol behavior
    this.patrolStartTime = scene.time.now;
    this.minPatrolTime = 10000; // 10 seconds minimum at lowest level
    this.hasPatrolledEnough = false;
    this.isAtLowestLevel = false;
    
    // Edge detection
    this.edgeCheckDistance = 16; // Distance to check for edges
    
    // Ladder tracking
    this.currentLadder = null;
    this.ladderCheckCooldown = 0;
    
    // Stun tracking
    this.stunTime = 0;
    this.stunDuration = 0; // Infinite until player collides
    
    // Flying tracking
    this.hasDroppedItem = false;

    // Configure sprite
    this.setScale(2, 2);
    
    // Create animation
    this.createAnimation(texture);
    
    // Play animation
    const animKey = `${texture}_walk`;
    if (this.scene.anims.exists(animKey)) {
      this.play(animKey);
    }

    // Physics - ground based enemy
    this.body.setAllowGravity(true);
    this.body.setGravityY(600);
    this.body.setBounce(0, 0);
    this.body.setCollideWorldBounds(true);
    this.body.onWorldBounds = true;
    
    this.body.immovable = false;
    this.body.moves = true;
    this.body.setDrag(500, 0);
    this.body.setMaxVelocity(200, 800);
    
    // Hitbox
    const hitboxWidth = this.width * 0.7;
    const hitboxHeight = this.height * 0.8;
    this.body.setSize(hitboxWidth, hitboxHeight);
    this.body.setOffset(
      (this.width - hitboxWidth) / 2,
      (this.height - hitboxHeight) / 2
    );
    
    // Enable ground collision
    this.body.checkCollision.down = true;
    this.body.checkCollision.up = false;
    this.body.checkCollision.left = true;
    this.body.checkCollision.right = true;
    
    // Initial velocity
    this.body.setVelocityX(this.baseSpeed * this.direction);
    
    // Flip sprite based on direction
    this.setFlipX(this.direction < 0);
    
    // Listen for world bounds
    this.body.world.on('worldbounds', this.onWorldBoundsCollision, this);
  }

  /**
   * Create walk animation
   */
  createAnimation(texture) {
    const animKey = `${texture}_walk`;
    
    if (!this.scene.anims.exists(animKey)) {
      const textureFrames = this.scene.textures.get(texture).getFrameNames();
      
      if (textureFrames.length > 1) {
        this.scene.anims.create({
          key: animKey,
          frames: this.scene.anims.generateFrameNumbers(texture, { start: 0, end: textureFrames.length - 1 }),
          frameRate: 8,
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
   * Called when crocodile hits world bounds
   */
  onWorldBoundsCollision(body) {
    if (body.gameObject !== this) return;
    if (this.state !== 'PATROLLING') return;
    
    // Check if at lowest level and patrolled enough
    if (this.isAtLowestLevel && this.hasPatrolledEnough) {
      // Exit by side
      if (body.blocked.left || body.blocked.right) {
        console.log('Crocodile exiting at lowest level');
        this.destroy();
      }
    } else {
      // Reverse direction if hit wall
      if (body.blocked.left || body.blocked.right) {
        this.reverseDirection();
      }
    }
  }

  /**
   * Check if there's ground ahead (edge detection)
   */
  checkGroundAhead() {
    if (!this.scene || !this.scene.physics || !this.body) return true;
    
    const checkX = this.x + (this.edgeCheckDistance * this.direction);
    const checkY = this.y + this.height / 2 + 10; // Below feet
    
    // Raycast down from check point
    const tile = this.scene.walls?.getTileAtWorldXY(checkX, checkY);
    
    // If no tile found, there's an edge
    return tile !== null;
  }

  /**
   * Check for ladder at current position
   */
  checkForLadder() {
    if (!this.scene || !this.scene.ladders || this.ladderCheckCooldown > 0) {
      return null;
    }
    
    // Get ladders at current position
    const tile = this.scene.ladders.getTileAtWorldXY(this.x, this.y);
    
    if (tile && tile.index !== -1) {
      this.ladderCheckCooldown = 1000; // 1 second cooldown
      return tile;
    }
    
    return null;
  }

  /**
   * Check if crocodile is at the lowest level of the map
   */
  checkIfAtLowestLevel() {
    if (!this.scene || !this.scene.physics) return false;
    
    // Simple check: if Y position is near bottom of world
    const worldHeight = this.scene.physics.world.bounds.height;
    const distanceFromBottom = worldHeight - this.y;
    
    // Consider "lowest level" if within 150px of bottom
    return distanceFromBottom < 150;
  }

  /**
   * Reverse patrol direction
   */
  reverseDirection() {
    this.direction *= -1;
    this.setFlipX(this.direction < 0);
    console.log(`Crocodile reversed direction to ${this.direction > 0 ? 'right' : 'left'}`);
  }

  /**
   * Update patrolling behavior
   */
  updatePatrolling(delta) {
    if (!this.body || this.isDead) return;
    
    // Check if on ground
    const onGround = this.body.blocked.down || this.body.touching.down;
    
    if (!onGround) return;
    
    // Update cooldowns
    if (this.ladderCheckCooldown > 0) {
      this.ladderCheckCooldown -= delta;
    }
    
    // Check if at lowest level
    this.isAtLowestLevel = this.checkIfAtLowestLevel();
    
    // Check patrol time
    if (this.isAtLowestLevel) {
      const patrolElapsed = this.scene.time.now - this.patrolStartTime;
      if (patrolElapsed >= this.minPatrolTime) {
        this.hasPatrolledEnough = true;
      }
    }
    
    // Check for ladder (prefer going down)
    const ladder = this.checkForLadder();
    if (ladder && !this.isAtLowestLevel) {
      console.log('Crocodile found ladder, descending');
      this.state = 'DESCENDING_LADDER';
      this.currentLadder = ladder;
      this.body.setVelocityX(0);
      this.body.setVelocityY(100); // Descend speed
      return;
    }
    
    // Check for edge (don't fall off)
    const hasGroundAhead = this.checkGroundAhead();
    if (!hasGroundAhead) {
      console.log('Crocodile detected edge, reversing');
      this.reverseDirection();
    }
    
    // Check for wall collision
    if (this.body.blocked.left || this.body.blocked.right) {
      this.reverseDirection();
    }
    
    // Set velocity
    this.body.setVelocityX(this.baseSpeed * this.direction);
  }

  /**
   * Update ladder descending
   */
  updateDescending(delta) {
    if (!this.body || this.isDead) return;
    
    // Check if still on ladder
    const onLadder = this.scene.ladders?.getTileAtWorldXY(this.x, this.y);
    
    if (!onLadder || onLadder.index === -1) {
      // Reached bottom of ladder
      console.log('Crocodile reached bottom of ladder');
      this.state = 'PATROLLING';
      this.patrolStartTime = this.scene.time.now; // Reset patrol timer
      this.body.setVelocityY(0);
      return;
    }
    
    // Check if on ground
    if (this.body.blocked.down || this.body.touching.down) {
      console.log('Crocodile reached ground');
      this.state = 'PATROLLING';
      this.patrolStartTime = this.scene.time.now;
      this.body.setVelocityY(0);
      return;
    }
    
    // Continue descending
    this.body.setVelocityX(0);
    this.body.setVelocityY(100);
  }

  /**
   * Update stunned state
   */
  updateStunned(delta) {
    // Just stay still, wait for player collision
    this.body.setVelocityX(0);
  }

  /**
   * Update flying state
   */
  updateFlying(delta) {
    // Physics handles the flying
    // Check if hit ground
    if (this.body.blocked.down || this.body.touching.down) {
      this.explode();
    }
  }

  /**
   * Called each frame
   */
  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    
    if (!this.scene || !this.body || this.isDead) return;
    
    switch (this.state) {
      case 'PATROLLING':
        this.updatePatrolling(delta);
        break;
      case 'DESCENDING_LADDER':
        this.updateDescending(delta);
        break;
      case 'STUNNED':
        this.updateStunned(delta);
        break;
      case 'FLYING':
        this.updateFlying(delta);
        break;
    }
  }

  /**
   * Crocodile hit by weapon - becomes stunned
   */
  takeDamage() {
    if (this.isDead || this.state === 'STUNNED' || this.state === 'FLYING') return;
    
    console.log('Crocodile stunned!');
    
    // Change to stunned state
    this.state = 'STUNNED';
    this.stunTime = this.scene.time.now;
    
    // Stop movement
    this.body.setVelocityX(0);
    
    // Visual feedback - tint blue
    this.setTint(0x0088ff);
    
    // Stop animation
    this.anims.stop();
    
    // Show stun indicator
    this.showStunIndicator();
  }

  /**
   * Show stun stars/indicator
   */
  showStunIndicator() {
    if (!this.scene || !this.scene.add) return;
    
    const stunText = this.scene.add.text(this.x, this.y - 40, '⭐⭐⭐', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFFF00'
    });
    
    stunText.setOrigin(0.5, 0.5);
    stunText.setDepth(100);
    
    // Float and fade
    this.scene.tweens.add({
      targets: stunText,
      y: stunText.y - 20,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => {
        stunText.destroy();
      }
    });
  }

  /**
   * Player collides with stunned crocodile - launch it flying
   */
  launchFlying(playerX) {
    if (this.state !== 'STUNNED') return;
    if (this.isDead || this.state === 'FLYING') return;
    
    console.log('Crocodile launched flying!');
    
    // Award points
    if (this.scene && this.scene.game && this.scene.game.events) {
      this.scene.game.events.emit(EVENTS.game.SCORE_CHANGE, this.scoreValue);
    }
    
    // Show score
    this.showFloatingScore();
    
    // Drop item
    if (!this.hasDroppedItem && this.scene.dropper) {
      this.scene.dropper.dropFrom(this, this.x, this.y);
      this.hasDroppedItem = true;
    }
    
    // Change to flying state
    this.state = 'FLYING';
    
    // Calculate launch direction (away from player)
    const launchDirection = this.x > playerX ? 1 : -1;
    
    // Launch velocity
    this.body.setVelocityX(launchDirection * 300); // Horizontal launch
    this.body.setVelocityY(-200); // Upward launch
    
    // Visual feedback - tint red
    this.setTint(0xff0000);
    
    // Spin while flying
    this.scene.tweens.add({
      targets: this,
      angle: launchDirection > 0 ? 360 : -360,
      duration: 500,
      ease: 'Linear',
      repeat: -1
    });
  }

  /**
   * Show floating score
   */
  showFloatingScore() {
    if (!this.scene || !this.scene.add || !this.scene.tweens) return;
    
    const scoreText = this.scene.add.text(this.x, this.y, `+${this.scoreValue}`, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#00FF00',
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
   * Explode when hitting ground after flying
   */
  explode() {
    if (this.isDead) return;
    
    this.isDead = true;
    this.state = 'DEAD';
    
    console.log('Crocodile exploded!');
    
    // Create explosion effect
    this.createExplosion();
    
    // Destroy after brief delay
    if (this.scene && this.scene.time) {
      this.scene.time.delayedCall(100, () => {
        this.destroy();
      });
    } else {
      this.destroy();
    }
  }

  /**
   * Create explosion visual effect
   */
  createExplosion() {
    if (!this.scene || !this.scene.add || !this.scene.tweens) return;
    
    // Main explosion flash
    const explosion = this.scene.add.circle(this.x, this.y, this.width, 0xff8800, 1);
    explosion.setDepth(50);
    
    this.scene.tweens.add({
      targets: explosion,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => explosion.destroy()
    });
    
    // Secondary particles
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const particle = this.scene.add.circle(
        this.x,
        this.y,
        4,
        0xffaa00,
        1
      );
      particle.setDepth(50);
      
      this.scene.tweens.add({
        targets: particle,
        x: particle.x + Math.cos(angle) * 40,
        y: particle.y + Math.sin(angle) * 40,
        alpha: 0,
        duration: 400,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  /**
   * Cleanup
   */
  destroy(fromScene) {
    // Remove world bounds listener
    if (this.body && this.body.world) {
      this.body.world.off('worldbounds', this.onWorldBoundsCollision, this);
    }
    
    super.destroy(fromScene);
  }
}
