// src/scenes/Level1.js

import { Hero } from '../entities/Hero.js';
// import { Hero2 } from '../entities/Hero2.js'; // Descomenta si quieres usar el de la metralleta
import { GAME_SIZE } from '../core/constants.js';

export class Level1 extends Phaser.Scene {
  constructor() {
    super({ key: "Level1" });
  }

  preload() {
    // --- 1. FONDO ---
    this.load.setPath("assets/sprites/backgrounds");
    this.load.spritesheet("backgrounds", "backgrounds.png", {
      frameWidth: 256,
      frameHeight: 192,
    });

    // --- 2. TILEMAP / TILESET ---
    this.load.image("tileset_muros_img", "tileset_muros.png");

    this.load.setPath("assets/tiled/maps");
    this.load.tilemapTiledJSON("map_marco", "marcoLadrillos.json");

    // --- 3. SPRITES DEL HÉROE ---
    this.load.setPath("assets/sprites/spritesheets/hero");
    this.load.spritesheet("player_walk", "player_walk.png", {
      frameWidth: 435 / 4, // 4 frames
      frameHeight: 118,
    });

    this.load.spritesheet("player_shoot", "player_shoot.png", {
      frameWidth: 191 / 2, // 2 frames
      frameHeight: 119,
    });

    // --- 4. ARPÓN CLÁSICO ---
    this.load.setPath("assets/sprites/static");
    this.load.image("arponFijo", "arponFijo.png");
  }

  create() {
    const BG_HEIGHT = GAME_SIZE.HEIGHT;

    // --- FONDO ---
    const bg = this.add.image(0, 0, "backgrounds", 0).setOrigin(0, 0);
    bg.setDisplaySize(GAME_SIZE.WIDTH, BG_HEIGHT);

    this.cameras.main.setBackgroundColor(0x000000);

    // --- MAPA DE TILED ---
    const map = this.make.tilemap({ key: "map_marco" });
    const tileset = map.addTilesetImage("tileset_muros", "tileset_muros_img");

    // Capa de muros (asegúrate que se llama igual en Tiled)
    this.walls = map.createLayer("layer_walls", tileset, 0, 0);
    this.walls.setCollisionByExclusion([-1]);

    // Límites del mundo físico según el mapa
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // --- HÉROE ---
    // X: mitad del mapa, Y: mitad de altura -> cae hasta el suelo y ves colisiones
    const startX = map.widthInPixels / 2;
    const startY = map.heightInPixels / 2;

    this.hero = new Hero(this, startX, startY, "player_walk");
    // this.hero = new Hero2(this, startX, startY, "player_walk");

    // Colisión del héroe con los muros
    this.physics.add.collider(this.hero, this.walls);

    // El héroe arranca en idle
    this.hero.play("idle");

    // --- PAUSA CON ESC ---
    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.launch("PauseMenu");
      this.scene.pause();
      this.scene.bringToTop("PauseMenu");
    });
  }

  update(time, delta) {
    // El movimiento + disparo se controla desde HeroBase.preUpdate()
  }
}

export default Level1;
