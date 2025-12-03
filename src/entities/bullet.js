// src/entities/bullet.js

export class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture = 'bullet') {
        super(scene, x, y, texture);

        this.scene = scene;
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setOrigin(0.5, 0.5);
        this.setScale(0.05);

        if (this.body && this.body.setSize) {
            this.body.setAllowGravity(false);
            this.body.setSize(this.width, this.height, true);
        }

        // 🔹 NUEVO: registrar la bala en el grupo de la escena, si existe
        if (scene.bulletsGroup) {
            scene.bulletsGroup.add(this);
        }

        this.lifespan = 1000;
        this.birthTime = scene.time.now;

        this.setRotation(0);
    }

    fire(angleDeg) {
        const speed = 600;
        const rad = Phaser.Math.DegToRad(angleDeg);

        const vx = Math.cos(rad) * speed;
        const vy = Math.sin(rad) * speed;

        this.body.setVelocity(vx, vy);
        this.setRotation(0);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (time > this.birthTime + this.lifespan) {
            this.destroy();
        }
    }
}
