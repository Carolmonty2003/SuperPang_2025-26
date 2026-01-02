// Enum de colores para las pelotas
export const BALL_COLORS = {
  RED: 0xff0000,
  GREEN: 0x00ff00,
  BLUE: 0x0080ff,
  YELLOW: 0xffff00,
  PURPLE: 0xff00ff,
  ORANGE: 0xff8800,
  CYAN: 0x00ffff,
  WHITE: 0xffffff
};

export class BaseBall extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, speedX, nextBallType = null, color = BALL_COLORS.WHITE) {
    super(scene, x, y, texture);
    
    scene.add.existing(this);
    scene.physics.world.enable(this);

    this.nextBallType = nextBallType;
    this.speedX = speedX;
    this.ballColor = color; // Guardar el color para heredarlo

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
    
    // Guardar velocidad EXACTA antes de colisiones
    // Esto preserva la magnitud para rebote perfecto
    if (this.body && this.body.velocity) {
      this._prevVelocity = {
        x: this.body.velocity.x,
        y: this.body.velocity.y
      };
    }
  }

  takeDamage() {
    // Si tiene un tipo de bola siguiente, crear 2 bolas más pequeñas ANTES de destruir
    if (this.nextBallType) {
      this.split();
    }
    
    // Destruir la bola actual DESPUÉS de crear las nuevas
    this.destroy();
  }

  split() {
    const scene = this.scene;
    const x = this.x;
    const y = this.y;
    const color = this.ballColor; // Heredar el color a las bolas hijas

    // Crear 2 bolas más pequeñas
    let ball1, ball2;

    switch (this.nextBallType) {
      case "big":
        ball1 = new BigBall(scene, x, y, -1, color); // izquierda
        ball2 = new BigBall(scene, x, y, 1, color);  // derecha
        break;
      case "mid":
        ball1 = new MidBall(scene, x, y, -1, color);
        ball2 = new MidBall(scene, x, y, 1, color);
        break;
      case "small":
        ball1 = new SmallBall(scene, x, y, -1, color);
        ball2 = new SmallBall(scene, x, y, 1, color);
        break;
      case "tiny":
        ball1 = new TinyBall(scene, x, y, -1, color);
        ball2 = new TinyBall(scene, x, y, 1, color);
        break;
      default:
        return; // No hay más divisiones
    }

    // Añadir las bolas al grupo de la escena
    if (scene.ballsGroup) {
      scene.ballsGroup.add(ball1);
      scene.ballsGroup.add(ball2);
    }

    // Darles un impulso inicial: una a la izquierda, otra a la derecha
    // Y un pequeño impulso hacia arriba (suave)
    const horizontalSpeed = Math.abs(ball1.speedX); // Velocidad horizontal de la bola
    const upwardImpulse = -200; // Impulso suave hacia arriba

    ball1.body.setVelocity(-horizontalSpeed, upwardImpulse); // Izquierda + arriba
    ball2.body.setVelocity(horizontalSpeed, upwardImpulse);  // Derecha + arriba
  }
}

export class HugeBall extends BaseBall {
  constructor(scene, x, y, direction = 1, color = BALL_COLORS.RED) {
    super(scene, x, y, "n_huge", 150 * direction, "big", color);
  }
}

export class BigBall extends BaseBall {
  constructor(scene, x, y, direction = 1, color = BALL_COLORS.RED) {
    super(scene, x, y, "n_big", 180 * direction, "mid", color);
  }
}

export class MidBall extends BaseBall {
  constructor(scene, x, y, direction = 1, color = BALL_COLORS.RED) {
    super(scene, x, y, "n_mid", 210 * direction, "small", color);
  }
}

export class SmallBall extends BaseBall {
  constructor(scene, x, y, direction = 1, color = BALL_COLORS.RED) {
    super(scene, x, y, "n_small", 240 * direction, "tiny", color);
  }
}

export class TinyBall extends BaseBall {
  constructor(scene, x, y, direction = 1, color = BALL_COLORS.RED) {
    super(scene, x, y, "n_tiny1", 270 * direction, null, color); // null = no más divisiones
  }
}
