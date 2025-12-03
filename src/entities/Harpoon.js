// src/entities/Harpoon.js

import { WEAPON } from '../core/constants.js';

export class Harpoon extends Phaser.Physics.Arcade.Sprite 
{
    constructor(scene, x, y, texture = 'arponFijo') 
    {
        super(scene, x, y, texture);
        
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.world.enable(this);
        this.setScale(2);
        this.setOrigin(0.5, 1); // El punto de anclaje es abajo
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);

        // 🔹 NUEVO: si la escena tiene un grupo de arpones, añadimos este
        if (scene.harpoonsGroup) {
            scene.harpoonsGroup.add(this);
        }

        // Estado
        this.isExtending = true;
    }

    preUpdate(time, delta) {
        // ... (resto igual que lo tenías)
        if (this.isExtending) {
            this.displayHeight += (WEAPON.HARPOON_SPEED * delta) / 1000;
            this.body.setSize(this.width, this.displayHeight);

            if (this.y - this.displayHeight <= 0) {
                this.destroy();
            }
        }
    }

    // Si ya tienes un destroyHarpoon() más avanzado en tu versión,
    // no borres nada, solo mantén su lógica.
}
