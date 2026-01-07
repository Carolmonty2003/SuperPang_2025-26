// src/scenes/Level_01.js

import { Hero } from "../entities/Hero.js";
import { GAME_SIZE } from "../core/constants.js";
import { Hud } from "../UI/HUD.js";
import { Platform } from "../objects/Platform.js";
import { HugeBall } from "../entities/enemies/balls/normal/HugeBall.js";
import { TinyBall } from "../entities/enemies/balls/normal/TinyBall.js";
import { HexBigBall } from "../entities/enemies/balls/hexagonal/HexBigBall.js";
import { BALL_COLORS } from "../entities/enemies/balls/BallConstants.js";
import { Dropper } from "../entities/items/Dropper.js";

// test temporal pajaros
import { SmallBird } from "../entities/enemies/birds/SmallBird.js";
import { BIRD_SPAWN_HEIGHTS, BIRD_COLORS } from "../entities/enemies/birds/BirdConstants.js";

// TEST TEMPORAL COCODRILOS
import { Crocodile } from "../entities/enemies/crocodiles/Crocodile.js";
import { CROCODILE_COLORS } from "../entities/enemies/crocodiles/CrocodileConstants.js";

export class Level_01 extends Phaser.Scene {
  constructor() {
    super({ key: "Level_01" });
    this.platformObjects = new Map();
  }

  preload() {
    // --- 1. FONDO ---
    this.load.setPath("assets/sprites/backgrounds");
    this.load.spritesheet("backgrounds", "backgrounds.png", {
      frameWidth: 256,
      frameHeight: 192
    });

    // --- 2. TILESETS (MUROS Y PLATAFORMAS) ---
    this.load.setPath("assets/tiled/tilesets");
    this.load.image("tileset_muros_img", "tileset_muros.png");
    this.load.image("tileset_platform_img", "tileset_platform.png");

    // --- 3. TILEMAP ---
    this.load.setPath("assets/tiled/maps");
    this.load.tilemapTiledJSON("map_level_01", "Level_01.json");

    // --- 4. SPRITES HERO ---
    this.load.setPath("assets/sprites/spritesheets/hero");
    this.load.spritesheet("player_walk", "player_walk.png", {
      frameWidth: 109,
      frameHeight: 118
    });

    this.load.spritesheet("player_shoot", "player_shoot.png", {
      frameWidth: 96,
      frameHeight: 119
    });

    // --- 5. ARMA ---
    this.load.setPath("assets/sprites/static");
    this.load.image("arponFijo", "arponFijo.png");
    this.load.image("arpon", "arpon.png");
    this.load.image("bullet", "bullet.png");

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

    // --- 8. POWER-UPS ---
    this.load.setPath("assets/sprites/static");
    this.load.spritesheet("bonus", "bonus.png", {
      frameWidth: 20,
      frameHeight: 20
    });

    // --- 9. PAJAROS ---
    this.load.setPath("assets/sprites/spritesheets/enemies");
    this.load.spritesheet("bird_small", "bird_small.png", {
      frameWidth: 51,
      frameHeight: 31
    });

    // --- 10. COCODRILOS ---
    this.load.setPath("assets/sprites/spritesheets/enemies");
    this.load.spritesheet("crocodile", "crocodile.png", {
      frameWidth: 118,
      frameHeight: 127
    });
  }

