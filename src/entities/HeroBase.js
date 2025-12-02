/**
 * Clase Padre para los héroes.
 * Maneja:
 *  - Movimiento horizontal
 *  - Entrada de teclado básica
 *  - Vida / daño / muerte
 * 
 * El hijo (Hero, Hero2...) se encarga de:
 *  - Animación de disparo
 *  - Crear el arma/bala
 */
import { HERO } from '../core/constants.js';
import { EVENTS } from '../core/events.js';

export class HeroBase extends Phaser.Physics.Arcade.Sprite 
{
    constructor(scene, x, y, texture) 
    {
        super(scene, x, y, texture);
        
        this.scene.add.existing(this);
        this.scene.physics.world.enable(this);

        // Origen en los pies del personaje
        this.setOrigin(0.5, 1);

        // Que no salga de los límites del mundo
        this.setCollideWorldBounds(true);

        // Ajuste aproximado del hitbox (un poco más estrecho que el sprite)
        if (this.body && this.body.setSize) {
            const width  = this.width  * 0.7;
            const height = this.height * 0.9;
            this.body.setSize(width, height);
            this.body.setOffset((this.width - width) / 2, this.height - height);
        }

        // Propiedades de juego
        this.speed  = HERO?.SPEED      ?? 250;
        this.lives  = HERO?.MAX_LIVES  ?? 3;
        this.isDead = false;

        // Importante: el hijo usará esto para bloquear movimiento al disparar
        this.isShooting = false;

        // Input
        this.cursors  = scene.input.keyboard.createCursorKeys();
        this.shootKey = scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );

        // Avisamos que el héroe está listo
        this.scene.game.events.emit(EVENTS.hero.READY, this);
    }

    /**
     * Este método se llama automáticamente cada frame por Phaser.
     * Los hijos deben llamar a super.preUpdate(time, delta) si lo sobreescriben.
     */
    preUpdate(time, delta)
    {
        super.preUpdate(time, delta);

        if (this.isDead || !this.body) return;

        const body = /** @type {Phaser.Physics.Arcade.Body} */ (this.body);

        // --- SI ESTÁ DISPARANDO, NO SE MUEVE NI DISPARA ---
        if (this.isShooting) {
            body.setVelocityX(0);
            // No tocamos animación aquí: el hijo está reproduciendo 'shoot'
            return;
        }

        // --- MOVIMIENTO HORIZONTAL ---
        body.setVelocityX(0);
        let isMoving = false;

        if (this.cursors.left.isDown) {
            body.setVelocityX(-this.speed);
            isMoving = true;
            // Flip INVERTIDO como pediste:
            // izquierda -> sin flip
            this.setFlipX(false);
        } 
        else if (this.cursors.right.isDown) {
            body.setVelocityX(this.speed);
            isMoving = true;
            // derecha -> flip
            this.setFlipX(true);
        }

        // Animaciones básicas (idle / run)
        this.updateAnimation(isMoving);

        // --- DISPARO ---
        // IMPORTANTE: solo se ejecuta cuando se PULSA la tecla, no al mantenerla
        if (Phaser.Input.Keyboard.JustDown(this.shootKey)) {
            if (this.handleShootingInput) {
                this.handleShootingInput();
            }
        }
    }

    /**
     * Actualiza animaciones según el movimiento.
     * Si está disparando, no tocamos la animación (la maneja el hijo).
     * @param {boolean} isMoving
     */
    updateAnimation(isMoving) {
        if (!this.anims) return;
        if (this.isShooting) return; // NO pisar la anim de 'shoot'

        const current = this.anims.currentAnim?.key;

        if (isMoving) {
            if (current !== 'run') {
                this.play('run', true);
            }
        } else {
            if (current !== 'idle') {
                this.play('idle', true);
            }
        }
    }

    /**
     * Lógica de disparo. Los hijos la sobreescriben.
     */
    handleShootingInput() {
        // Implementado en Hero, Hero2, etc.
    }

    /**
     * Recibe daño y emite evento.
     * @param {number} amount
     */
    takeDamage(amount = 1) {
        if (this.isDead) return;

        this.lives -= amount;
        this.scene.game.events.emit(EVENTS.hero.DAMAGED, this.lives);

        this.setTint(0xffaaaa);
        this.scene.time.delayedCall(150, () => this.clearTint());

        if (this.lives <= 0) {
            this.die();
        }
    }

    /**
     * Muerte del héroe.
     */
    die() {
        this.isDead = true;
        this.setTint(0xff0000);
        this.setVelocity(0, 0);
        this.scene.game.events.emit(EVENTS.hero.DIED);

        // Reinicia la escena tras un pequeño delay
        this.scene.time.delayedCall(1000, () => {
            this.scene.scene.restart();
        });
    }
}
