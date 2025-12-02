// src/scenes/Level1.js
import { GAME_SIZE } from "../core/constants.js";
import { Hero2 } from "../entities/Hero2.js";

const BG_HEIGHT = 832;
const UI_HEIGHT = 96;

class Level1 extends Phaser.Scene {
  constructor() {
    super({ key: "Level1" });
  }

  preload() {
    // --- FONDO ---
    this.load.spritesheet(
      "backgrounds",
      "assets/sprites/backgrounds/backgrounds.png",
      {
        frameWidth: 256,
        frameHeight: 192,
      }
    );

    // --- TILEMAP / TILESET ---
    this.load.image(
      "tileset_muros_img",
      "assets/sprites/backgrounds/tileset_muros.png"
    );
    this.load.tilemapTiledJSON(
      "map_marco",
      "assets/tiled/maps/marcoLadrillos.json"
    );

    // --- HARPOON ASSETS (por si sigues usando el Hero normal en otro sitio) ---
    this.load.image("arponFijo", "assets/sprites/static/arponFijo.png");

    // --- BULLET ASSET (metralleta) ---
    // Usa la ruta que tú tengas. Esto es un ejemplo:
    this.load.image("bullet", "assets/sprites/static/bullet.png");

    // --- HERO SPRITESHEETS ---
    this.load.setPath("assets/sprites/spritesheets/hero");

    this.load.spritesheet("player_walk", "player_walk.png", {
      frameWidth: 435 / 4,
      frameHeight: 118,
    });

    this.load.spritesheet("player_shoot", "player_shoot.png", {
      frameWidth: 191 / 2,
      frameHeight: 119,
    });
  }

  create() {
    // --- FONDO ---
    const bg = this.add.image(0, 0, "backgrounds", 0).setOrigin(0, 0);
    bg.setDisplaySize(GAME_SIZE.WIDTH, BG_HEIGHT);
    this.cameras.main.setBackgroundColor(0x000000);

    // --- MAPA ---
    const map = this.make.tilemap({ key: "map_marco" });
    const tileset = map.addTilesetImage("tileset_muros", "tileset_muros_img");
    const wallsLayer = map.createLayer("layer_walls", tileset, 0, 0);
    wallsLayer.setCollisionByExclusion([-1]);

    this.map = map;
    this.walls = wallsLayer;

    // --- GRUPO DE BALAS ---
    this.bullets = this.add.group();

    // --- HERO2 (metralleta) ---
    const startX = 200;
    const startY = 200;
    this.hero = new Hero2(this, startX, startY, "player_walk");

    // --- EJEMPLO: UI en la franja negra (opcional) ---
    // Puedes colocar tu HUD aquí, entre y = 832 y y = 928
    // const uiY = BG_HEIGHT;
    // this.add.text(20, uiY + 16, "VIDAS: 7", {
    //   fontSize: "24px",
    //   color: "#ffffff",
    // });

    // (Opcional) ver colisiones de tiles
    // const debugGraphics = this.add.graphics().setAlpha(0.5);
    // wallsLayer.renderDebug(debugGraphics, {
    //   tileColor: null,
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255),
    // });
        // --- Atajo de pausa con ESC ---
  // --- Atajo de pausa con ESC ---
  this.input.keyboard.on("keydown-ESC", () => {
    this.scene.launch("PauseMenu");
    this.scene.pause();
    this.scene.bringToTop("PauseMenu");
  });
  }

  update(time, delta) {
    // Hero2 ya usa preUpdate, no hace falta nada aquí de momento
  }
}

export default Level1;
