import { GAME_SIZE, HERO } from "../core/constants.js";

class Level1 extends Phaser.Scene {
    constructor() {
        super({key: 'Level1' });
    }

    preload() {
        //Cargar assets en memoria
        this.cameras.main.setBackgroundColor('#000000ff');
        this.load.setPath('assets/sprites/backgrounds');
        this.load.image('bg','tileset_muros.png');

        this.load.setPath('assets/spritesheets/hero');
        this.load.spritesheet('heroRun','player_walk.png',
        {frameWidth:435,frameHeight:118});

        this.load.setPath('assets/tiled/tilesets');
        this.load.image('tileset_walls','tileset_muros.png');

        this.load.setPath('assets/tiled/maps');
        this.load.tilemapTiledJSON('Level1','marcoLadrillos.json');
    }

    create(){
        //Pintar assets en pantalla
        //Pintamos a fondo
        this.add.tileSprite(0, 0, GAME_SIZE.WIDTH, GAME_SIZE.HEIGHT, 'bg')
        .setOrigin(0);

        //Pintamos el nivel
        //Cargo el JSON
        this.map = this.make.tilemap({ key: 'Level1' });

        //cargo los tilesets
        const ts_walls = this.map.addTilesetImage('tileset_walls');

        //Pinto las CAPAS/LAYERS
        this.walls = this.map.createLayer('layer_walls',ts_walls);


        this.walls.setCollisionByExclusion([-1]);

        this.loadAnimations();

        this.hero = this.physics.add.sprite(65,100,'hero');

        this.physics.add.collider(this.hero,this.walls);
        this.cursors = this.input.keyboard.createCursorKeys();

        this.cameras.main.startFollow(this.hero).setBounds(0,0, GAME_SIZE.WIDTH,GAME_SIZE.HEIGHT);
    }

    loadAnimations(){
        this.anims.create(
        {
            key: 'run',
            frames:this.anims.generateFrameNumbers('hero', 
            {start:0, end: 3}),
            frameRate: 10,
            repeat: -1
        });
    }

    update()
    {
        if(this.cursors.left.isDown)
        { //ME MUEVO A LA IZQUIERDA
            this.hero.body.setVelocityX(-HERO.SPEED); // ← negativo a la izquierda    
            this.hero.setFlipX(true); 
            this.hero.anims.play('run',true);   
        }else
        if(this.cursors.right.isDown)
        { //ME MUEVO A LA DERECHA
            this.hero.body.setVelocityX(HERO.SPEED); 
            this.hero.setFlipX(false);      
            this.hero.anims.play('run',true);
        }else
        {
            this.hero.body.setVelocityX(0);  
            this.hero.anims.stop().setFrame(0); 
        }   
        
        if(!this.hero.body.onFloor())
        {
            this.hero.anims.stop().setFrame(6);
        }
    }
        
}
export default Level1;