/**
 * Clase Padre para los héroes.
 * Maneja el movimiento, colisiones básicas y salud.
 */
import { HERO, GAME_SIZE } from '../core/constants.js';
import { EVENTS } from '../core/events.js';

export class HeroBase extends Phaser.Physics.Arcade.Sprite 
{
    constructor(scene, x, y, texture) 
    {
        super(scene, x, y, texture);
        
        this.scene.add.existing(this);
        this.scene.physics.world.enable(this);

        this.setCollideWorldBounds(true);
        this.setOrigin(0.5, 1);
        
        // Propiedades comunes
        this.health = HERO.MAX_LIVES;
        this.isDead = false;
        this.isShooting = false; // Flag para animaciones

        // Input
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        
        // Teclas WASD alternativas
        this.keyA = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyW = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W); // Para subir escaleras si las hubiera

        // Emitimos evento de creación
        this.scene.game.events.emit(EVENTS.hero.READY, this);
    }

    preUpdate(time, delta) 
    {
        super.preUpdate(time, delta);
        if (this.isDead) return;

        this.handleMovement();
        this.handleShootingInput(); // Implementado por los hijos
    }

    handleMovement() 
    {
        if (this.isShooting && this.body.onFloor()) {
            this.body.setVelocityX(0);
            return; 
        }

        const left = this.cursors.left.isDown || this.keyA.isDown;
        const right = this.cursors.right.isDown || this.keyD.isDown;

        if (left) {
            this.body.setVelocityX(-HERO.SPEED);
            this.setFlipX(true); // O false dependiendo del sprite
            if(this.body.onFloor()) this.play('run', true);
        } 
        else if (right) {
            this.body.setVelocityX(HERO.SPEED);
            this.setFlipX(false);
            if(this.body.onFloor()) this.play('run', true);
        } 
        else {
            this.body.setVelocityX(0);
            if(this.body.onFloor() && !this.isShooting) this.play('idle', true);
        }
    }

    // Método abstracto (a sobrescribir)
    handleShootingInput() {}

    hit(_damage = 1) 
    {
        if (this.isDead) return;

        this.health -= _damage;
        this.scene.game.events.emit(EVENTS.hero.DAMAGED, this.health);

        if (this.health <= 0) {
            this.die();
        } else {
            // Feedback de daño (parpadeo)
            this.scene.tweens.add({
                targets: this,
                alpha: 0,
                duration: 100,
                repeat: 3,
                yoyo: true
            });
        }
    }

    die() {
        this.isDead = true;
        this.setTint(0xff0000);
        this.setVelocity(0, 0);
        this.scene.game.events.emit(EVENTS.hero.DIED);
        // Lógica de Game Over o Reinicio
        this.scene.time.delayedCall(1000, () => {
             this.scene.scene.restart();
        });
    }
}