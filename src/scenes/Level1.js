// src/scenes/Level1.js

import { Hero } from "../entities/Hero.js";
import { GAME_SIZE } from "../core/constants.js";
import { Hud } from "../UI/HUD.js";
import { Platform } from "../objects/Platform.js";
import { PlatformManager } from "../objects/platforms/PlatformManager.js";
import { HugeBall } from "../entities/enemies/balls/normal/HugeBall.js";
import { TinyBall } from "../entities/enemies/balls/normal/TinyBall.js";
import { HexBigBall } from "../entities/enemies/balls/hexagonal/HexBigBall.js";
import { BALL_COLORS } from "../entities/enemies/balls/BallConstants.js";
import { Dropper } from "../entities/items/Dropper.js";

//test temporal pajaros
import { SmallBird } from "../entities/enemies/birds/SmallBird.js";
import { BIRD_SPAWN_HEIGHTS, BIRD_COLORS } from "../entities/enemies/birds/BirdConstants.js";

export class Level1 extends Phaser.Scene {
  constructor() {
    super({ key: "Level1" });
    this.platformObjects = new Map();
  }

  preload() {
    // --- 1. FONDO ---
    this.load.setPath("assets/sprites/backgrounds");
    this.load.spritesheet("backgrounds", "backgrounds.png", {
      frameWidth: 256,
      frameHeight: 192
    });

    // --- 2. TILESETS (MUROS, PLATAFORMAS Y ESCALERAS) ---
    this.load.setPath("assets/tiled/tilesets");
    this.load.image("tileset_muros_img", "tileset_muros.png");
    this.load.image("tileset_platform_img", "tileset_platform.png");
    this.load.image("tileset_ladder_img", "tileset_ladder.png");

    // --- 3. TILEMAP ---
    this.load.setPath("assets/tiled/maps");
    this.load.tilemapTiledJSON("map_level_01", "LevelTest.json");

    // --- 4. SPRITES HERO ---
    this.load.setPath("assets/sprites/spritesheets/hero");
    this.load.spritesheet("player", "spritesheet_player.png", {
      frameWidth: 118,
      frameHeight: 127,
      spacing: 0,
      margin: 0
    });

    // --- 5. ARMA ---
    this.load.setPath("assets/sprites/static");
    this.load.image("arponFijo", "arponFijo.png");
    this.load.image("arpon", "arpon.png");
    this.load.image("bullet", "disparo.png");

    // --- 6. PELOTAS ---
    this.load.setPath("assets/sprites/static");
    this.load.image("n_huge", "n_huge.png");
    this.load.image("n_big", "n_big.png");
    this.load.image("n_mid", "n_mid.png");
    this.load.image("n_small", "n_small.png");
    this.load.image("n_tiny1", "n_tiny1.png");
    this.load.image("n_tiny2", "n_tiny2.png");

    // --- 7. PELOTAS HEXAGONALES ---
    this.load.setPath("assets/sprites/spritesheets/Balls");
    this.load.spritesheet("hex_big", "hex_big.png", {
      frameWidth: 98 / 3,
      frameHeight: 30
    });
    this.load.spritesheet("hex_mid", "hex_mid.png", {
      frameWidth: 52 / 3,
      frameHeight: 16
    });
    this.load.spritesheet("hex_small", "hex_small.png", {
      frameWidth: 33 / 3,
      frameHeight: 10
    });

    // --- 8. POWER-UPS (BONUS SPRITESHEET) ---
    this.load.setPath("assets/sprites/static");
    this.load.spritesheet("bonus", "bonus.png", {
      frameWidth: 20,
      frameHeight: 20
    });

    // --- 9. PAJAROS --- TEMPORAAAAAAAAAAAAAAAAAAAAAAAL-------------------------------------------
    // --- 8. BIRDS (ADD THIS SECTION) ---
    this.load.setPath("assets/sprites/spritesheets/enemies");
    
    // Option A: Single images (simplest - no animation)
    this.load.image("bird_small", "bird_small.png");
  }

