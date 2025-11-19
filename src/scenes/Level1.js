// src/scenes/Level1.js
import { GAME_SIZE } from "../core/constants.js";
import { Hero } from "../entities/Hero.js";

class Level1 extends Phaser.Scene {
    constructor() {
        super({ key: "Level1" });
    }

    preload() {
        // --- FONDO ---
        this.load.image("bg_01", "assets/sprites/backgrounds/bg_01.png");

        // --- TILEMAP / TILESET ---
        this.load.image(
            "tileset_muros_img",
            "assets/sprites/backgrounds/tileset_muros.png"
        );
        this.load.tilemapTiledJSON(
            "map_marco",
            "assets/tiled/maps/marcoLadrillos.json"
        );

        // --- HERO SPRITESHEETS ---
        this.load.setPath("assets/sprites/spritesheets/hero");

        this.load.spritesheet("player_walk", "player_walk.png", {
            frameWidth: 435 / 4,
            frameHeight: 118
        });

        this.load.spritesheet("player_shoot", "player_shoot.png", {
            frameWidth: 191 / 2,
            frameHeight: 119
        });
    }

    create() {
        // --- FONDO ---
        const bg = this.add.image(0, 0, "bg_01").setOrigin(0, 0);
        bg.setDisplaySize(GAME_SIZE.WIDTH, GAME_SIZE.HEIGHT);

        // --- MAPA ---
        const map = this.make.tilemap({ key: "map_marco" });
        const tileset = map.addTilesetImage("tileset_muros", "tileset_muros_img");
        const wallsLayer = map.createLayer("layer_walls", tileset, 0, 0);

        // Hacer que TODOS los tiles no vacíos de esta capa colisionen
        wallsLayer.setCollisionByExclusion([-1]);

        this.map = map;
        this.walls = wallsLayer;

        // --- HERO ---
        // Spawnear más o menos en el centro y por encima del suelo
        const startX = 200;
        const startY = 200; // 3 tiles por encima del fondo

        this.hero = new Hero(this, startX, startY, "player_walk");

        // (Opcional) ver colisiones de tiles
        // const debugGraphics = this.add.graphics().setAlpha(0.5);
        // wallsLayer.renderDebug(debugGraphics, {
        //     tileColor: null,
        //     collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
        //     faceColor: new Phaser.Display.Color(40, 39, 37, 255)
        // });
    }

    update(time, delta) {
        // De momento nada aquí
    }
}

export default Level1;
