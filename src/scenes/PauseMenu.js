// src/scenes/PauseMenu.js

export class PauseMenu extends Phaser.Scene {
  constructor() {
    super({ key: "PauseMenu" });
  }

  create() {
    const cam = this.cameras.main;

    const width = cam.width;
    const height = cam.height;

    const centerX = width / 2;
    const centerY = height / 2;

    // Fondo semitransparente EN TODA LA PANTALLA
    this.add
      .rectangle(0, 0, width, height, 0x000000, 0.7)
      .setOrigin(0); // esquina superior izquierda

    // Título PAUSE
    this.add
      .text(centerX, centerY - 120, "PAUSE", {
        fontSize: "48px",
        fontFamily: "Arial",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // === BOTÓN RESTART ===
    const restartText = this.add
      .text(centerX, centerY - 20, "RESTART", {
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
      this.scene.stop("Level1");
      this.scene.start("Level1");
      this.scene.stop(); // cierra PauseMenu
    });

    // === BOTÓN OPTIONS (en medio) ===
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

    optionsText.on("pointerdown", () => {
      // Lanzamos OptionsMenu ENCIMA, pasando que venimos de pausa
      this.scene.launch("OptionsMenu", { from: "pause" });
      this.scene.bringToTop("OptionsMenu");
      // Cerramos el PauseMenu (Level1 sigue pausado debajo)
      this.scene.stop();
    });

    // === BOTÓN EXIT ===
    const exitText = this.add
      .text(centerX, centerY + 100, "EXIT", {
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
      this.scene.stop("Level1");
      this.scene.start("MainMenuScene");
      this.scene.stop();
    });

    // ESC para reanudar el juego
    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.resume("Level1");
      this.scene.stop(); // cierra PauseMenu
    });
  }
}

export default PauseMenu;
