// src/scenes/Level_01.js

import { Hero } from "../entities/Hero.js";
import { GAME_SIZE } from "../core/constants.js";

export class Level_01 extends Phaser.Scene {
  constructor() {
    super({ key: "Level_01" });
  }

  preload() {
    // --- 1. FONDO + TILESET MUROS ---
    this.load.setPath("assets/sprites/backgrounds");
    this.load.spritesheet("backgrounds", "backgrounds.png", {
      frameWidth: 256,
      frameHeight: 192,
    });

    // Mismos muros que en tu Level1
    this.load.image("tileset_muros_img", "tileset_muros.png");

    // --- 2. TILESET PLATAFORMAS ---
    // ⚠️ IMPORTANTE: aquí es donde Phaser está dando el 404
    // Asegúrate de que tileset_platform.png está REALMENTE en esta carpeta:
    //   assets/tiled/maps/tilesets/tileset_platform.png
    this.load.setPath("assets/tiled/maps/tilesets");
    this.load.image("tileset_platform_img", "tileset_platform.png");

    // --- 3. TILEMAP NUEVO ---
    this.load.setPath("assets/tiled/maps");
    this.load.tilemapTiledJSON("map_level_01", "Level_01.json");

    // --- 4. SPRITES DEL HÉROE (los que usa Hero.js) ---
    this.load.setPath("assets/sprites/spritesheets/hero");
    this.load.spritesheet("player_walk", "player_walk.png", {
      frameWidth: 436 / 4, // 4 frames
      frameHeight: 118,
    });

    this.load.spritesheet("player_shoot", "player_shoot.png", {
      frameWidth: 191 / 2, // 2 frames
      frameHeight: 119,
    });

    // --- 5. ARMA ---
    this.load.setPath("assets/sprites/static");
    this.load.image("arponFijo", "arponFijo.png");
    this.load.image("bullet", "bullet.png");
  }

  create() {
    const BG_HEIGHT = GAME_SIZE.HEIGHT;

    // --- FONDO ---
    const bg = this.add.image(0, 0, "backgrounds", 3).setOrigin(0, 0);
    bg.setDisplaySize(GAME_SIZE.WIDTH, BG_HEIGHT);
    this.cameras.main.setBackgroundColor(0x000000);

    // --- MAPA DE TILED ---
    const map = this.make.tilemap({ key: "map_level_01" });

    // Estos nombres tienen que coincidir con Tiled:
    //  - tileset_muros
    //  - tileset_platform
    const tilesetMuros = map.addTilesetImage(
      "tileset_muros",
      "tileset_muros_img"
    );
    const tilesetPlatform = map.addTilesetImage(
      "tileset_platform",
      "tileset_platform_img"
    );

    this.walls = map.createLayer("layer_walls", tilesetMuros, 0, 0);
    this.platforms = map.createLayer("layer_platforms", tilesetPlatform, 0, 0);

    this.walls.setCollisionByExclusion([-1]);
    this.platforms.setCollisionByExclusion([-1, 0]);

    // Mundo físico
    this.physics.world.setBounds(
      0,
      0,
      map.widthInPixels,
      map.heightInPixels
    );

    // --- HÉROE ---
    const startX = map.widthInPixels / 2;
    const startY = map.heightInPixels - 64;

    // Hero usa player_walk en su createAnimations
    this.hero = new Hero(this, startX, startY, "player_walk");

    this.physics.add.collider(this.hero, this.walls);
    this.physics.add.collider(this.hero, this.platforms);

    // --- ANIMACIÓN IDLE (para que no pete al hacer this.hero.play("idle")) ---
    if (!this.anims.exists("idle")) {
      this.anims.create({
        key: "idle",
        frames: this.anims.generateFrameNumbers("player_walk", {
          start: 0,
          end: 3,
        }),
        frameRate: 6,
        repeat: -1,
      });
    }

    this.hero.play("idle");

    // --- PAUSA CON ESC ---
    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.launch("PauseMenu");
      this.scene.pause();
      this.scene.bringToTop("PauseMenu");
    });
  }

  update(time, delta) {
    // De momento nada, HeroBase ya se encarga del movimiento
  }
}

export default Level_01;
