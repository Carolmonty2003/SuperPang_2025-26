// src/entities/bullet.js (ajusta la ruta al tuyo)

export class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture = 'bullet') {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setOrigin(0.5, 0.5);

        // ===== TAMAÑO =====
        
        this.setScale(0.05);               // tamaño visual

        // collider del MISMO tamaño que el sprite escalado
        if (this.body && this.body.setSize) {
            this.body.setAllowGravity(false);
            this.body.setSize(
                this.width,       
                this.height,      
                true                       
            );
        }

        // vida muy simple
        this.lifespan = 10000;               // ms
        this.birthTime = scene.time.now;

        // siempre mirando hacia arriba
        this.setRotation(0);
    }

    // dispara en ángulo, pero el sprite no se rota
    fire(angleDeg) {
        const speed = 600;
        const rad = Phaser.Math.DegToRad(angleDeg);

        const vx = Math.cos(rad) * speed;
        const vy = Math.sin(rad) * speed;

        this.body.setVelocity(vx, vy);

        // sprite estático arriba
        this.setRotation(0);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // destruir por tiempo
        if (time > this.birthTime + this.lifespan) {
            this.destroy();
        }
    }
}
