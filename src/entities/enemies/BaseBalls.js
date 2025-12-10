import { BaseEnemy } from "./BaseEnemy.js";
import { BALLS } from "../../core/constants.js";
import { EVENTS } from "../../core/events.js";

/**
 * CLASE BASE para todas las pelotas
 * Gestiona física, rebotes y comportamiento común
 */
export class BaseBall extends BaseEnemy {
  constructor(scene, x, y, texture, speedX, nextBallType = null) {
    super(scene, x, y, texture);

    this.nextBallType = nextBallType; // String del tipo de bola siguiente
    this.speedX = speedX;

    // Escalar con menos ancho (X) para que no esté estirado
    this.setScale(1.7, 2);

    // Collider circular - usar displayHeight como base (es el eje más grande)
    // 0.7 = 70% del tamaño para mejor detección de colisiones
    const radius = (this.displayHeight / 2) * 0.7;
    this.body.setCircle(radius);
    // Centrar el círculo en ambos ejes
    const offsetX = (this.width - radius * 2) / 2;
    const offsetY = (this.height - radius * 2) / 2;
    this.body.setOffset(offsetX, offsetY);

    // FÍSICA
    this.body.setGravityY(BALLS.BALL_GRAVITY);
    this.body.setVelocityX(this.speedX);
    this.body.setBounce(1); // Rebote perfecto
    this.body.setCollideWorldBounds(true);
  }

  preUpdate(time, delta) {
    // Llamar al preUpdate del sprite base (evitar lógica de patrulla de BaseEnemy)
    Phaser.Physics.Arcade.Sprite.prototype.preUpdate.call(this, time, delta);
  }

  takeDamage() {
    // Emitir eventos
    if (this.scene.game && this.scene.game.events) {
      this.scene.game.events.emit(EVENTS.enemy.BALL_DESTROYED, {
        x: this.x,
        y: this.y
      });
      this.scene.game.events.emit(EVENTS.game.SCORE_CHANGE, 100);
    }

    // Si tiene siguiente tipo (no es Tiny), splitear
    if (this.nextBallType) {
      this.split();
    }
    // Si no tiene nextBallType (es Tiny), simplemente se destruye
    
    this.destroy();
  }

  split() {
    if (!this.nextBallType) return;
    
    // Resolver la clase desde el string
    const BallClass = BALL_CLASSES[this.nextBallType];
    if (!BallClass) return;
    
    // Crear dos bolas más pequeñas (izquierda y derecha)
    const ball1 = new BallClass(this.scene, this.x, this.y, -1);
    const ball2 = new BallClass(this.scene, this.x, this.y, 1);
    
    // Impulso hacia arriba al splitear
    ball1.body.setVelocityY(-250);
    ball2.body.setVelocityY(-250);
    
    // Añadir al grupo
    if (this.scene.ballsGroup) {
      this.scene.ballsGroup.add(ball1);
      this.scene.ballsGroup.add(ball2);
    }
  }
}

// ===== CLASES ESPECÍFICAS DE PELOTAS =====

export class HugeBall extends BaseBall {
  constructor(scene, x, y, direction = 1) {
    super(
      scene, 
      x, 
      y, 
      'n_huge',     // sprite específico
      150 * direction,  // speedX
      'big'         // tipo siguiente
    );
  }
}

export class BigBall extends BaseBall {
  constructor(scene, x, y, direction = 1) {
    super(
      scene, 
      x, 
      y, 
      'n_big',      // sprite específico
      170 * direction,  // speedX
      'mid'         // tipo siguiente
    );
  }
}

export class MidBall extends BaseBall {
  constructor(scene, x, y, direction = 1) {
    super(
      scene, 
      x, 
      y, 
      'n_mid',      // sprite específico
      190 * direction,  // speedX
      'small'       // tipo siguiente
    );
  }
}

export class SmallBall extends BaseBall {
  constructor(scene, x, y, direction = 1) {
    super(
      scene, 
      x, 
      y, 
      'n_small',    // sprite específico
      210 * direction,  // speedX
      'tiny'        // tipo siguiente
    );
  }
}

export class TinyBall extends BaseBall {
  constructor(scene, x, y, direction = 1) {
    super(
      scene, 
      x, 
      y, 
      'n_tiny1',    // sprite inicial (tiny1)
      230 * direction,  // speedX
      null          // NO splitea, se destruye completamente
    );
    
    // Hacer tiny un poco más grande, menos ancho para no estar estirado
    this.setScale(2.1, 2.5);
    
    // Reajustar collider con el nuevo scale
    const radius = (this.displayHeight / 2) * 0.7;
    this.body.setCircle(radius);
    const offsetX = (this.width - radius * 2) / 2;
    const offsetY = (this.height - radius * 2) / 2;
    this.body.setOffset(offsetX, offsetY);
    
    // Crear animación de parpadeo si no existe
    if (!this.scene.anims.exists('tiny_blink')) {
      this.scene.anims.create({
        key: 'tiny_blink',
        frames: [
          { key: 'n_tiny1' },
          { key: 'n_tiny2' }
        ],
        frameRate: 8,
        repeat: -1
      });
    }
    
    // Reproducir animación de parpadeo
    this.play('tiny_blink');
  }
}

// Mapa para resolver clases por string
const BALL_CLASSES = {
  'huge': HugeBall,
  'big': BigBall,
  'mid': MidBall,
  'small': SmallBall,
  'tiny': TinyBall
};