  create() {
    const BG_HEIGHT = GAME_SIZE.HEIGHT;

    const bg = this.add.image(0, 0, "backgrounds", 3).setOrigin(0, 0);
    bg.setDisplaySize(GAME_SIZE.WIDTH, BG_HEIGHT);
    bg.setDepth(-2);

    this.cameras.main.setBackgroundColor(0x000000);

    const map = this.make.tilemap({ key: "map_level_01" });

    const tilesetMuros = map.addTilesetImage("tileset_muros", "tileset_muros_img");
    const tilesetPlatform = map.addTilesetImage("tileset_platform", "tileset_platform_img");

    this.walls = map.createLayer("layer_walls", tilesetMuros, 0, 0);
    this.platforms = map.createLayer("layer_platforms", tilesetPlatform, 0, 0);

    this.walls.setCollisionByExclusion([-1]);
    this.platforms.setCollisionByExclusion([-1, 0]);

    this.createPlatformObjects();

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyShoot = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.bullets = this.add.group({ runChildUpdate: true });
    this.ballsGroup = this.physics.add.group();

    this.physics.add.collider(this.bullets, this.walls, (bullet) => {
      if (bullet && bullet.active) bullet.destroy();
    });

    this.physics.add.collider(
      this.bullets,
      this.platforms,
      this.onWeaponHitsPlatform,
      null,
      this
    );

    const startX = map.widthInPixels / 2;
    const startY = map.heightInPixels - 64;
    this.hero = new Hero(this, startX, startY, "player_walk");

    this.hero.body.immovable = true;
    this.hero.body.pushable = false;
    this.hero.body.moves = true;
    this.hero.body.setMass(10000);

    this.hero.cursors = this.cursors;
    this.hero.keyShoot = this.keyShoot;
    this.hero.keySpace = this.keyShoot;

    this.physics.add.collider(this.hero, this.walls);
    this.physics.add.collider(this.hero, this.platforms);

    this.physics.add.collider(this.ballsGroup, this.walls, this.bounceBall, null, this);
    this.physics.add.collider(this.ballsGroup, this.platforms, this.bounceBall, null, this);
    this.physics.add.overlap(this.ballsGroup, this.hero, this.bounceOffHero, null, this);

    if (!this.anims.exists("idle")) {
      this.anims.create({
        key: "idle",
        frames: this.anims.generateFrameNumbers("player_walk", { start: 0, end: 2 }),
        frameRate: 6,
        repeat: -1
      });
    }
    this.hero.play("idle");

    this.createBall();

    this.dropper = new Dropper(this, {
      dropChance: 0.5,
      maxItems: 8
    });

    this.physics.add.collider(this.dropper.activeItems, this.walls);
    this.physics.add.collider(this.dropper.activeItems, this.platforms);

    this.time.delayedCall(500, () => {
      this.dropper.dropFrom(null, 300, 200, { itemType: 'POWER_UP_SHIELD', guaranteed: true });
      this.dropper.dropFrom(null, 450, 200, { itemType: 'POWER_UP_LIFE', guaranteed: true });
      this.dropper.dropFrom(null, 600, 200, { itemType: 'POWER_UP_SPEED', guaranteed: true });
      this.dropper.dropFrom(null, 750, 200, { itemType: 'POWER_UP_BOMB', guaranteed: true });

      this.dropper.dropFrom(null, 300, 400, { itemType: 'WEAPON_TEMP_DOUBLE', guaranteed: true });
      this.dropper.dropFrom(null, 500, 400, { itemType: 'WEAPON_TEMP_MACHINE', guaranteed: true });
      this.dropper.dropFrom(null, 700, 400, { itemType: 'WEAPON_TEMP_FIXED', guaranteed: true });

      this.dropper.dropFrom(null, 350, 600, { itemType: 'TIME_FREEZE', guaranteed: true });
      this.dropper.dropFrom(null, 550, 600, { itemType: 'TIME_SLOW', guaranteed: true });
      this.dropper.dropFrom(null, 750, 600, { itemType: 'FRUITS', guaranteed: true });
    });

    this.hud = new Hud(this, {
      uiTop: map.heightInPixels,
      mode: "HARPOON"
    });

    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.launch("PauseMenu", { from: "Level_01" });
      this.scene.pause();
      this.scene.bringToTop("PauseMenu");
    });

    // ===================== BIRDS (FIXED) =====================
    this.birdsGroup = this.physics.add.group();

    // Birds damage hero on overlap
    this.physics.add.overlap(
      this.birdsGroup,
      this.hero,
      this.birdHitsHero,
      null,
      this
    );

    // ✅ Birds collide with walls ONLY when falling
    this.physics.add.collider(
      this.birdsGroup,
      this.walls,
      null,
      (bird) => bird && bird.isFalling && !bird.isDead,
      this
    );

    // ✅ Birds collide with platforms ONLY when falling
    this.physics.add.collider(
      this.birdsGroup,
      this.platforms,
      null,
      (bird) => bird && bird.isFalling && !bird.isDead,
      this
    );

    // ✅ Bullets hit birds (registrado UNA vez aquí)
    this.physics.add.overlap(
      this.bullets,
      this.birdsGroup,
      this.onWeaponHitsBird,
      null,
      this
    );

    this.spawnBird('SMALL', 200, BIRD_SPAWN_HEIGHTS.HIGH, 1);

    this.birdSpawnTimer = this.time.addEvent({
      delay: Phaser.Math.Between(8000, 15000),
      callback: this.spawnRandomBird,
      callbackScope: this,
      loop: true
    });

    this.input.keyboard.on('keydown-B', () => {
      this.spawnBird('SMALL', this.hero.x, 200, 1);
      console.log('Debug: Bird spawned at hero position');
    });

    // ===================== CROCODILE TESTING =====================
    this.crocodilesGroup = this.physics.add.group();

    this.physics.add.collider(this.crocodilesGroup, this.walls);
    this.physics.add.collider(this.crocodilesGroup, this.platforms);

    this.physics.add.overlap(
      this.crocodilesGroup,
      this.hero,
      this.onPlayerHitsCrocodile,
      null,
      this
    );

    this.input.keyboard.on('keydown-V', () => {
      const groundY = 700;
      this.spawnCrocodile(this.hero.x, groundY);
      console.log('Debug: Spawned crocodile with V key');
    });
  }

  spawnBird(type, x, y, direction = 1) {
    let bird;

    if (type === 'SMALL') {
      bird = new SmallBird(this, x, y, direction);
    } else {
      bird = new BigBird(this, x, y, direction);
    }

    const colors = Object.values(BIRD_COLORS);
    const randomColor = Phaser.Utils.Array.GetRandom(colors);
    bird.setTint(randomColor);

    this.birdsGroup.add(bird);

    console.log(`Spawned ${type} bird at (${x}, ${y}) moving ${direction > 0 ? 'right' : 'left'}`);

    return bird;
  }

  spawnRandomBird() {
    const maxBirds = 5;
    const aliveBirds = this.birdsGroup.getChildren().filter(b => b.active && !b.isDead);

    if (aliveBirds.length >= maxBirds) {
      console.log('Max birds reached, skipping spawn');
      return;
    }

    const types = ['SMALL'];
    const type = Phaser.Utils.Array.GetRandom(types);

    const heights = Object.values(BIRD_SPAWN_HEIGHTS);
    const y = Phaser.Utils.Array.GetRandom(heights);

    const direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;

    const x = direction > 0 ? 0 : this.walls.width;

    this.spawnBird(type, x, y, direction);
  }

  birdHitsHero(hero, bird) {
    if (bird && bird.isFlying && !bird.isDead && hero && hero.active) {
      console.log('Bird hit hero!');
      hero.takeDamage(1);
    }
  }

  spawnCrocodile(x, y) {
    const croc = new Crocodile(this, x, y);
    this.crocodilesGroup.add(croc);
    console.log(`Spawned crocodile at (${x}, ${y})`);
    return croc;
  }

  onPlayerHitsCrocodile(hero, croc) {
    if (!croc || !croc.active) return;

    if (croc.state === 'STUNNED') {
      console.log('Player hit stunned crocodile, launching!');
      croc.launchFlying(hero.x);
    }
  }

  onWeaponHitsCrocodile(weapon, croc) {
    if (!weapon || !weapon.active) return;
    if (!croc || !croc.active || croc.isDead) return;

    console.log('Weapon hit crocodile!');

    if (weapon.destroy) weapon.destroy();

    if (croc.takeDamage) croc.takeDamage();
  }

  createPlatformObjects() {
    this.platformObjects.clear();

    this.platforms.forEachTile((tile) => {
      if (tile.index > 0) {
        const key = `${tile.x}_${tile.y}`;
        const platform = new Platform(this, tile);
        this.platformObjects.set(key, platform);
      }
    });

    console.log(`Plataformas creadas: ${this.platformObjects.size}`);
  }

  createBall() {
    const startX = this.walls.width / 2;
    const startY = 200;

    const colors = Object.values(BALL_COLORS);
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const ball = new HugeBall(this, startX, startY, 1, randomColor);
    this.ballsGroup.add(ball);

    ball.body.setVelocityY(50);
    ball.body.setVelocityX(150);
  }

  bounceBall(ball, objectOrTile) {
    if (!ball || !ball.body) return;

    const now = Date.now();
    if (ball._lastBounce && now - ball._lastBounce < 100) {
      return;
    }
    ball._lastBounce = now;

    if (!ball._prevVelocity) {
      ball._prevVelocity = { x: 150, y: 400 };
    }

    if (!ball._constantBounceVel) {
      ball._constantBounceVel = {
        x: Math.abs(ball._prevVelocity.x) || 150,
        y: Math.abs(ball._prevVelocity.y) || 400
      };
      console.log('Stored constant bounce velocity:', ball._constantBounceVel);
    }

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

  bounceOffHero(hero, ball) {
    if (!ball || !ball.body || !hero || !hero.body) return;
    hero.takeDamage(1);
  }

  update() {
    // Arpón rompiendo plataformas y pelotas
    if (this.hero.activeHarpoons && this.hero.activeHarpoons.length > 0) {
      this.hero.activeHarpoons = this.hero.activeHarpoons.filter(h => h && h.active);

      this.hero.activeHarpoons.forEach(harpoon => {
        if (harpoon && harpoon.active) {
          this.physics.overlap(
            harpoon,
            this.platforms,
            this.onWeaponHitsPlatform,
            null,
            this
          );

          this.physics.overlap(
            harpoon,
            this.ballsGroup,
            this.onWeaponHitsBall,
            null,
            this
          );

          // Harpoon hits birds
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

    // Arpón Fijo rompiendo pelotas
    if (this.hero.activeFixedHarpoon && this.hero.activeFixedHarpoon.active) {
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

      this.physics.overlap(
        this.hero.activeFixedHarpoon,
        this.ballsGroup,
        this.onFixedHarpoonHitsBall,
        null,
        this
      );

      // Fixed harpoon hits birds
      this.physics.overlap(
        this.hero.activeFixedHarpoon,
        this.birdsGroup,
        this.onWeaponHitsBird,
        null,
        this
      );
    }

    // Balas destruyendo pelotas
    this.physics.overlap(this.bullets, this.ballsGroup, this.onWeaponHitsBall, null, this);

    // CHECK ITEM PICKUPS
    if (this.dropper && this.dropper.activeItems) {
      this.dropper.activeItems.getChildren().forEach(item => {
        if (item && item.active && !item.consumed) {
          item.checkPickup(this.hero);
        }
      });
    }

    // Crocodiles
    if (this.hero.activeHarpoons && this.hero.activeHarpoons.length > 0) {
      this.hero.activeHarpoons.forEach(harpoon => {
        if (harpoon && harpoon.active) {
          this.physics.overlap(
            harpoon,
            this.crocodilesGroup,
            this.onWeaponHitsCrocodile,
            null,
            this
          );
        }
      });
    }

    if (this.hero.activeFixedHarpoon && this.hero.activeFixedHarpoon.active) {
      this.physics.overlap(
        this.hero.activeFixedHarpoon,
        this.crocodilesGroup,
        this.onWeaponHitsCrocodile,
        null,
        this
      );
    }

    this.physics.overlap(
      this.bullets,
      this.crocodilesGroup,
      this.onWeaponHitsCrocodile,
      null,
      this
    );
  }

  onWeaponHitsBird(weapon, bird) {
    if (weapon && weapon.active && bird && bird.active && !bird.isDead) {
      console.log('Weapon hit bird!');

      if (weapon.destroy) weapon.destroy();

      if (bird.takeDamage) bird.takeDamage();
    }
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
      if (fixedHarpoon.onBallHit) fixedHarpoon.onBallHit();
      if (ball.takeDamage) ball.takeDamage();
    }
  }
}

export default Level_01;
