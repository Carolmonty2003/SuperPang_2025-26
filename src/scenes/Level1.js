// src/scenes/Level1.js

import { Hero } from '../entities/Hero.js';
import { BaseBalls } from '../entities/enemies/BaseBalls.js';
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
      frameWidth: 436 / 4,
      frameHeight: 118,
    });

    this.load.spritesheet("player_shoot", "player_shoot.png", {
      frameWidth: 191 / 2,
      frameHeight: 119,
    });

    // --- 4. ARPÓN + BALAS ---
    this.load.setPath("assets/sprites/static");
    this.load.image("arponFijo", "arponFijo.png");
    this.load.image("bullet", "bullet.png");

    // --- 5. BOLAS ---
    this.load.setPath("assets/sprites/spritesheets/Balls");
    this.load.image("sp_big", "sp_big.png");
    // (si luego quieres usar las otras, también puedes cargarlas aquí)
    // this.load.image("sp_mid", "sp_mid.png");
    // this.load.image("hex_big", "hex_big.png");
    // this.load.image("hex_mid", "hex_mid.png");
    // this.load.image("hex_small", "hex_small.png");
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

    // --- GRUPOS ---
    // Grupo de bolas
    this.ballsGroup = this.physics.add.group();

    // Grupo de arpones (se rellenará desde Harpoon.js)
    this.harpoonsGroup = this.physics.add.group();

    // Grupo de balas (se rellenará desde bullet.js)
    this.bulletsGroup = this.physics.add.group();

    // --- HÉROE ---
    const startX = map.widthInPixels / 2;
    const startY = map.heightInPixels / 2;

    this.hero = new Hero(this, startX, startY, "player_walk");

    // Colisión del héroe con los muros
    this.physics.add.collider(this.hero, this.walls);

    // El héroe arranca en idle
    this.hero.play("idle");

    // --- SPAWN DE UNA BOLA INICIAL ---
    // size = 3 → bola grande, direction = 1 → hacia la derecha
    const initialBallX = map.widthInPixels * 0.25;
    const initialBallY = 100;

    const firstBall = new BaseBalls(this, initialBallX, initialBallY, "ball", 3, 1);
    this.ballsGroup.add(firstBall);

    // --- COLISIONES / OVERLAPS ---

    // 1) Bolas ↔ paredes del mapa
    this.physics.add.collider(this.ballsGroup, this.walls);

    // 2) Bolas ↔ héroe (daño al jugador)
    this.physics.add.overlap(
      this.hero,
      this.ballsGroup,
      this.handleHeroHitBall,
      undefined,
      this
    );

    // 3) Bolas ↔ arpones
    this.physics.add.overlap(
      this.ballsGroup,
      this.harpoonsGroup,
      this.handleHarpoonHitsBall,
      undefined,
      this
    );

    // 4) Bolas ↔ balas
    this.physics.add.overlap(
      this.ballsGroup,
      this.bulletsGroup,
      this.handleBulletHitsBall,
      undefined,
      this
    );

    // --- PAUSA CON ESC ---
    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.launch("PauseMenu");
      this.scene.pause();
      this.scene.bringToTop("PauseMenu");
    });
  }

  // Héroe golpeado por bola
  handleHeroHitBall(hero, ball) {
    if (!hero.active || !ball.active) return;

    if (typeof hero.takeDamage === "function") {
      hero.takeDamage(1);
    }

    // Si quieres que la bola siga existiendo, no la toques
    // Si quisieras que desapareciera al golpear, podrías hacer:
    // ball.takeDamage ? ball.takeDamage() : ball.destroy();
  }

  // Arpón golpea bola
  handleHarpoonHitsBall(ball, harpoon) {
    if (!ball.active || !harpoon.active) return;

    if (typeof ball.takeDamage === "function") {
      ball.takeDamage(); // se encarga de partirse y sumar puntuación
    } else {
      ball.destroy();
    }

    // Destruir el arpón correctamente (avisando al héroe)
    if (typeof harpoon.destroyHarpoon === "function") {
      harpoon.destroyHarpoon();
    } else {
      harpoon.destroy();
      if (this.hero && typeof this.hero.harpoonDestroyed === "function") {
        this.hero.harpoonDestroyed();
      }
    }
  }

  // Bala golpea bola
  handleBulletHitsBall(ball, bullet) {
    if (!ball.active || !bullet.active) return;

    if (typeof ball.takeDamage === "function") {
      ball.takeDamage();
    } else {
      ball.destroy();
    }

    bullet.destroy();
  }

  update(time, delta) {
    // El movimiento + disparo se controla desde HeroBase.preUpdate()
  }
}

export default Level1;
