// src/scenes/Level1.js

import { Hero } from '../entities/Hero.js';
// import { Hero2 } from '../entities/Hero2.js'; // Descomenta si quieres usar el de la metralleta
import { BaseBall } from '../entities/enemies/BaseBalls.js';
import { EVENTS } from '../core/events.js';
import { GAME_SIZE } from '../core/constants.js';

export class Level1 extends Phaser.Scene 
{
    constructor() {
        super({ key: 'Level1' });
    }

    preload() 
    {
      // --- 1. CARGA DE ASSETS DEL MAPA ---
      // Ajusta las rutas si tus carpetas son distintas
      this.load.setPath('assets/sprites/backgrounds');
      this.load.image('tileset_muros_img', 'tileset_muros.png');

      this.load.setPath('assets/tiled/maps');
      this.load.tilemapTiledJSON('map_marco', 'marcoLadrillos.json');

      // --- 2. CARGA DE ASSETS DE ENTIDADES (Si no tienes una BootScene) ---
      // Héroe
      this.load.setPath('assets/sprites/spritesheets/hero');
      this.load.spritesheet('hero', 'spritesheet_player.png', { frameWidth: 32, frameHeight: 32 });
      
      this.load.setPath('assets/sprites/static');
      this.load.image('arponFijo', 'arponFijo.png'); 
        
      // Enemigos
      this.load.image('ball', 'n_big.png'); // Asegúrate de tener esta imagen
    }

    create() 
    {
      // altura del fondo / zona de juego — usar GAME_SIZE para evitar variable no definida
      const BG_HEIGHT = GAME_SIZE.HEIGHT;

        // --- CONFIGURACIÓN DEL MAPA Y FÍSICAS ---
        const bg = this.add.image(0, 0, "backgrounds", 0).setOrigin(0, 0);
        bg.setDisplaySize(GAME_SIZE.WIDTH, BG_HEIGHT);
        this.cameras.main.setBackgroundColor(0x000000);

        const map = this.make.tilemap({ key: 'map_marco' });
        
        // El primer parámetro es el nombre del tileset en Tiled, el segundo la key de la imagen en Phaser
        const tileset = map.addTilesetImage('tileset_muros', 'tileset_muros_img');
        
        // Creamos la capa de muros (asegúrate que 'layer_walls' es el nombre en Tiled)
        this.walls = map.createLayer('layer_walls', tileset, 0, 0);
        
        // Activamos colisiones para todos los tiles que no sean vacíos (-1)
        this.walls.setCollisionByExclusion([-1]);

        // Configurar límites del mundo físico según el tamaño del mapa
        this.physics.world.bounds.width = map.widthInPixels;
        this.physics.world.bounds.height = map.heightInPixels;


        // --- GRUPOS ---
        // Grupos para manejar colisiones en masa
        this.ballsGroup = this.add.group({ runChildUpdate: true });
        
        // --- INSTANCIAR HÉROE ---
        // Lo colocamos en el centro horizontal, abajo (ajusta las coordenadas según tu mapa)
        this.hero = new Hero(this, map.widthInPixels / 2, map.heightInPixels - 64, 'hero');
        
        // --- INSTANCIAR ENEMIGO INICIAL ---
        // Creamos una bola mediana (tamaño 2) rebotando
        const initialBall = new BaseBall(this, 200, 200, 'ball', 2, 1);
        this.ballsGroup.add(initialBall);

        // --- GRUPO DE BALAS ---
        this.bullets = this.add.group();

        // --- GESTIÓN DE COLISIONES ---
        
        // Héroe vs Muros
        this.physics.add.collider(this.hero, this.walls);
        
        // Bolas vs Muros (para que reboten)
        this.physics.add.collider(this.ballsGroup, this.walls);

        // Héroe vs Bolas (El héroe muere si le tocan)
        this.physics.add.collider(this.hero, this.ballsGroup, this.onHeroHitBall, null, this);


        // --- Atajo de pausa con ESC ---
        // --- Atajo de pausa con ESC ---
        this.input.keyboard.on("keydown-ESC", () => {
          this.scene.launch("PauseMenu");
          this.scene.pause();
          this.scene.bringToTop("PauseMenu");
        });

        // Asegurarse de que el spritesheet 'hero' está cargado en preload con frameWidth/frameHeight correctos.
        if (!this.anims.exists('idle')) {
            this.anims.create({
                key: 'idle',
                frames: this.anims.generateFrameNumbers('hero', { start: 0, end: 3 }), // ajusta índices
                frameRate: 6,
                repeat: -1
            });
        }
    }

    update()
    {
        // --- GESTIÓN DINÁMICA DE COLISIONES ---
        
        // 1. Arpón vs Bolas
        // Como el arpón se crea y destruye dinámicamente, comprobamos si existe y está activo
        if (this.hero.activeHarpoon && this.hero.activeHarpoon.active) {
            this.physics.overlap(
                this.hero.activeHarpoon, 
                this.ballsGroup, 
                this.onWeaponHitBall, 
                null, 
                this
            );
        }
    }

    /**
     * Callback cuando el Arpón toca una Bola
     */
    onWeaponHitBall(weapon, ball)
    {
        // 1. Destruir el arpón inmediatamente
        weapon.destroy(); 
        
        // 2. La bola recibe daño (se divide o muere)
        if (ball.active) {
            ball.takeDamage();
        }
    }

    /**
     * Callback cuando el Héroe toca una Bola
     */
    onHeroHitBall(hero, ball)
    {
        // Delegamos la lógica de daño al héroe
        hero.hit();
        
        // Opcional: Empujar un poco al héroe o dar invulnerabilidad temporal
        // para que no muera instantáneamente 3 veces seguidas.
    }
}


/*import { GAME_SIZE } from "../core/constants.js";
import { Hero } from '../entities/Hero.js';
import { Hero2 } from '../entities/Hero2.js';
import { Ball } from '../entities/enemies/Ball.js';
import { EVENTS } from '../core/events.js';

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

export default Level1;*/
