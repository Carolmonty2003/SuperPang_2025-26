// src/scenes/Level1.js

import { Hero } from '../entities/Hero.js';

import { BaseBall } from '../entities/enemies/BaseBalls.js';
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
      frameWidth: 436 / 4, // 4 frames
      frameHeight: 118,
    });
    this.load.spritesheet('player_shoot', 'player_shoot.png', {
      frameWidth: 191 / 2, // 2 frames
      frameHeight: 119,
    });

    // --- ARMA Y ENEMIGOS ---
    this.load.setPath('assets/sprites/static');
    this.load.image('arponFijo', 'arponFijo.png');
    this.load.image('ball', 'n_big.png');

    this.load.image('bullet', 'bullet.png');
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
    // this.ballsGroup = this.add.group({ runChildUpdate: true });  <-- NO queremos pelotas ahora
    this.bullets = this.add.group({ runChildUpdate: true }); 
   
    this.physics.add.collider(this.bullets, this.walls, (bullet, tile) => {
      if (bullet && bullet.active) bullet.destroy();
    });
    
    // --- HÉROE ---
    const startX = map.widthInPixels / 2;
    const startY = map.heightInPixels - 64;

    
    this.hero = new Hero(this, startX, startY, 'player_walk');
    this.physics.add.collider(this.hero, this.walls);

    // --- BOLA INICIAL ---
   
    // --- HUD EN LA BANDA INFERIOR ---
    this.hud = new Hud(this, {
      uiTop: map.heightInPixels, // empieza justo debajo del mapa
      mode: 'HARPOON',
    });

    // --- PAUSA CON ESC ---
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.launch('PauseMenu');
      this.scene.pause();
      this.scene.bringToTop('PauseMenu');
    });
  }

  update() {
    // Colisión Arpón vs bolas
    // Aquí podrás añadir overlaps bala-vs-algo cuando quieras usarlo
  }

  onWeaponHitBall(weapon, ball) {
    weapon.destroy();

    if (ball.active) {
      ball.takeDamage();
    }
  }

  onHeroHitBall(_hero, _ball)
  {
      // Usamos SIEMPRE la instancia que tenemos guardada en la escena
      if (this.hero && typeof this.hero.hit === 'function') {
          this.hero.hit();
      }
  }
}

export default Level1;
