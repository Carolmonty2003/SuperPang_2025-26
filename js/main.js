const gamePrefabs = {
    gameWidth: 960,
    gameHeight: 540,
    level1Width: 1280, //40*32
    level1Height: 800, //25*32
    GRAVITY: 1000,
    HERO_SPEED: 200,
    ENEMY_SPEED: 120,
    HERO_JUMP: -450
}

var config = {
    type:Phaser.AUTO,
    width: gamePrefabs.gameWidth,
    height: gamePrefabs.gameHeight,
    scene:[level1],
    render: { pixelArt: true },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: gamePrefabs.GRAVITY },
            debug: true
        }
    },
    scale:
    {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: gamePrefabs.gameWidth/2,
        height: gamePrefabs.gameHeight/2
    }
}

var juego = new Phaser.Game(config);