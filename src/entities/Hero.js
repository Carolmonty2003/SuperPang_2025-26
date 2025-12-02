/**
 * Hero clásico de Pang. Dispara Arpones.
 */
import { HeroBase } from './HeroBase.js';
import { Harpoon } from './Harpoon.js';
import { EVENTS } from '../core/events.js';

export class Hero extends HeroBase 
{
    constructor(scene, x, y, texture = 'player_walk') 
    {
        super(scene, x, y, texture);
        this.activeHarpoon = null; // Solo un arpón a la vez (clásico)
    }

    handleShootingInput() 
    {
        // Solo disparar si pulsamos espacio Y no hay arpón activo
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
            if (!this.activeHarpoon || !this.activeHarpoon.active) {
                this.shoot();
            }
        }
    }

    shoot() 
    {
        this.isShooting = true;
        this.play('shoot', true); // Asegúrate de tener esta animación
        
        // Crear el arpón
        this.activeHarpoon = new Harpoon(this.scene, this.x, this.y);
        
        // Evento (opcional, para sonido)
        this.scene.game.events.emit(EVENTS.hero.SHOOT);

        // Resetear flag de disparo tras un breve tiempo para permitir moverse
        this.scene.time.delayedCall(300, () => {
            this.isShooting = false;
        });
    }
}