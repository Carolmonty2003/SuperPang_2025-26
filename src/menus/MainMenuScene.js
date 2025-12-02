// src/scenes/MainMenuScene.js

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  preload() {
    // Puedes precargar imágenes aquí si tienes un fondo o logo
    // this.load.image('title', 'assets/sprites/ui/title.png');
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Fondo (si quieres usar un color sólido o imagen de fondo)
    this.cameras.main.setBackgroundColor('#1d1d1d');

    // Título del juego
    this.add.text(centerX, centerY - 100, 'SUPER PANG', {
      fontSize: '64px',
      fill: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Botón de "Jugar"
    const playText = this.add.text(centerX, centerY + 50, 'JUGAR', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5).setInteractive();

    // Efecto al pasar el mouse
    playText.on('pointerover', () => playText.setStyle({ fill: '#f39c12' }));
    playText.on('pointerout', () => playText.setStyle({ fill: '#ffffff' }));

    // Al hacer clic
    playText.on('pointerdown', () => {
      this.scene.start('SelectModeScene');
    });
  }

  update(time, delta) {
    // Animaciones o lógica continua, si se desea
  }
}

export default MainMenuScene;
