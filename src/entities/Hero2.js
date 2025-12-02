/**
 * Hero moderno. Dispara balas (metralleta).
 */
import { HeroBase } from './HeroBase.js';
import { Bullet } from './Bullet.js';
import { EVENTS } from '../core/events.js';

export class Hero2 extends HeroBase 
{
    constructor(scene, x, y, texture = 'player_walk') 
    {
        super(scene, x, y, texture);
        this.nextFireTime = 0;
        this.fireRate = 150; // ms entre balas
    }

    handleShootingInput() 
    {
        if (this.cursors.space.isDown) {
            if (this.scene.time.now > this.nextFireTime) {
                this.shoot();
                this.nextFireTime = this.scene.time.now + this.fireRate;
            }
        }
    }

    shoot() 
    {
        // this.play('shoot', true); // Opcional
        
        // Crear bala hacia arriba (-90 grados)
        new Bullet(this.scene, this.x, this.y - 40, 'bullet').fire(-90);

        this.scene.game.events.emit(EVENTS.hero.SHOOT);
    }
}