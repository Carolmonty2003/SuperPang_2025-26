// src/scenes/Level1.js

import { Hero } from '../entities/Hero.js';

import { HugeBall } from '../entities/enemies/balls/normal/HugeBall.js';
import { HexBigBall } from '../entities/enemies/balls/hexagonal/HexBigBall.js';
import { BALL_COLORS } from '../entities/enemies/balls/BallConstants.js';
import { GAME_SIZE } from '../core/constants.js';
import { Hud } from '../UI/HUD.js';

export class Level1 extends Phaser.Scene {
  constructor() {
    super({ key: 'Level1' });
  }

  preload() {
    // --- FONDO Y TILEMAP ---
    this.load.setPath('assets/sprites/backgrounds');
   	this.load.spritesheet('backgrounds', 'backgrounds.png', {
      frameWidth: 256,
      frameHeight: 192,
    });
    this.load.image('tileset_muros_img', 'tileset_muros.png');

    this.load.setPath('assets/tiled/maps');
    this.load.tilemapTiledJSON('map_marco', 'marcoLadrillos.json');

    // --- SPRITES DEL HÉROE (los que usa Hero.js) ---
    this.load.setPath('assets/sprites/spritesheets/hero');
    this.load.spritesheet('player_walk', 'player_walk.png', {
      frameWidth: 109, // 4 frames
      frameHeight: 118,
    });
    this.load.spritesheet('player_shoot', 'player_shoot.png', {
      frameWidth: 96, // 2 frames
      frameHeight: 119,
    });

    // --- ARMA ---
    this.load.setPath('assets/sprites/static');
    this.load.image('arponFijo', 'arponFijo.png');
    this.load.image('bullet', 'bullet.png');

    // --- PELOTAS ---
    this.load.image('n_huge', 'n_huge.png');
    this.load.image('n_big', 'n_big.png');
    this.load.image('n_mid', 'n_mid.png');
    this.load.image('n_small', 'n_small.png');
    this.load.image('n_tiny1', 'n_tiny1.png');
    this.load.image('n_tiny2', 'n_tiny2.png');

    // --- PELOTAS HEXAGONALES ---
    this.load.setPath('assets/sprites/spritesheets/Balls');
    this.load.spritesheet('hex_big', 'hex_big.png', {
      frameWidth: 98 / 3,
      frameHeight: 30
    });
    this.load.spritesheet('hex_mid', 'hex_mid.png', {
      frameWidth: 52 / 3,
      frameHeight: 16
    });
    this.load.spritesheet('hex_small', 'hex_small.png', {
      frameWidth: 33 / 3,
      frameHeight: 10
    });
  }

  create() {
    // --- MAPA ---
    const map = this.make.tilemap({ key: 'map_marco' });
    const tileset = map.addTilesetImage('tileset_muros', 'tileset_muros_img');
    this.walls = map.createLayer('layer_walls', tileset, 0, 0);
    this.walls.setCollisionByExclusion([-1]);

    // Mundo físico solo hasta la altura del mapa (ej: 832)
    this.physics.world.bounds.width = map.widthInPixels;
    this.physics.world.bounds.height = map.heightInPixels;

    // --- FONDO SOLO EN 0–alturaMapa ---
    const bg = this.add.image(0, 0, 'backgrounds', 0).setOrigin(0, 0);
    bg.setDisplaySize(GAME_SIZE.WIDTH, map.heightInPixels);

    // el fondo va al fondo de todo
    bg.setDepth(-2);

    this.cameras.main.setBackgroundColor(0x000000);



    // --- GRUPOS ---
    this.ballsGroup = this.physics.add.group();
    this.bullets = this.add.group({ runChildUpdate: true }); 
   
    this.physics.add.collider(this.bullets, this.walls, (bullet, tile) => {
      if (bullet && bullet.active) bullet.destroy();
    });
    
    // --- HÉROE ---
    const startX = map.widthInPixels / 2;
    const startY = map.heightInPixels - 64;

    
    this.hero = new Hero(this, startX, startY, 'player_walk');
    this.physics.add.collider(this.hero, this.walls);

    // --- COLISIONES BOLAS ---
    this.physics.add.collider(this.ballsGroup, this.walls, this.bounceBall, null, this);
    this.physics.add.overlap(this.ballsGroup, this.hero, this.onHeroHitBall, null, this);

    // --- BOLA INICIAL ---
    this.createBall();
   
    // --- HUD EN LA BANDA INFERIOR ---
    this.hud = new Hud(this, {
      uiTop: map.heightInPixels, // empieza justo debajo del mapa
      mode: 'HARPOON',
    });

    // --- PAUSA CON ESC ---
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.launch('PauseMenu', { from: 'Level1' });
      this.scene.pause();
      this.scene.bringToTop('PauseMenu');
    });
  }

  createBall() {
    const startX = this.walls.width / 2;
    const startY = 200;

    // Crear pelota hexagonal para testear
    const ball = new HexBigBall(this, startX, startY, 1, 1);
    this.ballsGroup.add(ball);
  }

  bounceBall(ball, objectOrTile) {
    if (!ball || !ball.body) return;

    // Cooldown para evitar rebotes múltiples
    const now = Date.now();
    if (ball._lastBounce && now - ball._lastBounce < 100) {
      return;
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
    }

    // Rebote perfecto: usar velocidad constante guardada
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

  update() {
    // Colisión Arpón vs bolas
    if (this.hero.activeHarpoon && this.hero.activeHarpoon.active) {
      this.physics.overlap(
        this.hero.activeHarpoon,
        this.ballsGroup,
        this.onWeaponHitBall,
        null,
        this
      );
    }

    // Balas destruyendo pelotas
    this.physics.overlap(this.bullets, this.ballsGroup, this.onWeaponHitBall, null, this);
  }

  onWeaponHitBall(weapon, ball) {
    if (weapon && weapon.active && ball && ball.active) {
      if (weapon.destroy) weapon.destroy();
      if (ball.takeDamage) ball.takeDamage();
    }
  }

  onHeroHitBall(hero, ball)
  {
      // El héroe recibe daño cuando toca la pelota
      if (hero && typeof hero.takeDamage === 'function') {
          hero.takeDamage(1);
      }
  }
}

export default Level1;
