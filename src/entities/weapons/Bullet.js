// src/entities/weapons/Bullet.js

export class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture = 'bullet') {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setOrigin(0.5, 0.5);

        // ===== TAMAÑO =====
        
        this.setScale(0.05);               // tamaño visual

      
        if (this.body && this.body.setSize) {
            this.body.setAllowGravity(false);
            this.body.setSize(
                this.width,       
                this.height,      
                true                       
            );
        }

      
        this.lifespan = 10000;               
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
