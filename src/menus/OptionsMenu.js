// src/scenes/OptionsMenu.js

export class OptionsMenu extends Phaser.Scene {
  constructor() {
    super({ key: "OptionsMenu" });
  }

  create() {
    const cam = this.cameras.main;
    const centerX = cam.centerX;
    const centerY = cam.centerY;

    cam.setBackgroundColor("#00111f");

    // ---------- TÍTULO ----------
    this.add
      .text(centerX, centerY - 200, "OPTIONS", {
        fontSize: "48px",
        fontFamily: "Arial",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // ---------- SLIDER DE VOLUMEN ----------
    const trackWidth = 400;
    const trackHeight = 8;
    const trackY = centerY;
    const minX = centerX - trackWidth / 2;
    const maxX = centerX + trackWidth / 2;

    // Pista (barra gris)
    const track = this.add
      .rectangle(centerX, trackY, trackWidth, trackHeight, 0x555555)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Volumen inicial: lo intento leer del registry, si no, uso el de Phaser (o 1)
    let initialVolume = this.registry.get("volume");
    if (typeof initialVolume !== "number") {
      initialVolume =
        typeof this.sound.volume === "number" ? this.sound.volume : 1;
    }

    // Texto del valor de volumen
    const volumeText = this.add
      .text(centerX, trackY - 40, "", {
        fontSize: "24px",
        fontFamily: "Arial",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Handle (circulito que se arrastra)
    const handle = this.add
      .circle(
        Phaser.Math.Linear(minX, maxX, initialVolume),
        trackY,
        12,
        0xffcc00
      )
      .setInteractive({ useHandCursor: true });

    this.input.setDraggable(handle);

    // Función para aplicar volumen 0–1 y actualizar UI
    const applyVolume = (vol) => {
      const clamped = Phaser.Math.Clamp(vol, 0, 1);
      const x = Phaser.Math.Linear(minX, maxX, clamped);

      handle.x = x;
      this.sound.volume = clamped;        // volumen global del juego
      this.registry.set("volume", clamped); // guardamos valor global
      volumeText.setText(`Volume: ${Math.round(clamped * 100)}%`);
    };

    // Inicializar estado visual
    applyVolume(initialVolume);

    // Al hacer clic en la barra, mover el handle allí
    track.on("pointerdown", (pointer) => {
      const x = Phaser.Math.Clamp(pointer.x, minX, maxX);
      const t = (x - minX) / (maxX - minX);
      applyVolume(t);
    });

    // Al hacer clic directamente en el handle
    handle.on("pointerdown", (pointer) => {
      const x = Phaser.Math.Clamp(pointer.x, minX, maxX);
      const t = (x - minX) / (maxX - minX);
      applyVolume(t);
    });

    // Arrastrar el handle
    this.input.on("drag", (pointer, gameObject, dragX) => {
      if (gameObject !== handle) return;
      const x = Phaser.Math.Clamp(dragX, minX, maxX);
      const t = (x - minX) / (maxX - minX);
      applyVolume(t);
    });

    // ---------- BOTÓN VOLVER ----------
    const backText = this.add
      .text(centerX, centerY + 200, "BACK", {
        fontSize: "32px",
        fontFamily: "Arial",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    backText.on("pointerover", () => backText.setStyle({ color: "#f39c12" }));
    backText.on("pointerout", () => backText.setStyle({ color: "#ffffff" }));
    backText.on("pointerdown", () => {
      this.scene.start("MainMenuScene");
    });

    // ESC también vuelve al menú
    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.start("MainMenuScene");
    });
  }
}

export default OptionsMenu;
