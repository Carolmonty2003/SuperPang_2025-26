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

  // Fondo
  this.cameras.main.setBackgroundColor("#1d1d1d");

  // Título del juego
  this.add.text(centerX, centerY - 100, "SUPER PANG", {
    fontSize: "64px",
    fill: "#ffffff",
    fontFamily: "Arial",
  }).setOrigin(0.5);

  // ---------- BOTÓN JUGAR ----------
  const playText = this.add.text(centerX, centerY + 20, "JUGAR", {
    fontSize: "32px",
    fill: "#ffffff",
    fontFamily: "Arial",
  }).setOrigin(0.5).setInteractive({ useHandCursor: true });

  playText.on("pointerover", () => playText.setStyle({ fill: "#f39c12" }));
  playText.on("pointerout",  () => playText.setStyle({ fill: "#ffffff" }));
  playText.on("pointerdown", () => {
    this.scene.start("SelectModeScene");
  });

  // ---------- BOTÓN OPCIONES ----------
const optionsText = this.add.text(centerX, centerY + 80, "OPTIONS", {
  fontSize: "32px",
  fill: "#ffffff",
  fontFamily: "Arial",
}).setOrigin(0.5).setInteractive({ useHandCursor: true });

optionsText.on("pointerover", () =>
  optionsText.setStyle({ fill: "#f39c12" })
);
optionsText.on("pointerout", () =>
  optionsText.setStyle({ fill: "#ffffff" })
);

optionsText.on("pointerdown", () => {
  this.scene.start("OptionsMenu", { from: "main" });
});


  // ---------- BOTÓN SALIR ----------
  const exitText = this.add.text(centerX, centerY + 140, "EXIT", {
    fontSize: "32px",
    fill: "#ffffff",
    fontFamily: "Arial",
  }).setOrigin(0.5).setInteractive({ useHandCursor: true });

  exitText.on("pointerover", () => exitText.setStyle({ fill: "#f39c12" }));
  exitText.on("pointerout",  () => exitText.setStyle({ fill: "#ffffff" }));
  exitText.on("pointerdown", () => {
    // En navegador no se puede “cerrar” de verdad,
    // pero podemos destruir el juego para simular que se cierra.
    this.game.destroy(true);
    // Opcional: mostrar mensaje
    // alert("Gracias por jugar :)");
  });
}


  update(time, delta) {
    // Animaciones o lógica continua, si se desea
  }
}

export default MainMenuScene;
