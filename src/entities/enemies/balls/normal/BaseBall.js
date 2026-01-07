import { EVENTS } from '../../../../core/events.js';
import { BALL_COLORS, BALL_SCORES } from '../BallConstants.js';

export class BaseBall extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, speedX, nextBallType = null, color = BALL_COLORS.WHITE, scoreValue = 10, minBounceSpeed = 150) {
    super(scene, x, y, texture);
    
    scene.add.existing(this);
    scene.physics.world.enable(this);

    this.nextBallType = nextBallType;
    this.speedX = speedX;
    this.ballColor = color; // Guardar el color para heredarlo
    this.scoreValue = scoreValue; // Puntos que da esta bola
    this.minBounceSpeed = minBounceSpeed; // Velocidad mínima de rebote

    // Primero configurar el collider antes de escalar
    // Usar el tamaño original del sprite para el radio
    const radius = this.width * 0.5;
    this.body.setCircle(radius);
    
    // Centrar perfectamente el círculo
    this.body.setOffset(
      (this.width - radius * 2) / 2,
      (this.height - radius * 2) / 2
    );

    // Escalar después para que el sprite llene el collider
    this.setScale(2, 2);

    // Aplicar color
    this.setTint(this.ballColor);

    // Física - rebote perfecto
    this.body.setBounce(1, 1); // (bounceX, bounceY) - ambos al 100%
    this.body.setCollideWorldBounds(true);
    this.body.setGravityY(300);
    
    // Asegurar que la bola pueda moverse
    this.body.immovable = false;
    this.body.moves = true;
    
    // Eliminar drag y fricción para que no pierda energía
    this.body.setDrag(0, 0);
    this.body.setMaxVelocity(10000, 10000); // Limitar para evitar atravesar tiles
    this.body.allowGravity = true;
    
    // Habilitar collision faces en todos los lados
    this.body.checkCollision.up = true;
    this.body.checkCollision.down = true;
    this.body.checkCollision.left = true;
    this.body.checkCollision.right = true;
    
    // Velocidad inicial
    this.body.setVelocityX(this.speedX);
    
    // Guardar velocidad previa para el rebote
    this._prevVelocity = { x: this.speedX, y: 0 };
  }
  
  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    
    if (!this.body) return;
    
    // Guardar velocidad EXACTA antes de colisiones
    // Esto preserva la magnitud para rebote perfecto
    this._prevVelocity = {
      x: this.body.velocity.x,
      y: this.body.velocity.y
    };
    
    // Aplicar velocidad mínima de rebote si es necesario
    // Solo aplica en dirección vertical (Y) cuando rebota contra suelo/techo
    if (this.body.blocked.down || this.body.blocked.up) {
      const absVelY = Math.abs(this.body.velocity.y);
      // Solo aplicar si la velocidad es menor que el mínimo
      if (absVelY < this.minBounceSpeed) {
        // Mantener la dirección pero aplicar velocidad mínima
        const direction = this.body.velocity.y > 0 ? 1 : -1;
        this.body.setVelocityY(this.minBounceSpeed * direction);
      }
    }
  }

  takeDamage() {
    // Mostrar puntaje flotante en azul
    this.showFloatingScore();
    
    // Dar puntos por destruir esta bola
    if (this.scene && this.scene.game && this.scene.game.events) {
      this.scene.game.events.emit(EVENTS.game.SCORE_CHANGE, this.scoreValue);
    }
    
    // Si tiene un tipo de bola siguiente, crear 2 bolas más pequeñas ANTES de destruir
    if (this.nextBallType) {
      this.split();
    }
    
    // Destruir la bola actual DESPUÉS de crear las nuevas
    this.destroy();
  }

  showFloatingScore() {
    // Crear texto flotante con el puntaje
    const scoreText = this.scene.add.text(this.x, this.y, `+${this.scoreValue}`, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#0066FF', // Azul
      fontStyle: 'bold',
      stroke: '#FFFFFF',
      strokeThickness: 3
    });
    
    scoreText.setOrigin(0.5, 0.5);
    scoreText.setDepth(100); // Por encima de todo
    
    // Animación: flota hacia arriba y desaparece
    this.scene.tweens.add({
      targets: scoreText,
      y: scoreText.y - 50,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        scoreText.destroy();
      }
    });
  }

  split() {
    // Import dinámico de las clases de bolas
    // Esto evita dependencias circulares
    const scene = this.scene;
    const x = this.x;
    const y = this.y;
    const color = this.ballColor; // Heredar el color a las bolas hijas

    // Crear 2 bolas más pequeñas
    let ball1, ball2;

    // Lazy import para evitar dependencias circulares
    const createBalls = async () => {
      switch (this.nextBallType) {
        case "big":
          const { BigBall } = await import('./BigBall.js');
          ball1 = new BigBall(scene, x, y, -1, color);
          ball2 = new BigBall(scene, x, y, 1, color);
          break;
        case "mid":
          const { MidBall } = await import('./MidBall.js');
          ball1 = new MidBall(scene, x, y, -1, color);
          ball2 = new MidBall(scene, x, y, 1, color);
          break;
        case "small":
          const { SmallBall } = await import('./SmallBall.js');
          ball1 = new SmallBall(scene, x, y, -1, color);
          ball2 = new SmallBall(scene, x, y, 1, color);
          break;
        case "tiny":
          const { TinyBall } = await import('./TinyBall.js');
          ball1 = new TinyBall(scene, x, y, -1, color);
          ball2 = new TinyBall(scene, x, y, 1, color);
          break;
        default:
          return;
      }

      // Añadir las bolas al grupo de la escena
      if (scene.ballsGroup) {
        scene.ballsGroup.add(ball1);
        scene.ballsGroup.add(ball2);
        
        // Mark split balls if parent was marked for burst
        if (this._markedForBurst && scene.burstClearActive) {
          ball1._spawnedFromMarkedBall = true;
          ball2._spawnedFromMarkedBall = true;
          ball1._markedForBurst = true;
          ball2._markedForBurst = true;
          scene.markedForBurst.add(ball1);
          scene.markedForBurst.add(ball2);
        }
      }

      // Darles un impulso inicial: una a la izquierda, otra a la derecha
      // Y un pequeño impulso hacia arriba (suave)
      const horizontalSpeed = Math.abs(ball1.speedX);
      const upwardImpulse = -200;

      ball1.body.setVelocity(-horizontalSpeed, upwardImpulse);
      ball2.body.setVelocity(horizontalSpeed, upwardImpulse);
    };

    createBalls();
  }
}
