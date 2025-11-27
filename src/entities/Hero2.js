// src/entities/Hero2.js
import { HERO } from "../core/constants.js";
import { Bullet } from "../objects/bullet.js";

export class Hero2 extends Phaser.Physics.Arcade.Sprite {
    /**
    * @param {Phaser.Scene} _scene   - escena en la que se instanciará
    * @param {number} _posX          - posición X del sprite
    * @param {number} _posY          - posición Y del sprite
    * @param {string} _texture       - key/spriteTag del spritesheet/atlas
    */
    constructor(_scene, _posX, _posY, _texture = "player_walk") {
        super(_scene, _posX, _posY, _texture);

        this.scene = _scene;
        this.scene.add.existing(this);
        this.scene.physics.world.enable(this);

        this.setDepth(10);
        this.body.setCollideWorldBounds(true);

        // Flags de disparo (misma filosofía que el Hero normal)
        this.shootPressed = false;

        this.setColliders();

        // Input
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.keyA = this.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.A
        );
        this.keyD = this.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.D
        );

        // Crear animaciones solo una vez
        Hero2.createAnimations(this.scene);
    }

    setColliders() {
        if (this.scene.walls) {
            this.scene.physics.add.collider(this, this.scene.walls);
        }
    }

    static createAnimations(scene) {
        if (scene.anims.exists("run")) return;

        // RUN (caminar)
        scene.anims.create({
            key: "run",
            frames: scene.anims.generateFrameNumbers("player_walk", {
                start: 0,
                end: 3,
            }),
            frameRate: 8,
            repeat: -1,
        });

        // IDLE
        scene.anims.create({
            key: "idle",
            frames: [{ key: "player_walk", frame: 0 }],
            frameRate: 1,
            repeat: -1,
        });

        // SHOOT
        scene.anims.create({
            key: "shoot",
            frames: scene.anims.generateFrameNumbers("player_shoot", {
                start: 0,
                end: 1,
            }),
            frameRate: 10,
            repeat: 0,
        });
    }

    /**
     * Disparo tipo metralleta: 3 balas en abanico
     */
    shoot() {
        console.log("DISPARO MACHINE GUN!");

        // Punto de origen de las balas (más o menos a la altura del pecho)
        const originX = this.x;
        const originY = this.y - this.height * 0.2;

        // Aseguramos que exista el grupo de balas en la escena
        if (!this.scene.bullets) {
            this.scene.bullets = this.scene.add.group();
        }

        // Ángulos del abanico (en grados)
        const angles = [-100, -95, -90,-85, -80]; // un poco izq, recto, un poco dcha

        angles.forEach((angle) => {
            const bullet = new Bullet(this.scene, originX, originY, "bullet");
            bullet.fire(angle);
            this.scene.bullets.add(bullet);
        });

        // Animación de disparo (no bloquea el movimiento)
        this.anims.play("shoot", true);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // ---- LÓGICA DE DISPARO (una bala por pulsación de space) ----
        const spacePressedWindow =
            this.cursors.space.isDown &&
            Phaser.Input.Keyboard.DownDuration(this.cursors.space, 250);

        if (spacePressedWindow && !this.shootPressed) {
            this.shoot();
            this.shootPressed = true;
        }

        if (Phaser.Input.Keyboard.JustUp(this.cursors.space)) {
            this.shootPressed = false;
        }

        // ---- MOVIMIENTO HORIZONTAL ----
        let moving = false;

        const leftPressed = this.cursors.left.isDown || this.keyA.isDown;
        const rightPressed = this.cursors.right.isDown || this.keyD.isDown;

        if (leftPressed) {
            this.body.setVelocityX(-HERO.SPEED);
            this.setFlipX(false);
            moving = true;
        } else if (rightPressed) {
            this.body.setVelocityX(HERO.SPEED);
            this.setFlipX(true);
            moving = true;
        } else {
            this.body.setVelocityX(0);
        }

        // ---- ANIMACIONES ----
        if (moving) {
            this.anims.play("run", true);
        } else {
            this.anims.play("idle", true);
        }
    }
}