  create() {
    const BG_HEIGHT = GAME_SIZE.HEIGHT;

    // --- FONDO ---
    const bg = this.add.image(0, 0, "backgrounds", 3).setOrigin(0, 0);
    bg.setDisplaySize(GAME_SIZE.WIDTH, BG_HEIGHT);

    // el fondo al fondo de todo
    bg.setDepth(-2);

    this.cameras.main.setBackgroundColor(0x000000);

    // --- MAPA ---
    const map = this.make.tilemap({ key: "map_level_01" });

    const tilesetMuros = map.addTilesetImage("tileset_muros", "tileset_muros_img");
    const tilesetPlatform = map.addTilesetImage("tileset_platforms", "tileset_platform_img");
    const tilesetLadder = map.addTilesetImage("tileset_ladders", "tileset_ladder_img");

    // console.log('Tilesets loaded:', { tilesetMuros, tilesetPlatform, tilesetLadder });

    this.walls = map.createLayer("layer_walls", tilesetMuros, 0, 0);
    this.platformsStatic = map.createLayer("layer_platforms_undestructable", tilesetPlatform, 0, 0);
    this.platformsBreakable = map.createLayer("layer_platforms_destructable", tilesetPlatform, 0, 0);
    this.ladders = map.createLayer("layer_ladders", tilesetLadder, 0, 0);

    // console.log('Layers created:', {
    //   walls: this.walls,
    //   platformsStatic: this.platformsStatic,
    //   platformsBreakable: this.platformsBreakable,
    //   ladders: this.ladders
    // });

    // Colisión tiles (IMPORTANTE: los tiles deben tener collision shape en Tiled)
    this.walls.setCollisionByExclusion([-1]);
    
    if (this.platformsStatic) {
      this.platformsStatic.setCollisionByExclusion([-1, 0]);
    }
    
    if (this.platformsBreakable) {
      this.platformsBreakable.setCollisionByExclusion([-1, 0]);
    }
    
    // Ladders don't need collision for now

    // Initialize Platform Manager with breakable layer
    this.platformManager = new PlatformManager(this, map, this.platformsBreakable);
    
    // Store tile positions before clearing
    const breakableTilePositions = [];
    if (this.platformsBreakable) {
      this.platformsBreakable.forEachTile((tile) => {
        if (tile.index > 0) {
          breakableTilePositions.push({
            x: tile.x,
            y: tile.y,
            index: tile.index
          });
        }
      });
      
      // Clear original tiles (we'll recreate them as platform objects)
      this.platformsBreakable.fill(-1);
    }
    
    // Create platforms from stored positions
    breakableTilePositions.forEach(pos => {
      const pattern = [pos.index]; // Use the actual tile index
      const color = 0x00FFFF; // Cyan glass for breakable
      
      this.platformManager.createBreakablePlatform(
        pos.x, pos.y,
        pattern,
        color,
        null // No drop for now
      );
    });

    // Initialize Ladder Manager
    this.ladders = this.findLadderColumns(map, this.ladders);
    console.log(`Found ${this.ladders.length} ladder columns`);
    
    // Static platforms keep collision but no special behavior needed
    
    this.createPlatformObjects();

    // Bounds mundo físico
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // --- INPUT ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyShoot = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // --- GRUPO DE BALAS ---
    this.bullets = this.add.group({ runChildUpdate: true });

    // --- GRUPO DE PELOTAS ---
    this.ballsGroup = this.physics.add.group();

    // Balas chocan con walls -> se destruyen
    this.physics.add.collider(this.bullets, this.walls, (bullet) => {
      // console.log('Bullet destroyed by WALL collision at', bullet.x, bullet.y);
      if (bullet && bullet.active) bullet.destroy();
    });

    // Balas rompen plataformas - TEMPORALMENTE DESACTIVADO hasta implementar nuevo sistema
    // this.physics.add.collider(
    //   this.bullets,
    //   this.platforms,
    //   this.onWeaponHitsPlatform,
    //   null,
    //   this
    // );

    // --- HERO ---
    const startX = map.widthInPixels / 2;
    const startY = map.heightInPixels - 64;
    this.hero = new Hero(this, startX, startY, "player");

    // Configuración del héroe
    this.hero.body.immovable = true;
    this.hero.body.pushable = false;
    this.hero.body.moves = true;
    this.hero.body.setMass(10000);

    // Referencias de input para el Hero
    this.hero.cursors = this.cursors;
    this.hero.keyShoot = this.keyShoot;
    this.hero.keySpace = this.keyShoot;

    this.physics.add.collider(this.hero, this.walls);
    this.physics.add.collider(this.hero, this.platforms);

    // --- COLISIONES BOLAS ---
    this.physics.add.collider(this.ballsGroup, this.walls, this.bounceBall, null, this);
    this.physics.add.collider(this.ballsGroup, this.platforms, this.bounceBall, null, this);
    // Overlap con el héroe - NO hay separación física automática, solo rebote manual
    this.physics.add.overlap(this.ballsGroup, this.hero, this.bounceOffHero, null, this);

    // --- ANIM IDLE ---
    if (!this.anims.exists("idle")) {
      this.anims.create({
        key: "idle",
        frames: [{ key: "player", frame: 3 }],
        frameRate: 1,
        repeat: -1
      });
    }
    this.hero.play("idle");

    // --- PELOTA INICIAL ---
    this.createBall();

    // --- DROPPER (SISTEMA DE ITEMS) ---
    this.dropper = new Dropper(this, {
      dropChance: 0.5, // 50% de probabilidad de drop (puedes ajustar)
      maxItems: 8
    });

    // --- COLISIONES ITEMS (sin rebote) ---
    // Los items colisionan con paredes y plataformas pero no rebotan
    this.physics.add.collider(this.dropper.activeItems, this.walls);
    this.physics.add.collider(this.dropper.activeItems, this.platforms);

    // ===== TEST MODE: DROPEAR ITEMS PARA PROBAR =====
    this.time.delayedCall(500, () => {
      // Fila superior - Power-ups
      this.dropper.dropFrom(null, 300, 200, { itemType: 'POWER_UP_SHIELD', guaranteed: true });
      this.dropper.dropFrom(null, 450, 200, { itemType: 'POWER_UP_LIFE', guaranteed: true });
      this.dropper.dropFrom(null, 600, 200, { itemType: 'POWER_UP_SPEED', guaranteed: true });
      this.dropper.dropFrom(null, 750, 200, { itemType: 'POWER_UP_BOMB', guaranteed: true });
      
      // Fila media - Armas temporales
      this.dropper.dropFrom(null, 300, 400, { itemType: 'WEAPON_TEMP_DOUBLE', guaranteed: true });
      this.dropper.dropFrom(null, 500, 400, { itemType: 'WEAPON_TEMP_MACHINE', guaranteed: true });
      this.dropper.dropFrom(null, 700, 400, { itemType: 'WEAPON_TEMP_FIXED', guaranteed: true });
      
      // Fila inferior - Tiempo y frutas
      this.dropper.dropFrom(null, 350, 600, { itemType: 'TIME_FREEZE', guaranteed: true });
      this.dropper.dropFrom(null, 550, 600, { itemType: 'TIME_SLOW', guaranteed: true });
      this.dropper.dropFrom(null, 750, 600, { itemType: 'FRUITS', guaranteed: true });
    });
    // ===== FIN TEST MODE =====

    // --- HUD ---
    this.hud = new Hud(this, {
      uiTop: map.heightInPixels,
      mode: "HARPOON"
    });

    // --- PAUSA ---
    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.launch("PauseMenu", { from: "Level1" });
      this.scene.pause();
      this.scene.bringToTop("PauseMenu");
    });

    this.birdsGroup = this.physics.add.group();
  
    // --- BIRD COLLISIONS ------------------------------------------------------------------------------------------------
    // Birds damage hero on overlap (only while flying)
    this.physics.add.overlap(
      this.birdsGroup,
      this.hero,
      this.birdHitsHero,
      null,
      this
    );
    
    // Birds collide with ground (for falling birds)
    this.physics.add.collider(
      this.birdsGroup,
      this.walls
    );
    
    this.physics.add.collider(
      this.birdsGroup,
      this.platforms
    );
    
    // --- SPAWN INITIAL BIRDS (OPTIONAL) ---
    // Spawn some test birds
    this.spawnBird('SMALL', 200, BIRD_SPAWN_HEIGHTS.HIGH, 1);
    
    // --- BIRD SPAWNER TIMER (OPTIONAL) ---
    // Spawn birds automatically every 8-15 seconds
    this.birdSpawnTimer = this.time.addEvent({
      delay: Phaser.Math.Between(8000, 15000),
      callback: this.spawnRandomBird,
      callbackScope: this,
      loop: true
    });
    
    // --- DEBUG KEY (OPTIONAL) ---
    // Press B to spawn a bird at hero position
    this.input.keyboard.on('keydown-B', () => {
      this.spawnBird('SMALL', this.hero.x, 200, 1);
      console.log('Debug: Bird spawned at hero position');
    });
  }

    /**
   * Spawn a bird of specified type----------------------------------------------------------------------------------------------
   */
  spawnBird(type, x, y, direction = 1) {
    let bird;
    
    if (type === 'SMALL') {
      bird = new SmallBird(this, x, y, direction);
    } else {
      bird = new BigBird(this, x, y, direction);
    }
    
    // Optional: Add random color tint for variety
    const colors = Object.values(BIRD_COLORS);
    const randomColor = Phaser.Utils.Array.GetRandom(colors);
    bird.setTint(randomColor);
    
    this.birdsGroup.add(bird);
    
    console.log(`Spawned ${type} bird at (${x}, ${y}) moving ${direction > 0 ? 'right' : 'left'}`);
    
    return bird;
  }

    /**
   * Spawn a random bird at random position
   */
  spawnRandomBird() {
    // Limit max birds on screen
    const maxBirds = 5;
    const aliveBirds = this.birdsGroup.getChildren().filter(b => b.active && !b.isDead);
    
    if (aliveBirds.length >= maxBirds) {
      console.log('Max birds reached, skipping spawn');
      return;
    }
    
    // Random type
    const types = ['SMALL'];
    const type = Phaser.Utils.Array.GetRandom(types);
    
    // Random height
    const heights = Object.values(BIRD_SPAWN_HEIGHTS);
    const y = Phaser.Utils.Array.GetRandom(heights);
    
    // Random direction
    const direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
    
    // Spawn from appropriate side
    const x = direction > 0 ? 0 : this.walls.width;
    
    this.spawnBird(type, x, y, direction);
  }

  /**
   * Called when bird overlaps with hero
   */
  birdHitsHero(hero, bird) {
    // Only damage hero if bird is still flying (not falling or dead)
    if (bird && bird.isFlying && !bird.isDead && hero && hero.active) {
      console.log('Bird hit hero!');
      hero.takeDamage(1);
    }
  }//------------------------------------------------------------------------------------------------------------------------------

  createPlatformObjects() {
    // TODO: Implement new platform system with PlatformManager
    // this.platformObjects.clear();

    // this.platforms.forEachTile((tile) => {
    //   if (tile.index > 0) {
    //     const key = `${tile.x}_${tile.y}`;
    //     const platform = new Platform(this, tile);
    //     this.platformObjects.set(key, platform);
    //   }
    // });

    // console.log(`Plataformas creadas: ${this.platformObjects.size}`);
  }

  createBall() {
    const startX = this.walls.width / 2;
    const startY = 200;

    // Elegir un color aleatorio para la bola inicial
    const colors = Object.values(BALL_COLORS);
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const ball = new HugeBall(this, startX, startY, 1, randomColor);
    this.ballsGroup.add(ball);

    // Empujón inicial con velocidad horizontal y vertical
    ball.body.setVelocityY(50);
    ball.body.setVelocityX(150); // Fuerza horizontal para probar rebote en paredes
  }

  bounceBall(ball, objectOrTile) {
    if (!ball || !ball.body) return;

    // Cooldown para evitar rebotes múltiples
    const now = Date.now();
    if (ball._lastBounce && now - ball._lastBounce < 100) {
      return; // Ignorar si rebotó hace menos de 100ms
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
      // console.log('Stored constant bounce velocity:', ball._constantBounceVel);
    }

    // Rebote perfecto: usar velocidad constante guardada
    if (ball.body.blocked.down || ball.body.touching.down) {
      ball.body.setVelocityY(-ball._constantBounceVel.y);
      ball.y -= 5; // Mayor separación
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

  bounceOffHero(hero, ball) {
    if (!ball || !ball.body || !hero || !hero.body) return;

    // El JUGADOR recibe daño cuando toca la pelota
    hero.takeDamage(1);
  }

  findLadderColumns(map, ladderLayer) {
    if (!ladderLayer) return [];
    
    const columns = [];
    const processed = new Set();
    const tileWidth = map.tileWidth;
    const tileHeight = map.tileHeight;
    
    // Scan cada columna X
    for (let x = 0; x < ladderLayer.width; x++) {
      let inLadder = false;
      let topY = null;
      let bottomY = null;
      
      for (let y = 0; y < ladderLayer.height; y++) {
        const tile = ladderLayer.getTileAt(x, y);
        const hasTile = tile && tile.index > 0;
        
        if (hasTile && !inLadder) {
          // Start of ladder column
          inLadder = true;
          topY = y;
        } else if (!hasTile && inLadder) {
          // End of ladder column
          bottomY = y - 1;
          
          // Add complete column
          columns.push({
            x: x * tileWidth + tileWidth / 2,
            top: topY * tileHeight,
            bottom: (bottomY + 1) * tileHeight
          });
          
          inLadder = false;
          topY = null;
          bottomY = null;
        }
      }
      
      // If ladder goes to bottom of map
      if (inLadder && topY !== null) {
        bottomY = ladderLayer.height - 1;
        columns.push({
          x: x * tileWidth + tileWidth / 2,
          top: topY * tileHeight,
          bottom: (bottomY + 1) * tileHeight
        });
      }
    }
    
    return columns;
  }

  update() {
    // Arpón rompiendo plataformas y pelotas
    if (this.hero.activeHarpoons && this.hero.activeHarpoons.length > 0) {
      // Clean up destroyed harpoons
      this.hero.activeHarpoons = this.hero.activeHarpoons.filter(h => h && h.active);
      
      // Check collision for each active harpoon
      this.hero.activeHarpoons.forEach(harpoon => {
        if (harpoon && harpoon.active) {
          // Colisión con plataformas estáticas (solo rebote)
          this.physics.overlap(
            harpoon,
            this.platforms,
            this.onWeaponHitsPlatform,
            null,
            this
          );

          // Colisión con plataformas breakable
          if (this.platformManager && this.platformsBreakable) {
            const tile = this.platformsBreakable.getTileAtWorldXY(harpoon.x, harpoon.y, true);
            if (tile && tile.index > 0) {
              this.platformManager.onWeaponHitPlatform(harpoon, tile);
            }
          }

          this.physics.overlap(
            harpoon,
            this.ballsGroup,
            this.onWeaponHitsBall,
            null,
            this
          );
        }
      });
    }

    // Arpón Fijo rompiendo pelotas
    if (this.hero.activeFixedHarpoon && this.hero.activeFixedHarpoon.active) {
      // Colisión con paredes para pegarse
      this.physics.collide(
        this.hero.activeFixedHarpoon,
        this.walls,
        (harpoon, tile) => {
          if (harpoon && harpoon.onWallCollision) {
            harpoon.onWallCollision();
          }
        },
        null,
        this
      );

      // Colisión con plataformas breakable
      if (this.platformManager && this.platformsBreakable) {
        const harpoon = this.hero.activeFixedHarpoon;
        const tile = this.platformsBreakable.getTileAtWorldXY(harpoon.x, harpoon.y, true);
        if (tile && tile.index > 0) {
          this.platformManager.onWeaponHitPlatform(harpoon, tile);
        }
      }
      
      // Colisión con bolas
      this.physics.overlap(
        this.hero.activeFixedHarpoon,
        this.ballsGroup,
        this.onFixedHarpoonHitsBall,
        null,
        this
      );
    }

    // Balas destruyendo pelotas
    this.physics.overlap(this.bullets, this.ballsGroup, this.onWeaponHitsBall, null, this);

    // Balas vs Plataformas Breakable
    if (this.platformManager && this.bullets && this.bullets.children) {
      this.bullets.children.entries.forEach(bullet => {
        if (bullet && bullet.active) {
          const tile = this.platformsBreakable?.getTileAtWorldXY(bullet.x, bullet.y, true);
          if (tile && tile.index > 0) {
            this.platformManager.onWeaponHitPlatform(bullet, tile);
          }
        }
      });
    }

    // CHECK ITEM PICKUPS
    if (this.dropper && this.dropper.activeItems) {
      this.dropper.activeItems.getChildren().forEach(item => {
        if (item && item.active && !item.consumed) {
          item.checkPickup(this.hero);
        }
      });
    }

    // --- HARPOON vs BIRDS (ADD THIS SECTION) ----------------------------------------------------------------------------
    if (this.hero.activeHarpoons && this.hero.activeHarpoons.length > 0) {
      this.hero.activeHarpoons = this.hero.activeHarpoons.filter(h => h && h.active);
      
      this.hero.activeHarpoons.forEach(harpoon => {
        if (harpoon && harpoon.active) {
          // ... your existing harpoon collision code ...
          
          // ADD: Harpoon hits birds
          this.physics.overlap(
            harpoon,
            this.birdsGroup,
            this.onWeaponHitsBird,
            null,
            this
          );
        }
      });
    }
    
    // --- FIXED HARPOON vs BIRDS (ADD THIS SECTION) ---
    if (this.hero.activeFixedHarpoon && this.hero.activeFixedHarpoon.active) {
      // ... your existing fixed harpoon collision code ...
      
      // ADD: Fixed harpoon hits birds
      this.physics.overlap(
        this.hero.activeFixedHarpoon,
        this.birdsGroup,
        this.onWeaponHitsBird,
        null,
        this
      );
    }
    
    // --- BULLETS vs BIRDS (ADD THIS SECTION) ---
    // ADD: Bullets hit birds
    this.physics.overlap(
      this.bullets,
      this.birdsGroup,
      this.onWeaponHitsBird,
      null,
      this
    );//--------------------------------------------------------------------------------------------------------------
  }

    /**
   * Called when any weapon hits a bird--------------------------------------------------------------------
   */
  onWeaponHitsBird(weapon, bird) {
    if (weapon && weapon.active && bird && bird.active && !bird.isDead) {
      console.log('Weapon hit bird!');
      
      // Destroy the weapon
      if (weapon.destroy) weapon.destroy();
      
      // Damage the bird (makes it fall)
      if (bird.takeDamage) bird.takeDamage();
    }//----------------------------------------------------------------------------------------------------------
  }

  onWeaponHitsPlatform(weapon, tile) {
    const key = `${tile.x}_${tile.y}`;
    const platform = this.platformObjects.get(key);

    if (platform) {
      platform.break(weapon);
      this.platformObjects.delete(key);
    }
      
    if (weapon && weapon.active && weapon.destroy) weapon.destroy();
  }

  onWeaponHitsBall(weapon, ball) {
    if (weapon && weapon.active && ball && ball.active) {
      if (weapon.destroy) weapon.destroy();
      if (ball.takeDamage) ball.takeDamage();
    }
  }

  onFixedHarpoonHitsBall(fixedHarpoon, ball) {
    if (fixedHarpoon && fixedHarpoon.active && ball && ball.active) {
      // Call the onBallHit method on the fixed harpoon to destroy it
      if (fixedHarpoon.onBallHit) fixedHarpoon.onBallHit();
      // Damage the ball
      if (ball.takeDamage) ball.takeDamage();
    }
  }
}

export default Level1;
0