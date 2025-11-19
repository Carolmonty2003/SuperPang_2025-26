// src/entities/Hero.js
import { HERO } from '../core/constants.js';

export class Hero extends Phaser.Physics.Arcade.Sprite {
    /**
    * @param {Phaser.Scene} _scene   - escena en la que se instanciará
    * @param {number} _posX          - posición X del sprite
    * @param {number} _posY          - posición Y del sprite
    * @param {string} _texture       - key/spriteTag del spritesheet/atlas
    */
    constructor(_scene, _posX, _posY, _texture = 'player_walk') {
        super(_scene, _posX, _posY, _texture);

        // Añadir a la escena y habilitar físicas
        this.scene = _scene;
        this.scene.add.existing(this);
        this.scene.physics.world.enable(this);

        this.body.setCollideWorldBounds(true);

        // Flags de disparo
        this.isShooting   = false; // mientras dura la animación
        this.shootPressed = false; // para que solo dispare una vez por pulsación

        // Colisiones
        this.setColliders();

        // Control de Input al estilo de tu ejemplo
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.keyA    = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD    = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        // Crear animaciones solo una vez
        Hero.createAnimations(this.scene);
    }

    setColliders() {
        if (this.scene.walls) {
            this.scene.physics.add.collider(this, this.scene.walls);
        }
    }

    static createAnimations(scene) {
        if (scene.anims.exists('run')) return;

        // RUN (caminar) -> player_walk.png
        scene.anims.create({
            key: 'run',
            frames: scene.anims.generateFrameNumbers('player_walk', {
                start: 0,
                end: 3
            }),
            frameRate: 8,
            repeat: -1
        });

        // IDLE
        scene.anims.create({
            key: 'idle',
            frames: [{ key: 'player_walk', frame: 0 }],
            frameRate: 1,
            repeat: -1
        });

        // SHOOT
        scene.anims.create({
            key: 'shoot',
            frames: scene.anims.generateFrameNumbers('player_shoot', {
                start: 0,
                end: 1
            }),
            frameRate: 10,
            repeat: 0 // solo una vez
        });
    }

    shoot() {
        if (this.isShooting) return; // seguridad extra

        this.isShooting = true;
        console.log('DISPARO SUPER PANG!');

        // Parar movimiento mientras dispara
        this.body.setVelocityX(0);

        // Animación de disparo
        this.anims.play('shoot', true);

        // Cuando termine la animación, desbloquear el movimiento
        this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim) => {
            if (anim.key === 'shoot') {
                this.isShooting = false;
                // El siguiente preUpdate ya pondrá idle/run según input
            }
        });
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // ---- LÓGICA DE DISPARO (misma filosofía que tu salto) ----
        // space down + ventana de tiempo (DownDuration) + que no esté disparando
        const spacePressedWindow =
            this.cursors.space.isDown &&
            Phaser.Input.Keyboard.DownDuration(this.cursors.space, 250);

        // Si estamos dentro de la ventana, no se había registrado aún la pulsación
        // y no está disparando -> dispara UNA vez
        if (spacePressedWindow && !this.shootPressed && !this.isShooting) {
            this.shoot();
            this.shootPressed = true;  // a partir de aquí, hasta que no suelte, no vuelve a disparar
        }

        // Cuando suelta space, reseteamos el flag de pulsación
        if (Phaser.Input.Keyboard.JustUp(this.cursors.space)) {
            this.shootPressed = false;
        }

        // Si está disparando: no se mueve ni cambia animación
        if (this.isShooting) {
            this.body.setVelocityX(0);
            return;
        }

        let moving = false;

        // ---- MOVIMIENTO HORIZONTAL (como lo tenías antes) ----
        const leftPressed  = this.cursors.left.isDown  || this.keyA.isDown;
        const rightPressed = this.cursors.right.isDown || this.keyD.isDown;

        if (leftPressed) {
            this.body.setVelocityX(-HERO.SPEED); // ← negativo a la izquierda
            this.setFlipX(false);                // o true, según cómo tengas el sprite
            moving = true;
        } else if (rightPressed) {
            this.body.setVelocityX(HERO.SPEED);
            this.setFlipX(true);
            moving = true;
        } else {
            this.body.setVelocityX(0);
        }

        // ---- ANIMACIONES (solo si NO está disparando) ----
        if (moving) {
            this.anims.play('run', true);
        } else {
            this.anims.play('idle', true);
            // si prefieres EXACTAMENTE como tu ejemplo:
            // this.anims.stop().setFrame(0);
        }
    }
}
