import Phaser from "phaser";
import { PALETTE } from "../config/palette.js";

export default class StartScene extends Phaser.Scene {
  constructor() {
    super("StartScene");
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor(0xd9e4d1);

    // Drifting clouds for a little ambient life behind the title.
    for (let i = 0; i < 4; i++) {
      const cloud = this.add.image(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(40, 160),
        "cloud"
      );
      cloud.setAlpha(0.8);
      this.tweens.add({
        targets: cloud,
        x: cloud.x + width + 100,
        duration: Phaser.Math.Between(20000, 34000),
        repeat: -1,
        onRepeat: () => {
          cloud.x = -100;
        }
      });
    }

    // Portrait with idle blink/wave animation, framed like a character-select card.
    const portraitX = width / 2;
    const portraitY = height / 2 - 60;

    const frame = this.add.rectangle(portraitX, portraitY, 120, 150, 0xe8dcc4);
    frame.setStrokeStyle(4, 0x8b7355);

    const portrait = this.add.image(portraitX, portraitY + 10, "player_idle");
    portrait.setScale(3.4);

    this.time.addEvent({
      delay: 2600,
      loop: true,
      callback: () => {
        portrait.setTexture("player_wave");
        this.time.delayedCall(220, () => portrait.setTexture("player_idle"));
      }
    });
    // subtle idle bob
    this.tweens.add({
      targets: portrait,
      y: portrait.y - 4,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    this.add
      .text(width / 2, portraitY - 110, "ALDI TRIANTAMA", {
        fontFamily: '"Press Start 2P"',
        fontSize: "20px",
        color: "#4a3f35"
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, portraitY - 82, "- PORTFOLIO -", {
        fontFamily: '"Press Start 2P"',
        fontSize: "10px",
        color: "#8b7355"
      })
      .setOrigin(0.5);

    // Retro PRESS START button
    const btnY = portraitY + 130;
    const btn = this.add.rectangle(width / 2, btnY, 220, 46, PALETTE.goldAccent);
    btn.setStrokeStyle(3, 0x4a3f35);
    btn.setInteractive({ useHandCursor: true });

    const btnLabel = this.add
      .text(width / 2, btnY, "PRESS START", {
        fontFamily: '"Press Start 2P"',
        fontSize: "12px",
        color: "#4a3f35"
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: [btn, btnLabel],
      alpha: 0.55,
      duration: 650,
      yoyo: true,
      repeat: -1
    });

    btn.on("pointerover", () => btn.setFillStyle(0xd8bb84));
    btn.on("pointerout", () => btn.setFillStyle(PALETTE.goldAccent));
    btn.on("pointerdown", () => this.scene.start("CharacterSelectScene"));

    this.input.keyboard.once("keydown-SPACE", () =>
      this.scene.start("CharacterSelectScene")
    );
    this.input.keyboard.once("keydown-ENTER", () =>
      this.scene.start("CharacterSelectScene")
    );

    this.add
      .text(width / 2, height - 24, "Space / Enter / Tap to begin", {
        fontFamily: '"VT323"',
        fontSize: "16px",
        color: "#6c7a89"
      })
      .setOrigin(0.5);
  }
}
