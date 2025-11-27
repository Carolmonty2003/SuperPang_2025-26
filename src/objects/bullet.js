// src/objects/bullet.js

export class Bullet extends Phaser.Physics.Arcade.Sprite {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {string} texture
     */
    constructor(scene, x, y, texture = "bullet") {
        super(scene, x, y, texture);

        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.world.enable(this);
        this.setScale(0.05); // prueba 0.2, 0.15, etc.

        // Config básica
        this.speed = 600;          // velocidad del disparo
        this.lifespan = 1000;      // ms que vive la bala
        this.birthTime = scene.time.now;

        this.body.setAllowGravity(false);
    }

    /**
     * Lanza la bala en una dirección (en grados)
     *  -90 = recto hacia arriba
     *  0   = hacia la derecha
     *  180 = hacia la izquierda
     */
    fire(angleDeg) {
        const rad = Phaser.Math.DegToRad(angleDeg);
        const vx = Math.cos(rad) * this.speed;
        const vy = Math.sin(rad) * this.speed;

        this.body.setVelocity(vx, vy);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // Destruir por tiempo
        if (time - this.birthTime > this.lifespan) {
            this.destroy();
            return;
        }

        // Destruir si sale de los límites del mundo
        const bounds = this.scene.physics.world.bounds;
        if (
            this.x < bounds.x - 50 ||
            this.x > bounds.width + 50 ||
            this.y < bounds.y - 50 ||
            this.y > bounds.height + 50
        ) {
            this.destroy();
        }
    }
}
