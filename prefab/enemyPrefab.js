class enemyPrefab extends Phaser.Physics.Arcade.Sprite {
	constructor(_scene, _posX, _posY, _spriteTag = 'enemy') {
		super(_scene, _posX, _posY, _spriteTag);

		_scene.add.existing(this);
		_scene.physics.world.enable(this);

		this.scene = _scene;
        this.enemy = this;
		this.spriteTag = _spriteTag;
        this.enemy.anims.play(this.spriteTag+'_run', true);
        this.enemy.direction = 1; 

		this.body.setVelocityX(gamePrefabs.ENEMY_SPEED*this.enemy.direction);
        this.setColliders();
	}

    setColliders()
    {
        this.scene.physics.add.collider
        (
            this.enemy, 
            this.scene.walls
        );
    }

	preUpdate(time, delta) {
		super.preUpdate(time, delta);
		if (this.body.blocked.right || this.body.blocked.left) 
			{
			this.enemy.direction *= -1;
			this.enemy.flipX = !this.enemy.flipX;
            this.body.setVelocityX(gamePrefabs.ENEMY_SPEED * this.enemy.direction);
		}

		// Logica para detectar el borde de una plataforma
		// Comprueba un pixel delante del borde del sprite, y justo debajo
		const aheadX = this.x + (this.body.width / 2 + 1) * this.enemy.direction;
		const belowY = this.y + (this.body.height / 2) + 1;

		// Comprueba la capa de walls para ver si hay tile colisionable bajo ese punto
		const tile = this.scene.walls.getTileAtWorldXY(aheadX, belowY);

		if (!tile)
		{
			// No hay suelo --> girar y ajustar velocidad
			this.enemy.direction *= -1;
			this.enemy.flipX = !this.enemy.flipX;
			this.body.setVelocityX(gamePrefabs.ENEMY_SPEED * this.enemy.direction);
		}
	}
}

window.enemyPrefab = enemyPrefab;