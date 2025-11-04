class heroPrefab extends Phaser.Physics.Arcade.Sprite {
	constructor(_scene, _posX, _posY, _spriteTag = 'hero') {
		super(_scene, _posX, _posY, _spriteTag);

		_scene.add.existing(this);
		_scene.physics.world.enable(this);

		this.scene = _scene;
        this.hero = this;
		this.spriteTag = _spriteTag;
        this.hero.anims.play(this.spriteTag+'_run', true);
        this.hero.direction = 1; 

        this.cursors = this.scene.input.keyboard.createCursorKeys();

        this.setColliders();
	}

    setColliders()
    {
        this.scene.physics.add.collider
        (
            this.hero, 
            this.scene.walls
        );
    }

	preUpdate(time, delta) {
		super.preUpdate(time, delta);

        if(this.cursors.left.isDown)
            {
            this.hero.body.setVelocityX(-gamePrefabs.HERO_SPEED);
            this.hero.setFlipX(true);
            this.hero.anims.play('hero_run', true);
        }
        else if(this.cursors.right.isDown)
        {
            this.hero.body.setVelocityX(gamePrefabs.HERO_SPEED);
            this.hero.setFlipX(false);
            this.hero.anims.play('hero_run', true);
        }
        else
        {
            this.hero.body.setVelocityX(0);
            this.hero.anims.stop().setFrame(0);//poner el idle cuando quieto
        }

        //salto
        if(this.cursors.space.isDown 
            && this.hero.body.onFloor() 
            //&& this.hero.body.blocked.down //esto es lo mismo que onFloor()
            && Phaser.Input.Keyboard.DownDuration(this.cursors.space, 250)
        )
        {
            this.hero.body.setVelocityY(gamePrefabs.HERO_JUMP);
        }
        if(!this.hero.body.onFloor())
        {
            this.hero.anims.stop().setFrame(6);//paras la animación y pones el frame de salto
        }
	}
}

//window.enemyPrefab = enemyPrefab;