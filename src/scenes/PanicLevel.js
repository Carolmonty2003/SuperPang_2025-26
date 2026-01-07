// src/scenes/PanicLevel.js

import { Hero } from '../entities/Hero.js';
import { WallManager } from '../objects/WallManager.js';

import { HugeBall } from '../entities/enemies/balls/normal/HugeBall.js';
import { BigBall } from '../entities/enemies/balls/normal/BigBall.js';
import { HexBigBall } from '../entities/enemies/balls/hexagonal/HexBigBall.js';
import { SpecialBigBall } from '../entities/enemies/balls/special/SpecialBigBall.js';
import { SpecialMidBall } from '../entities/enemies/balls/special/SpecialMidBall.js';
import { BALL_COLORS } from '../entities/enemies/balls/BallConstants.js';
import { GAME_SIZE } from '../core/constants.js';
import { EVENTS } from '../core/events.js';
import { Hud } from '../UI/HUD.js';

export class PanicLevel extends Phaser.Scene {
  constructor() {
    super({ key: 'PanicLevel' });
  }

  init(data) {
    // Store the mode (normal or panic)
    this.gameMode = data.mode || 'normal';
  }

  preload() {
    // --- FONDO Y TILEMAP ---
    this.load.setPath('assets/sprites/backgrounds');
   	this.load.spritesheet('backgrounds', 'backgrounds.png', {
      frameWidth: 256,
      frameHeight: 192,
    });
    this.load.image('tileset_muros_img', 'tileset_muros.png');

    this.load.setPath('assets/tiled/maps');
    this.load.tilemapTiledJSON('map_marco', 'marcoLadrillos.json');

    // --- SPRITES DEL HÉROE (los que usa Hero.js) ---
    this.load.setPath('assets/sprites/spritesheets/hero');
    
    // Spritesheet principal del héroe (requerido por Hero.createAnimations())
    this.load.spritesheet('player', 'spritesheet_player.png', {
      frameWidth: 118,
      frameHeight: 127,
      spacing: 0,
      margin: 0
    });
    
    // Spritesheets adicionales para animaciones extendidas
    this.load.spritesheet('player_walk', 'player_walk.png', {
      frameWidth: 109, // 4 frames
      frameHeight: 118,
    });
    this.load.spritesheet('player_shoot', 'player_shoot.png', {
      frameWidth: 96, // 2 frames
      frameHeight: 119,
    });

    // --- ARMA ---
    this.load.setPath('assets/sprites/static');
    this.load.image('arponFijo', 'arponFijo.png');
    this.load.image('arpon', 'arpon.png');
    this.load.image('bullet', 'disparo.png');

    // --- PELOTAS ---
    this.load.image('n_huge', 'n_huge.png');
    this.load.image('n_big', 'n_big.png');
    this.load.image('n_mid', 'n_mid.png');
    this.load.image('n_small', 'n_small.png');
    this.load.image('n_tiny1', 'n_tiny1.png');
    this.load.image('n_tiny2', 'n_tiny2.png');

    // --- PELOTAS HEXAGONALES ---
    this.load.setPath('assets/sprites/spritesheets/Balls');
    this.load.spritesheet('hex_big', 'hex_big.png', {
      frameWidth: 98 / 3,
      frameHeight: 30
    });
    this.load.spritesheet('hex_mid', 'hex_mid.png', {
      frameWidth: 52 / 3,
      frameHeight: 16
    });
    this.load.spritesheet('hex_small', 'hex_small.png', {
      frameWidth: 33 / 3,
      frameHeight: 10
    });

    // --- PELOTAS ESPECIALES (CLOCK/STAR) ---
    // sp_big: 100x42 total (1x2 spritesheet) = 50x42 per frame
    // sp_mid: 68x28 total (1x2 spritesheet) = 34x28 per frame
    this.load.spritesheet('sp_big', 'sp_big.png', {
      frameWidth: 50,  // 100 / 2 frames
      frameHeight: 42
    });
    this.load.spritesheet('sp_mid', 'sp_mid.png', {
      frameWidth: 34,  // 68 / 2 frames
      frameHeight: 28
    });
  }

