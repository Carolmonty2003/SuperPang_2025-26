import { EVENTS } from '../../../../core/events.js';
import { BALL_COLORS, BALL_SCORES } from '../BallConstants.js';

export class BaseHexBall extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, speedX, speedY, nextBallType = null, scoreValue = 10, color = BALL_COLORS.WHITE) {
    super(scene, x, y, texture);
    
    scene.add.existing(this);
    scene.physics.world.enable(this);

    this.nextBallType = nextBallType;
    this.speedX = speedX;
    this.speedY = speedY;
    this.scoreValue = scoreValue;
    this.ballColor = color; // Guardar el color para heredarlo

    // Crear animación si no existe
    const animKey = `${texture}_anim`;
    if (!scene.anims.exists(animKey)) {
      scene.anims.create({
        key: animKey,
        frames: scene.anims.generateFrameNumbers(texture, { start: 0, end: 2 }),
        frameRate: 10,
        repeat: -1
      });
    }

    // Reproducir animación
    this.play(animKey);

    // Aplicar color
    this.setTint(this.ballColor);

    // Escalar para hacer las bolas más grandes
    this.setScale(3.5, 3.5);

    // Configurar collider circular ANTES que coincida con el sprite
    const radius = this.width * 0.5;
    this.body.setCircle(radius);
    
    // Centrar perfectamente el círculo
    this.body.setOffset(
      (this.width - radius * 2) / 2,
      (this.height - radius * 2) / 2
    );

    // Física - SIN GRAVEDAD (IMPORTANTE: allowGravity PRIMERO)
    this.body.setAllowGravity(false); // Desactivar gravedad completamente
    this.body.setGravity(0, 0); // Asegurar que no hay gravedad
    this.body.setBounce(0, 0); // Desactivar bounce automático, lo haremos manual
    this.body.setCollideWorldBounds(true);
    this.body.onWorldBounds = true; // Activar eventos de colisión con límites
    
    this.body.immovable = false;
    this.body.moves = true;
    this.body.setDrag(0, 0);
    this.body.setMaxVelocity(10000, 10000);
    
    // Calcular y guardar la velocidad constante (magnitud)
    this.constantSpeed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
    
    // Velocidad actual
    this.velocityX = this.speedX;
    this.velocityY = this.speedY;
    
    // Aplicar velocidad inicial
    this.body.setVelocity(this.velocityX, this.velocityY);
  }
  
  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    
    if (!this.body) return;
    
    const worldBounds = this.scene.physics.world.bounds;
    
    // Detectar colisión con límites izquierdo/derecho e invertir velocidad X
    if (this.body.blocked.left || this.body.blocked.right) {
      this.velocityX = -this.velocityX;
    }
    
    // Detectar colisión con límites superior/inferior e invertir velocidad Y
    if (this.body.blocked.up || this.body.blocked.down) {
      this.velocityY = -this.velocityY;
    }
    
    // Mantener velocidad constante (normalizar y multiplicar por velocidad constante)
    const currentSpeed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
    
    if (currentSpeed > 0) {
      // Normalizar y aplicar velocidad constante
      this.velocityX = (this.velocityX / currentSpeed) * this.constantSpeed;
      this.velocityY = (this.velocityY / currentSpeed) * this.constantSpeed;
    }
    
    // Aplicar la velocidad constante al body
    this.body.setVelocity(this.velocityX, this.velocityY);
  }

  takeDamage() {
    // Dar puntos
    if (this.scene && this.scene.game && this.scene.game.events) {
      this.scene.game.events.emit(EVENTS.game.SCORE_CHANGE, this.scoreValue);
    }
    
    // Split si hay siguiente tipo
    if (this.nextBallType) {
      this.split();
    }
    
    // Destruir
    this.destroy();
  }

  split() {
    const scene = this.scene;
    const x = this.x;
    const y = this.y;
    const color = this.ballColor; // Heredar color

    let ball1, ball2;

    // Lazy import para evitar dependencias circulares
    const createBalls = async () => {
      switch (this.nextBallType) {
        case "hex_mid":
          const { HexMidBall } = await import('./HexMidBall.js');
          ball1 = new HexMidBall(scene, x, y, -1, -1, color);
          ball2 = new HexMidBall(scene, x, y, 1, 1, color);
          break;
        case "hex_small":
          const { HexSmallBall } = await import('./HexSmallBall.js');
          ball1 = new HexSmallBall(scene, x, y, -1, -1, color);
          ball2 = new HexSmallBall(scene, x, y, 1, 1, color);
          break;
        default:
          return;
      }

      // Añadir al grupo
      if (scene.ballsGroup) {
        scene.ballsGroup.add(ball1);
        scene.ballsGroup.add(ball2);
      }

      // SIEMPRE separar en direcciones opuestas (izq/der) y hacia ARRIBA
      const horizontalSpeed = 200; // Velocidad horizontal fija
      const upwardSpeed = -300; // Velocidad hacia arriba (negativa en Y)

      ball1.velocityX = -horizontalSpeed; // Izquierda
      ball1.velocityY = upwardSpeed; // Arriba
      ball1.body.setVelocity(ball1.velocityX, ball1.velocityY);
      
      ball2.velocityX = horizontalSpeed; // Derecha
      ball2.velocityY = upwardSpeed; // Arriba
      ball2.body.setVelocity(ball2.velocityX, ball2.velocityY);
    };

    createBalls();
  }
}
