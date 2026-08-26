import Phaser from "phaser";

export default class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super("CharacterSelectScene");
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(0xd9e4d1);

    this.add
      .text(width / 2, 70, "CHOOSE YOUR WANDERER", {
        fontFamily: '"Press Start 2P"',
        fontSize: "14px",
        color: "#4a3f35"
      })
      .setOrigin(0.5);

    const portfolioData = this.registry.get("portfolioData");
    const characters = portfolioData.characters;
    const spacing = width / (characters.length + 1);

    characters.forEach((char, i) => {
      const x = spacing * (i + 1);
      const y = height / 2;

      const card = this.add.rectangle(x, y, 130, 170, 0xe8dcc4);
      card.setStrokeStyle(3, 0x8b7355);
      card.setInteractive({ useHandCursor: true });

      const sprite = this.add.image(x, y - 20, "player_idle");
      sprite.setScale(3);
      sprite.setTint(Phaser.Display.Color.HexStringToColor(char.tint).color);

      const label = this.add
        .text(x, y + 60, char.label, {
          fontFamily: '"VT323"',
          fontSize: "20px",
          color: "#4a3f35"
        })
        .setOrigin(0.5);

      const select = () => {
        this.registry.set("selectedCharacter", char.id);
        this.registry.set("selectedTint", char.tint);
        this.cameras.main.fadeOut(300, 232, 220, 196);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("WorldScene");
        });
      };

      card.on("pointerover", () => card.setFillStyle(0xf1e6cf));
      card.on("pointerout", () => card.setFillStyle(0xe8dcc4));
      card.on("pointerdown", select);

      this.tweens.add({
        targets: sprite,
        y: sprite.y - 5,
        duration: 1200 + i * 120,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });

      label.setInteractive({ useHandCursor: true }).on("pointerdown", select);
    });

    this.add
      .text(width / 2, height - 30, "Tap a wanderer to begin exploring", {
        fontFamily: '"VT323"',
        fontSize: "16px",
        color: "#6c7a89"
      })
      .setOrigin(0.5);
  }
}
