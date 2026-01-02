// src/scenes/Level_01.js

import { Hero } from "../entities/Hero.js";
import { GAME_SIZE } from "../core/constants.js";
import { Hud } from "../UI/HUD.js";
import { Platform } from "../objects/Platform.js";
import { HugeBall, BALL_COLORS } from "../entities/enemies/BaseBalls.js";

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
      frameWidth: 436 / 4,
      frameHeight: 118
    });

    this.load.spritesheet("player_shoot", "player_shoot.png", {
      frameWidth: 191 / 2,
      frameHeight: 119
    });

    // --- 5. ARMA ---
    this.load.setPath("assets/sprites/static");
    this.load.image("arponFijo", "arponFijo.png");
    this.load.image("bullet", "bullet.png");

    // --- 6. PELOTAS ---
    this.load.setPath("assets/sprites/static");
    this.load.image("n_huge", "n_huge.png");
    this.load.image("n_big", "n_big.png");
    this.load.image("n_mid", "n_mid.png");
    this.load.image("n_small", "n_small.png");
    this.load.image("n_tiny1", "n_tiny1.png");
    this.load.image("n_tiny2", "n_tiny2.png");
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
    const tilesetPlatform = map.addTilesetImage("tileset_platform", "tileset_platform_img");

    this.walls = map.createLayer("layer_walls", tilesetMuros, 0, 0);
    this.platforms = map.createLayer("layer_platforms", tilesetPlatform, 0, 0);

    // Colisión tiles (IMPORTANTE: los tiles deben tener collision shape en Tiled)
    this.walls.setCollisionByExclusion([-1]);
    this.platforms.setCollisionByExclusion([-1, 0]);

    this.createPlatformObjects();

    // Bounds mundo físico
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // --- INPUT (por si Hero lo necesita desde la Scene) ---
    // Muchos Hero.js usan this.scene.cursors / this.scene.keyShoot o similares
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyShoot = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // --- GRUPO DE BALAS ---
    this.bullets = this.add.group({ runChildUpdate: true });

    // --- GRUPO DE PELOTAS ---
    this.ballsGroup = this.physics.add.group();

    // Balas chocan con walls -> se destruyen
    this.physics.add.collider(this.bullets, this.walls, (bullet) => {
      if (bullet && bullet.active) bullet.destroy();
    });

    // Balas rompen plataformas
    this.physics.add.collider(
      this.bullets,
      this.platforms,
      this.onWeaponHitsPlatform,
      null,
      this
    );

    // --- HERO ---
    const startX = map.widthInPixels / 2;
    const startY = map.heightInPixels - 64;
    this.hero = new Hero(this, startX, startY, "player_walk");

    // Hacer al héroe completamente inmovable para que las bolas NO lo puedan empujar
    this.hero.body.immovable = true;
    this.hero.body.pushable = false;
    this.hero.body.moves = true; // Puede moverse por input del usuario
    this.hero.body.setMass(10000); // Masa muy alta para que no sea movido por colisiones

    // Si tu Hero usa props de teclas internas, le damos también referencias típicas
    // (No rompe nada si Hero no las usa)
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
        frames: this.anims.generateFrameNumbers("player_walk", { start: 0, end: 2 }),
        frameRate: 6,
        repeat: -1
      });
    }
    this.hero.play("idle");

    // --- PELOTA INICIAL ---
    this.createBall();

    // --- HUD ---
    this.hud = new Hud(this, {
      uiTop: map.heightInPixels,
      mode: "HARPOON"
    });

    // --- PAUSA ---
    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.launch("PauseMenu");
      this.scene.pause();
      this.scene.bringToTop("PauseMenu");
    });
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
      console.log('Stored constant bounce velocity:', ball._constantBounceVel);
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

  update() {
    // Arpón rompiendo plataformas y pelotas
    if (this.hero.activeHarpoon && this.hero.activeHarpoon.active) {
      this.physics.overlap(
        this.hero.activeHarpoon,
        this.platforms,
        this.onWeaponHitsPlatform,
        null,
        this
      );

      this.physics.overlap(
        this.hero.activeHarpoon,
        this.ballsGroup,
        this.onWeaponHitsBall,
        null,
        this
      );
    }

    // Balas destruyendo pelotas
    this.physics.overlap(this.bullets, this.ballsGroup, this.onWeaponHitsBall, null, this);
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
}

export default Level_01;
0