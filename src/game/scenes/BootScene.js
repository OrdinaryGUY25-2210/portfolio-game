import Phaser from "phaser";
import { PALETTE } from "../config/palette.js";

/**
 * All "pixel art" in this scene is generated procedurally with Phaser.Graphics
 * so the project runs immediately with zero binary assets checked in.
 *
 * To use real hand-drawn sprites instead: upload webp/png sprite sheets to your
 * Supabase Storage bucket (see README "Character & Tile Sprites") and swap the
 * `this.load.image(...)` calls back in — the rest of the scene code (physics
 * bodies, animation frame names) is written to tolerate either source.
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.drawPlayerFrames();
    this.drawNpcFrames();
    this.drawGroundTile();
    this.drawParchmentIcon();
    this.drawPortal();
    this.drawLadderRung();
    this.drawMarkerGem();
    this.drawCloud();
    this.drawIslandChunk();
    this.drawSignpost();
  }

  create() {
    this.scene.start("StartScene");
  }

  // --- Procedural pixel-art generators -------------------------------------

  drawPlayerFrames() {
    // Two-frame idle: standing, and a subtle "arm raised" wave/blink frame.
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const draw = (armUp) => {
      g.clear();
      // body
      g.fillStyle(PALETTE.goldAccent, 1);
      g.fillRect(6, 10, 12, 14);
      // head
      g.fillStyle(0xead9c2, 1);
      g.fillRect(7, 2, 10, 9);
      // eyes (blink frame closes them)
      g.fillStyle(PALETTE.ink, 1);
      if (!armUp) {
        g.fillRect(9, 6, 2, 2);
        g.fillRect(13, 6, 2, 2);
      } else {
        g.fillRect(9, 7, 2, 1);
        g.fillRect(13, 7, 2, 1);
      }
      // legs
      g.fillStyle(PALETTE.slate, 1);
      g.fillRect(7, 24, 4, 6);
      g.fillRect(13, 24, 4, 6);
      // arm (raised on wave frame)
      g.fillStyle(0xead9c2, 1);
      if (armUp) {
        g.fillRect(18, 6, 3, 8);
      } else {
        g.fillRect(18, 12, 3, 8);
      }
      g.generateTexture(armUp ? "player_wave" : "player_idle", 24, 32);
    };
    draw(false);
    draw(true);
    g.destroy();
  }

  drawNpcFrames() {
    const variants = [
      { key: "npc_scholar", body: PALETTE.zoneWebApps },
      { key: "npc_tinkerer", body: PALETTE.zoneInteractive },
      { key: "npc_artisan", body: PALETTE.zoneOtherDesigns }
    ];
    variants.forEach(({ key, body }) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(body, 1);
      g.fillRect(6, 10, 12, 16);
      g.fillStyle(0xead9c2, 1);
      g.fillRect(7, 2, 10, 9);
      g.fillStyle(PALETTE.ink, 1);
      g.fillRect(9, 6, 2, 2);
      g.fillRect(13, 6, 2, 2);
      g.fillStyle(PALETTE.parchmentEdge, 1);
      g.fillRect(7, 26, 4, 6);
      g.fillRect(13, 26, 4, 6);
      g.generateTexture(key, 24, 32);
      g.destroy();
    });
  }

  drawGroundTile() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(PALETTE.ground, 1);
    g.fillRect(0, 0, 32, 8);
    g.fillStyle(PALETTE.groundDark, 1);
    g.fillRect(0, 8, 32, 24);
    // speckle texture for a hand-drawn feel
    g.fillStyle(PALETTE.soil, 0.5);
    for (let i = 0; i < 10; i++) {
      g.fillRect((i * 7) % 32, 10 + ((i * 5) % 18), 2, 2);
    }
    g.generateTexture("ground_tile", 32, 32);
    g.destroy();
  }

  drawParchmentIcon() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(PALETTE.parchment, 1);
    g.fillRoundedRect(0, 0, 20, 24, 3);
    g.lineStyle(2, PALETTE.parchmentEdge, 1);
    g.strokeRoundedRect(0, 0, 20, 24, 3);
    g.generateTexture("quest_icon", 20, 24);
    g.destroy();
  }

  drawPortal() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(PALETTE.zoneCertificates, 0.85);
    g.fillEllipse(16, 24, 20, 40);
    g.lineStyle(2, 0xffffff, 0.5);
    g.strokeEllipse(16, 24, 14, 32);
    g.generateTexture("portal", 32, 48);
    g.destroy();
  }

  drawLadderRung() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(PALETTE.parchmentEdge, 1);
    g.fillRect(2, 0, 4, 32);
    g.fillRect(18, 0, 4, 32);
    g.fillRect(0, 4, 24, 3);
    g.fillRect(0, 16, 24, 3);
    g.fillRect(0, 28, 24, 3);
    g.generateTexture("ladder_rung", 24, 32);
    g.destroy();
  }

  drawMarkerGem() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(PALETTE.goldAccent, 1);
    g.fillTriangle(8, 0, 16, 8, 8, 16);
    g.fillTriangle(8, 0, 0, 8, 8, 16);
    g.lineStyle(1, 0xffffff, 0.6);
    g.strokeTriangle(8, 0, 16, 8, 8, 16);
    g.strokeTriangle(8, 0, 0, 8, 8, 16);
    g.generateTexture("marker_gem", 16, 16);
    g.destroy();
  }

  drawCloud() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 0.55);
    g.fillEllipse(20, 14, 40, 18);
    g.fillEllipse(40, 10, 30, 16);
    g.fillEllipse(10, 12, 24, 14);
    g.generateTexture("cloud", 60, 24);
    g.destroy();
  }

  drawIslandChunk() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(PALETTE.zoneCertificates, 1);
    g.fillRoundedRect(0, 0, 120, 40, 10);
    g.fillStyle(PALETTE.ground, 1);
    g.fillRoundedRect(0, 0, 120, 14, { tl: 10, tr: 10, bl: 0, br: 0 });
    g.generateTexture("island_chunk", 120, 40);
    g.destroy();
  }

  drawSignpost() {
    // A wooden signpost marking a zone's "category gate" — interact here to
    // browse the full project list for that zone, rather than a single item.
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // post
    g.fillStyle(PALETTE.parchmentEdge, 1);
    g.fillRect(11, 14, 6, 26);
    // sign board
    g.fillStyle(PALETTE.parchment, 1);
    g.fillRoundedRect(0, 0, 28, 20, 2);
    g.lineStyle(2, PALETTE.parchmentEdge, 1);
    g.strokeRoundedRect(0, 0, 28, 20, 2);
    // scribble lines suggesting a list/menu icon
    g.lineStyle(2, PALETTE.goldAccent, 1);
    g.lineBetween(6, 6, 22, 6);
    g.lineBetween(6, 10, 22, 10);
    g.lineBetween(6, 14, 16, 14);
    g.generateTexture("category_gate", 28, 40);
    g.destroy();
  }
}
