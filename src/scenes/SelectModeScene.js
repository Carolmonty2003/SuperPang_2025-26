// src/scenes/SelectModeScene.js

export class SelectModeScene extends Phaser.Scene {
  constructor() {
    super({ key: "SelectModeScene" });
  }

  create() {
    const cam = this.cameras.main;
    const centerX = cam.centerX;
    const centerY = cam.centerY;

    // Fondo oscuro tipo recreativa
    cam.setBackgroundColor("#000022");

    // Título
    this.add
      .text(centerX, centerY - 180, "SELECT GAME", {
        fontSize: "48px",
        fontFamily: "Arial",
        color: "#ffb6c1",
      })
      .setOrigin(0.5);

    // Texto inferior tipo original
    this.add
      .text(centerX, centerY + 200, "SUPER PANG!", {
        fontSize: "32px",
        fontFamily: "Arial",
        color: "#ffcc33",
      })
      .setOrigin(0.5);

    // ---------- BOTÓN TOUR MODE ----------
    const tourBox = this.add.rectangle(
      centerX - 250,
      centerY,
      380,
      220,
      0x333333,
      0.8
    );
    tourBox.setStrokeStyle(3, 0xffcc00);

    const tourTitle = this.add
      .text(tourBox.x, tourBox.y - 60, "TOUR MODE", {
        fontSize: "32px",
        fontFamily: "Arial",
        color: "#ffcc00",
      })
      .setOrigin(0.5);

    const tourDesc = this.add
      .text(
        tourBox.x,
        tourBox.y + 10,
        "Enjoy your trip\naround the world.\n40 stages to clear!",
        {
          fontSize: "18px",
          fontFamily: "Arial",
          color: "#ffffff",
          align: "center",
        }
      )
      .setOrigin(0.5);

    const tourZone = this.add
      .zone(tourBox.x, tourBox.y, tourBox.width, tourBox.height)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Hover TOUR
    tourZone.on("pointerover", () => {
      tourBox.setFillStyle(0x555555, 1);
      tourTitle.setColor("#ffffff");
    });

    tourZone.on("pointerout", () => {
      tourBox.setFillStyle(0x333333, 0.8);
      tourTitle.setColor("#ffcc00");
    });

    // Click TOUR -> ahora abre el nuevo Level_01
    tourZone.on("pointerdown", () => {
      this.scene.start("Level_01", { mode: "tour" });
    });

    // ---------- BOTÓN PANIC MODE ----------
    const panicBox = this.add.rectangle(
      centerX + 250,
      centerY,
      380,
      220,
      0x333333,
      0.8
    );
    panicBox.setStrokeStyle(3, 0xff3366);

    const panicTitle = this.add
      .text(panicBox.x, panicBox.y - 60, "PANIC MODE", {
        fontSize: "32px",
        fontFamily: "Arial",
        color: "#ff3366",
      })
      .setOrigin(0.5);

    const panicDesc = this.add
      .text(
        panicBox.x,
        panicBox.y + 10,
        "Balloons keep pouring down!\nHow long can you survive?",
        {
          fontSize: "18px",
          fontFamily: "Arial",
          color: "#ffffff",
          align: "center",
        }
      )
      .setOrigin(0.5);

    const panicZone = this.add
      .zone(panicBox.x, panicBox.y, panicBox.width, panicBox.height)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Hover PANIC
    panicZone.on("pointerover", () => {
      panicBox.setFillStyle(0x555555, 1);
      panicTitle.setColor("#ffffff");
    });

    panicZone.on("pointerout", () => {
      panicBox.setFillStyle(0x333333, 0.8);
      panicTitle.setColor("#ff3366");
    });

    // Click PANIC -> sigue abriendo el Level1 clásico
    panicZone.on("pointerdown", () => {
      this.scene.start("Level1", { mode: "panic" });
    });

    // Tecla ESC para volver al menú principal
    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.start("MainMenuScene");
    });
  }
}

export default SelectModeScene;
