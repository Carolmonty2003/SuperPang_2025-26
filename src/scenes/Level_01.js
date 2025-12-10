// src/scenes/Level_01.js

import { Hero } from "../entities/Hero.js";
import { GAME_SIZE } from "../core/constants.js";
import { Hud } from "../UI/HUD.js";
import { Platform } from "../objects/Platform.js";

export class Level_01 extends Phaser.Scene {
  constructor() {
    super({ key: "Level_01" });
    
    // Map para guardar las instancias de Platform por cada tile
    this.platformObjects = new Map();
  }

  preload() {
    // --- 1. FONDO ---
    this.load.setPath("assets/sprites/backgrounds");
    this.load.spritesheet("backgrounds", "backgrounds.png", {
      frameWidth: 256,
      frameHeight: 192,
    });

    // --- 2. TILESETS (MUROS Y PLATAFORMAS) ---
    this.load.setPath("assets/tiled/tilesets");
    this.load.image("tileset_muros_img", "tileset_muros.png");
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
    // La imagen ocupa todo el alto del juego,
    // pero la parte jugable será la del tilemap (por encima del HUD).
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

    // Crear instancias de Platform para cada tile de plataforma
    this.createPlatformObjects();

    // Mundo físico
    this.physics.world.setBounds(
      0,
      0,
      map.widthInPixels,
      map.heightInPixels
    );

    // --- GRUPO DE BALAS (igual que en Level1) ---
    this.bullets = this.add.group({ runChildUpdate: true });

    // Balas que se destruyen al chocar con las PAREDES
    this.physics.add.collider(this.bullets, this.walls, (bullet, tile) => {
      if (bullet && bullet.active) bullet.destroy();
    });

    // Balas que rompen PLATAFORMAS
    this.physics.add.collider(
      this.bullets,
      this.platforms,
      this.onWeaponHitsPlatform,
      null,
      this
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

    // --- HUD EN LA BANDA INFERIOR (igual que Level1) ---
    this.hud = new Hud(this, {
      uiTop: map.heightInPixels, // empieza justo debajo del mapa
      mode: "HARPOON",
    });

    // --- PAUSA CON ESC ---
    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.launch("PauseMenu");
      this.scene.pause();
      this.scene.bringToTop("PauseMenu");
    });
  }

  /**
   * Crea instancias de Platform para cada tile de plataforma en el layer
   */
  createPlatformObjects() {
    this.platformObjects.clear();
    
    // Recorrer todos los tiles del layer de plataformas
    this.platforms.forEachTile((tile) => {
      // Solo procesar tiles que tengan un index válido (no vacíos)
      if (tile.index > 0) {
        // Crear una clave única para este tile
        const key = `${tile.x}_${tile.y}`;
        
        // Crear una instancia de Platform y guardarla
        const platform = new Platform(this, tile);
        this.platformObjects.set(key, platform);
      }
    });
    
    console.log(`Plataformas creadas: ${this.platformObjects.size}`);
  }

  update(time, delta) {
    // De momento nada, HeroBase ya se encarga del movimiento

    // Arpón rompiendo PLATAFORMAS
    if (this.hero.activeHarpoon && this.hero.activeHarpoon.active) {
      this.physics.overlap(
        this.hero.activeHarpoon,
        this.platforms,
        this.onWeaponHitsPlatform,
        null,
        this
      );
    }
  }

  /**
   * Callback común para cuando un arma (arpón o bala) golpea una plataforma.
   * weapon: Sprite (Harpoon o Bullet)
   * tile:   Phaser.Tilemaps.Tile
   */
  onWeaponHitsPlatform(weapon, tile) {
    // Buscar el objeto Platform correspondiente a este tile
    const key = `${tile.x}_${tile.y}`;
    const platform = this.platformObjects.get(key);
    
    if (platform) {
      // Usar el método break() de Platform
      platform.break(weapon);
      
      // Eliminar de nuestro Map
      this.platformObjects.delete(key);
      
      console.log(`Plataforma destruida en (${tile.x}, ${tile.y}). Restantes: ${this.platformObjects.size}`);
    }
  }
}

export default Level_01;
