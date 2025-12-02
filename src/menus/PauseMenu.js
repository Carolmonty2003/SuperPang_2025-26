// src/scenes/PauseMenu.js

export class PauseMenu extends Phaser.Scene {
  constructor() {
    super({ key: "PauseMenu" });
  }

  create() {
    const cam = this.cameras.main;
    const centerX = cam.centerX;
    const centerY = cam.centerY;

    // Fondo semitransparente encima del juego pausado
    this.add
      .rectangle(centerX, centerY, cam.width, cam.height, 0x000000, 0.7)
      .setOrigin(0.5);

    // Título PAUSE
    this.add
      .text(centerX, centerY - 180, "PAUSE", {
        fontSize: "48px",
        fontFamily: "Arial",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // === BOTÓN RESTART ===
    const restartText = this.add
      .text(centerX, centerY - 40, "RESTART", {
        fontSize: "32px",
        fontFamily: "Arial",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    restartText.on("pointerover", () =>
      restartText.setStyle({ color: "#f39c12" })
    );
    restartText.on("pointerout", () =>
      restartText.setStyle({ color: "#ffffff" })
    );
    restartText.on("pointerdown", () => {
      // Paramos el nivel actual y lo volvemos a iniciar
      this.scene.stop("Level1");
      this.scene.start("Level1");
      // Cerramos el menú de pausa
      this.scene.stop(); // o this.scene.stop("PauseMenu");
    });

    /// === BOTÓN OPTIONS (en medio) ===
const optionsText = this.add
  .text(centerX, centerY + 40, "OPTIONS", {
    fontSize: "32px",
    fontFamily: "Arial",
    color: "#ffffff",
  })
  .setOrigin(0.5)
  .setInteractive({ useHandCursor: true });

    optionsText.on("pointerover", () =>
    optionsText.setStyle({ color: "#f39c12" })
);
    optionsText.on("pointerout", () =>
    optionsText.setStyle({ color: "#ffffff" })
);

// no paramos Level1, solo vamos a OptionsMenu
    optionsText.on("pointerdown", () => {
    this.scene.start("OptionsMenu", { from: "pause" });
});


    // === BOTÓN EXIT ===
    const exitText = this.add
      .text(centerX, centerY + 80, "EXIT", {
        fontSize: "32px",
        fontFamily: "Arial",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    exitText.on("pointerover", () =>
      exitText.setStyle({ color: "#f39c12" })
    );
    exitText.on("pointerout", () =>
      exitText.setStyle({ color: "#ffffff" })
    );
    exitText.on("pointerdown", () => {
      // Cerramos el nivel y volvemos al menú principal
      this.scene.stop("Level1");
      this.scene.start("MainMenuScene");
      this.scene.stop();
    });

    // === ESC para reanudar la partida (opcional pero muy cómodo) ===
    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.resume("Level1");
      this.scene.stop();
    });
  }
}

export default PauseMenu;
