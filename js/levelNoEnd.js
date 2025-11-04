class levelNoEnd extends Phaser.Scene 
{
    constructor() 
    {
        super("levelNoEnd");
    }

    preload() 
    {//Cargamos assets
       this.cameras.main.setBackgroundColor('666');
       this.load.setPath('assets/sprites');
       this.load.image('bg', 'bg_green_tile.png');
       
       //cargamos hero
       this.load.spritesheet('hero', 'hero.png',
        { frameWidth: 32, frameHeight: 32 });

        //cargamos enemigo
        this.load.spritesheet('enemy', 'jumper.png',
        { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('enemy2', 'slime.png',
        { frameWidth: 32, frameHeight: 32 });

        this.load.image('entry', 'spr_door_closed_0.png');

        this.load.setPath('assets/tilesets');
        this.load.image('tileset_walls', 'tileset_walls.png');
        this.load.image('tileset_moss', 'tileset_moss.png');

        this.load.setPath('assets/maps');
        this.load.tilemapTiledJSON('level1', 'level1.json');
    }

    create() 
    {//Pintamos assets en la pantalla
        //Pintamos el fondo
        this.bg = this.add.tileSprite(0, 0, gamePrefabs.level1Width, gamePrefabs.level1Height, 'bg')
        .setOrigin(0);

        //Pinyamos el nivel
        //Cargo el json del mapa
        this.map = this.add.tilemap('level1');
        
        //cargo los tilesets
        this.map.addTilesetImage('tileset_walls');
        this.map.addTilesetImage('tileset_moss');

        //pinto las capas/layer
        this.walls = this.map.createLayer('layer_walls', 'tileset_walls');
        this.map.createLayer('layer_moss_up', 'tileset_moss');
        this.map.createLayer('layer_moss_left', 'tileset_moss');
        this.map.createLayer('layer_moss_right', 'tileset_moss');
        this.map.createLayer('layer_moss_down', 'tileset_moss');

        //Defino con que se colisiona en la layer_walls
        //this.map.setCollisionBetween(1, 11, true, true, 'layer_walls');
        //internamente en los mapas retsa -1 a todos los tiles y los que quedan son los que colisionan
        //asi q el 0 es -1.
        this.map.setCollisionByExclusion(-1, true, true, 'layer_walls');

        this.entry = this.add.sprite(65, 268, 'entry');
        //this.entry.body.setAllowGravity(false); //si solo ponemos setImmovable(true) la gravedad sigue afectando al objeto y cae la plataforma como suello falso llevandosela por delante
        //this.entry.body.setImmovable(true);
        
        this.hero = new heroPrefab(this, 65, 100, 'hero');

        this.loadAnimations();

        //this.physics.add.collider(this.hero, this.entry);
        //this.physics.add.collider(this.hero, this.walls);

        // crea enemy como instancia de enemyPrefab
        this.enemy = new enemyPrefab(this, 240, 304, 'enemy');

        this.enemy2 = new enemyPrefab(this, 656, 272, 'enemy2');

        this.cameras.main.startFollow(this.hero);
        this.cameras.main.setBounds(0, 0, gamePrefabs.level1Width, gamePrefabs.level1Height);

    }

    loadAnimations(){
        this.anims.create({
            key: 'hero_run',
            frames: this.anims.generateFrameNumbers('hero', { start: 2, end: 5 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'enemy_run',
            frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'enemy2_run',
            frames: this.anims.generateFrameNumbers('enemy2', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
    }

    update()
    {
        
    }
}