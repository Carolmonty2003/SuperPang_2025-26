// src/entities/Harpoon.js

import { WEAPON } from '../core/constants.js';

export class Harpoon extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture = 'arponFijo') {
    // Lo spawneamos DEBAJO de la pantalla
    const spawnY = scene.cameras.main.height + 800; // un poco más abajo del borde
    super(scene, x, spawnY, texture);

    this.scene = scene;

    // Añadir a la escena + física
    scene.add.existing(this);
    this.scene.physics.world.enable(this);

    // Anclado abajo (como una lanza que viene desde abajo)
    // PROFUNDIDAD: por encima del fondo (-2) y por debajo de todo lo demás (0)
    this.setDepth(-1);
    this.setOrigin(0.5, 1);
    this.setScale(4, 5);

    // Sin gravedad, no lo mueve nada salvo nuestra velocidad
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);

    // Collider fijo que coincide con el sprite
    const bodyWidth  = this.displayWidth * 0.4; // un pelín más estrecho
    const bodyHeight = this.displayHeight - 740;
    this.body.setSize(bodyWidth, bodyHeight, true); // true = centrar en el sprite

    // Velocidad constante hacia arriba (recto, sin parábola)
    this.body.setVelocityY(-WEAPON.HARPOON_SPEED);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    // Cuando la punta llega al techo (y <= 0), lo destruimos
    if (this.getTopCenter().y <= 0) {
      this.destroy();
    }
  }
}

export default Harpoon;