  create() {
    // --- MAPA ---
    const map = this.make.tilemap({ key: 'map_marco' });
    const tileset = map.addTilesetImage('tileset_muros', 'tileset_muros_img');
    
    // --- WALL MANAGER (floor/ceiling layers) ---
    this.wallManager = new WallManager(this, map, {
      floorLayer: 'layer_floor',
      ceilingLayer: 'layer_ceiling',
      tilesetName: tileset
    });

    // Mundo físico solo hasta la altura del mapa (ej: 832)
    this.physics.world.bounds.width = map.widthInPixels;
    this.physics.world.bounds.height = map.heightInPixels;

    // --- FONDO SOLO EN 0–alturaMapa ---
    const bg = this.add.image(0, 0, 'backgrounds', 0).setOrigin(0, 0);
    bg.setDisplaySize(GAME_SIZE.WIDTH, map.heightInPixels);

    // el fondo va al fondo de todo
    bg.setDepth(-2);

    this.cameras.main.setBackgroundColor(0x000000);

    // --- SPECIAL EFFECTS STATE ---
    this.timeStopUntil = 0; // Timestamp when time stop ends
    this.isFrozen = false;  // Quick check flag
    this.burstClearActive = false; // Track if burst clear is active
    this.markedForBurst = new Set(); // Balls marked for burst destruction

    // --- GRUPOS ---
    this.ballsGroup = this.physics.add.group();
    this.bullets = this.add.group({ runChildUpdate: true }); 
   
    // Weapon overlap with ceiling (destroys bullets)
    this.wallManager.addWeaponOverlap(this.bullets, (bullet) => {
      if (bullet && bullet.active) bullet.destroy();
    });
    
    // --- HÉROE ---
    const startX = map.widthInPixels / 2;
    const startY = map.heightInPixels - 64;
    
    this.hero = new Hero(this, startX, startY, 'player');
    
    // Configuración del héroe (como en Level1)
    this.hero.body.immovable = true;
    this.hero.body.pushable = false;
    this.hero.body.moves = true;
    this.hero.body.setMass(10000);
    this.hero.body.setGravityY(600); // Añadir gravedad para que no atraviese el suelo
    
    this.wallManager.addHeroCollider(this.hero);

    // --- COLISIONES BOLAS ---
    this.wallManager.addGroupCollider(this.ballsGroup, this.bounceBall, this);
    // Store overlap collider to enable/disable during time stop
    this.heroBallOverlap = this.physics.add.overlap(this.ballsGroup, this.hero, this.onHeroHitBall, null, this);

    // --- BOLA INICIAL ---
    // In panic mode, spawn 1 special ball + mix of normal and hexagonal balls for testing
    if (this.gameMode === 'panic') {
      // One special ball (Clock/Star)
      this.createBall(600, 180, 'special');
      // Two normal balls
      this.createBall(200, 150, 'normal');
      this.createBall(400, 200, 'normal');
      // Two hexagonal balls
      this.createBall(800, 220, 'hexagonal');
      this.createBall(1000, 170, 'hexagonal');
    } else {
      this.createBall();
    }
   
    // --- HUD EN LA BANDA INFERIOR ---
    this.hud = new Hud(this, {
      uiTop: map.heightInPixels, // empieza justo debajo del mapa
      mode: 'HARPOON',
    });

    // --- PAUSA CON ESC ---
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.launch('PauseMenu', { from: 'PanicLevel' });
      this.scene.pause();
      this.scene.bringToTop('PauseMenu');
    });
  }

  createBall(x = null, y = null, ballType = null) {
    const startX = x !== null ? x : this.wallManager.getFloorLayer().width / 2;
    const startY = y !== null ? y : 200;

    let ball;
    const type = ballType || (this.gameMode === 'panic' ? 'special' : 'hexagonal');
    
    if (type === 'special') {
      // Special Ball (Clock/Star)
      ball = new SpecialBigBall(this, startX, startY, 1);
      console.log(`Spawning Special Big Ball at (${startX}, ${startY})`);
    } else if (type === 'normal') {
      // Normal ball with proper color
      ball = new BigBall(this, startX, startY, 1, BALL_COLORS.RED);
      console.log(`Spawning Normal Big Ball at (${startX}, ${startY})`);
    } else {
      // Hexagonal ball (default)
      ball = new HexBigBall(this, startX, startY, 1, 1, BALL_COLORS.BLUE);
      console.log(`Spawning Hexagonal Big Ball at (${startX}, ${startY})`);
    }
    
    this.ballsGroup.add(ball);
  }

  bounceBall(ball, objectOrTile) {
    if (!ball || !ball.body) return;

    // Cooldown para evitar rebotes múltiples
    const now = Date.now();
    if (ball._lastBounce && now - ball._lastBounce < 100) {
      return;
    }
    ball._lastBounce = now;

    // Asegurarse de que _prevVelocity existe
    if (!ball._prevVelocity) {
      ball._prevVelocity = { x: 150, y: 400 };
    }

    // Primera vez: guardar la velocidad de impacto como constante
    if (!ball._constantBounceVel) {
      ball._constantBounceVel = {
        x: Math.abs(ball._prevVelocity.x) || 150,
        y: Math.abs(ball._prevVelocity.y) || 400
      };
    }

    // Rebote perfecto: usar velocidad constante guardada
    if (ball.body.blocked.down || ball.body.touching.down) {
      ball.body.setVelocityY(-ball._constantBounceVel.y);
      ball.y -= 5;
    }
    
    if (ball.body.blocked.up || ball.body.touching.up) {
      ball.body.setVelocityY(ball._constantBounceVel.y);
      ball.y += 5;
    }
    
    if (ball.body.blocked.left || ball.body.touching.left) {
      ball.body.setVelocityX(ball._constantBounceVel.x);
      ball.x += 5;
    }
    
    if (ball.body.blocked.right || ball.body.touching.right) {
      ball.body.setVelocityX(-ball._constantBounceVel.x);
      ball.x -= 5;
    }
  }

  update() {
    // Update time stop state
    this.updateTimeStop();
    
    // Mark newly spawned balls from splits during burst clear
    if (this.burstClearActive) {
      this.ballsGroup.children.entries.forEach(ball => {
        if (ball && ball.active && ball._spawnedFromMarkedBall && !this.markedForBurst.has(ball)) {
          // This ball was spawned from a marked ball during burst, mark it too
          this.markedForBurst.add(ball);
          ball._markedForBurst = true;
          console.log('Marking new split ball for burst');
        }
      });
    }
    
    // Freeze any newly spawned balls during time stop
    if (this.isFrozen) {
      this.ballsGroup.children.entries.forEach(ball => {
        if (ball && ball.body && ball.active && !ball._frozenVelocity) {
          // This ball was spawned during time stop, freeze it immediately
          ball._frozenVelocity = {
            x: ball.body.velocity.x,
            y: ball.body.velocity.y
          };
          ball._originalTintTopLeft = ball.tintTopLeft;
          ball._originalTintTopRight = ball.tintTopRight;
          ball._originalTintBottomLeft = ball.tintBottomLeft;
          ball._originalTintBottomRight = ball.tintBottomRight;
          ball._wasTinted = ball.isTinted;
          
          ball.body.setVelocity(0, 0);
          ball.body.setAllowGravity(false);
          ball.body.moves = false;
          ball.setTint(0x888888);
        }
      });
    }
    
    // Colisión Arpón vs bolas
    if (this.hero.activeHarpoons && this.hero.activeHarpoons.length > 0) {
      // Clean up destroyed harpoons
      this.hero.activeHarpoons = this.hero.activeHarpoons.filter(h => h && h.active);
      
      // Check collision for each active harpoon
      this.hero.activeHarpoons.forEach(harpoon => {
        if (harpoon && harpoon.active) {
          this.physics.overlap(
            harpoon,
            this.ballsGroup,
            this.onWeaponHitBall,
            null,
            this
          );
        }
      });
    }

    // Colisión Arpón Fijo vs bolas
    if (this.hero.activeFixedHarpoon && this.hero.activeFixedHarpoon.active) {
      // Colisión con techo para pegarse
      this.physics.collide(
        this.hero.activeFixedHarpoon,
        this.wallManager.getCeilingLayer(),
        (harpoon, tile) => {
          if (harpoon && harpoon.onWallCollision) {
            harpoon.onWallCollision();
          }
        },
        null,
        this
      );
      
      // Colisión con bolas
      this.physics.overlap(
        this.hero.activeFixedHarpoon,
        this.ballsGroup,
        this.onFixedHarpoonHitBall,
        null,
        this
      );
    }

    // Balas destruyendo pelotas
    this.physics.overlap(this.bullets, this.ballsGroup, this.onWeaponHitBall, null, this);
  }

  onWeaponHitBall(weapon, ball) {
    if (weapon && weapon.active && ball && ball.active) {
      if (weapon.destroy) weapon.destroy();
      if (ball.takeDamage) ball.takeDamage();
    }
  }

  onFixedHarpoonHitBall(fixedHarpoon, ball) {
    if (fixedHarpoon && fixedHarpoon.active && ball && ball.active) {
      // Call the onBallHit method on the fixed harpoon to destroy it
      if (fixedHarpoon.onBallHit) fixedHarpoon.onBallHit();
      // Damage the ball
      if (ball.takeDamage) ball.takeDamage();
    }
  }

  onHeroHitBall(hero, ball)
  {
      // El héroe recibe daño cuando toca la pelota
      if (hero && typeof hero.takeDamage === 'function') {
          hero.takeDamage(1);
      }
  }

  // ============================================================
  // SPECIAL BALL EFFECTS
  // ============================================================

  /**
   * Activate time stop effect (Clock special ball)
   * Freezes all balls for the specified duration
   * @param {number} duration - Duration in milliseconds
   */
  activateTimeStop(duration) {
    const now = Date.now();
    const endTime = now + duration;
    
    // Don't stack - either set new time or extend to max
    if (this.timeStopUntil > now) {
      // Already active - extend but cap at max duration
      const maxDuration = 5000; // Max 5 seconds total
      const maxEndTime = now + maxDuration;
      this.timeStopUntil = Math.min(endTime, maxEndTime);
    } else {
      // New time stop
      this.timeStopUntil = endTime;
    }
    
    this.isFrozen = true;
    
    // Disable collision between hero and balls
    if (this.heroBallOverlap) {
      this.heroBallOverlap.active = false;
    }
    
    // Freeze all balls and stop their movement
    this.ballsGroup.children.entries.forEach(ball => {
      if (ball && ball.body && ball.active) {
        // Store velocity and original tint before freezing
        if (!ball._frozenVelocity) {
          ball._frozenVelocity = {
            x: ball.body.velocity.x,
            y: ball.body.velocity.y
          };
          // Store the current tint state
          ball._originalTintTopLeft = ball.tintTopLeft;
          ball._originalTintTopRight = ball.tintTopRight;
          ball._originalTintBottomLeft = ball.tintBottomLeft;
          ball._originalTintBottomRight = ball.tintBottomRight;
          ball._wasTinted = ball.isTinted;
        }
        // Stop movement completely - disable body to prevent all physics
        ball.body.setVelocity(0, 0);
        ball.body.setAllowGravity(false);
        ball.body.moves = false; // Disable all movement
        
        ball.setTint(0x888888); // Gray tint to indicate frozen
      }
    });
    
    console.log(`Time Stop activated for ${duration}ms`);
  }

  /**
   * Update time stop state each frame
   */
  updateTimeStop() {
    if (!this.isFrozen) return;
    
    const now = Date.now();
    
    if (now >= this.timeStopUntil) {
      // Time stop ended - unfreeze all balls
      this.isFrozen = false;
      
      // Re-enable collision between hero and balls
      if (this.heroBallOverlap) {
        this.heroBallOverlap.active = true;
      }
      
      this.ballsGroup.children.entries.forEach(ball => {
        if (ball && ball.body && ball.active && ball._frozenVelocity) {
          // Re-enable body movement
          ball.body.setAllowGravity(true);
          ball.body.moves = true;
          
          // Restore velocity
          ball.body.setVelocity(
            ball._frozenVelocity.x,
            ball._frozenVelocity.y
          );
          
          // Restore original tint or clear if there was none
          if (ball._wasTinted) {
            // Restore the exact tint that was there before
            ball.setTint(
              ball._originalTintTopLeft,
              ball._originalTintTopRight,
              ball._originalTintBottomLeft,
              ball._originalTintBottomRight
            );
          } else {
            // No tint before, clear it
            ball.clearTint();
          }
          
          // Clear frozen state
          ball._frozenVelocity = null;
          ball._originalTintTopLeft = undefined;
          ball._originalTintTopRight = undefined;
          ball._originalTintBottomLeft = undefined;
          ball._originalTintBottomRight = undefined;
          ball._wasTinted = undefined;
        }
      });
      
      console.log('Time Stop ended');
    }
  }

  /**
   * Activate burst clear effect (Star special ball)
   * Marks all current balls and destroys them one by one (including splits)
   * @param {BaseSpecialBall} triggeringBall - The ball that triggered the effect
   */
  activateBurstClear(triggeringBall) {
    // Mark all current balls on screen (except triggering ball)
    this.markedForBurst.clear();
    this.burstClearActive = true;
    
    this.ballsGroup.children.entries.forEach(ball => {
      if (ball && ball.active && ball !== triggeringBall) {
        this.markedForBurst.add(ball);
        ball._markedForBurst = true;
      }
    });
    
    console.log(`Burst Clear: Marked ${this.markedForBurst.size} balls`);
    
    // Start the sequential destruction
    this.processBurstClear();
  }

  /**
   * Process burst clear - destroy one marked ball at a time
   */
  processBurstClear() {
    if (!this.burstClearActive) return;
    
    // Get next marked ball to destroy
    const markedBalls = Array.from(this.markedForBurst).filter(ball => ball.active);
    
    if (markedBalls.length === 0) {
      // All marked balls destroyed
      this.burstClearActive = false;
      this.markedForBurst.clear();
      console.log('Burst Clear: Complete');
      return;
    }
    
    // Destroy the first marked ball
    const ball = markedBalls[0];
    this.markedForBurst.delete(ball);
    
    if (ball && ball.active) {
      // Create burst particle effect
      this.createBurstParticle(ball.x, ball.y);
      
      // Award points
      if (this.game && this.game.events) {
        const score = ball.scoreValue || 10;
        this.game.events.emit(EVENTS.game.SCORE_CHANGE, score);
      }
      
      // Check if ball will split
      const willSplit = ball.nextBallType != null;
      
      if (willSplit) {
        // Mark that any spawned balls should be tracked
        this._currentBurstBall = ball;
        
        // Let the ball split naturally by calling takeDamage
        // We'll catch the spawned balls in the split() override
        ball.takeDamage();
        
        this._currentBurstBall = null;
      } else {
        // Ball won't split, just destroy it
        ball.destroy();
      }
    }
    
    // Schedule next ball destruction
    this.time.delayedCall(80, () => {
      this.processBurstClear();
    });
  }

  /**
   * Create burst particle effect
   */
  createBurstParticle(x, y) {
    const particle = this.add.circle(x, y, 30, 0xff8800, 1);
    particle.setDepth(200);
    
    this.tweens.add({
      targets: particle,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => particle.destroy()
    });
  }
}
