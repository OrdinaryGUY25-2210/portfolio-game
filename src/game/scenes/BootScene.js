import Phaser from "phaser";
import { PALETTE } from "../config/palette.js";

/**
 * All "pixel art" in this scene is generated procedurally with Phaser.Graphics
 * so the project runs immediately with zero binary assets checked in, and so
 * everything stays 100% original artwork (no third-party/copyrighted sprites
 * are embedded anywhere in this project).
 *
 * To use real hand-drawn sprites instead: upload webp/png sprite sheets to your
 * Supabase Storage bucket and swap the `this.load.image(...)` calls back in —
 * the rest of the scene code (physics bodies, animation frame names) is
 * written to tolerate either source.
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.drawPlayerFrames();
    this.drawVillagerFrames();
    this.drawGroundTile();
    this.drawPortal();
    this.drawLadderRung();
    this.drawCloud();
    this.drawBirdFrames();
    this.drawIslandChunk();
    this.drawHouseVariants();
    this.drawChimneySmoke();
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
      g.fillStyle(PALETTE.goldAccent, 1);
      g.fillRect(6, 10, 12, 14);
      g.fillStyle(0xead9c2, 1);
      g.fillRect(7, 2, 10, 9);
      g.fillStyle(PALETTE.ink, 1);
      if (!armUp) {
        g.fillRect(9, 6, 2, 2);
        g.fillRect(13, 6, 2, 2);
      } else {
        g.fillRect(9, 7, 2, 1);
        g.fillRect(13, 7, 2, 1);
      }
      g.fillStyle(PALETTE.slate, 1);
      g.fillRect(7, 24, 4, 6);
      g.fillRect(13, 24, 4, 6);
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

  /**
   * Original chibi villager designs (idle + a "step" frame each), inspired by
   * cozy pixel-village mood boards but drawn from scratch — distinct
   * silhouettes/outfits, not a copy of any existing character or franchise.
   * These populate the houses and wander the village to keep the world alive.
   */
  drawVillagerFrames() {
    const variants = [
      { key: "villager_sprout", outfit: 0x9caf88, hair: 0x8a6b4a, skin: 0xead9c2 }, // green apron
      { key: "villager_tide", outfit: 0xa7b6cf, hair: 0x4a3f35, skin: 0xead9c2 }, // blue cloak
      { key: "villager_ember", outfit: 0xc38d94, hair: 0xc9a66b, skin: 0xe0c4a8 } // rose scarf
    ];

    variants.forEach(({ key, outfit, hair, skin }) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      const drawFrame = (stepOffset, frameKey) => {
        g.clear();
        // legs (slightly offset per frame to fake a walk-cycle)
        g.fillStyle(PALETTE.ink, 1);
        g.fillRect(7 + stepOffset, 25, 4, 6);
        g.fillRect(13 - stepOffset, 25, 4, 6);
        // body/outfit
        g.fillStyle(outfit, 1);
        g.fillRect(6, 12, 12, 14);
        // hair (back)
        g.fillStyle(hair, 1);
        g.fillRect(6, 2, 12, 5);
        // face
        g.fillStyle(skin, 1);
        g.fillRect(7, 4, 10, 8);
        // hair (fringe)
        g.fillStyle(hair, 1);
        g.fillRect(6, 3, 3, 4);
        g.fillRect(15, 3, 3, 4);
        // eyes
        g.fillStyle(PALETTE.ink, 1);
        g.fillRect(9, 7, 2, 2);
        g.fillRect(13, 7, 2, 2);
        // arms
        g.fillStyle(skin, 1);
        g.fillRect(4, 14, 3, 8);
        g.fillRect(17, 14, 3, 8);
        g.generateTexture(frameKey, 24, 32);
      };
      drawFrame(0, `${key}_a`);
      drawFrame(2, `${key}_b`);
    });
  }

  drawGroundTile() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(PALETTE.ground, 1);
    g.fillRect(0, 0, 32, 8);
    g.fillStyle(PALETTE.groundDark, 1);
    g.fillRect(0, 8, 32, 24);
    g.fillStyle(PALETTE.soil, 0.5);
    for (let i = 0; i < 10; i++) {
      g.fillRect((i * 7) % 32, 10 + ((i * 5) % 18), 2, 2);
    }
    g.generateTexture("ground_tile", 32, 32);
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

  drawCloud() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 0.55);
    g.fillEllipse(20, 14, 40, 18);
    g.fillEllipse(40, 10, 30, 16);
    g.fillEllipse(10, 12, 24, 14);
    g.generateTexture("cloud", 60, 24);
    g.destroy();
  }

  /**
   * Small original bird silhouette, two flap frames, muted slate/rose tones
   * so it reads as ambient wildlife rather than a bright cartoon mascot.
   */
  drawBirdFrames() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const draw = (wingsUp, key) => {
      g.clear();
      g.fillStyle(PALETTE.slate, 1);
      // body
      g.fillRect(4, 3, 6, 3);
      // wings
      if (wingsUp) {
        g.fillRect(2, 0, 3, 3);
        g.fillRect(9, 0, 3, 3);
      } else {
        g.fillRect(2, 4, 3, 3);
        g.fillRect(9, 4, 3, 3);
      }
      g.generateTexture(key, 14, 8);
    };
    draw(true, "bird_a");
    draw(false, "bird_b");
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

  /**
   * Village houses come in two families:
   *  - "house_project_*"  — BOLD, more saturated palette. These are the
   *    interactable houses that represent a real project. Slightly larger,
   *    with a bright roof and a lit window, so they visually pop against...
   *  - "house_deco_*"     — muted/desaturated palette, plain, no lit window.
   *    Pure background scenery to make the village feel populated, never
   *    interactable.
   * Multiple roof-color variants exist in each family purely for visual
   * variety along a street of houses.
   */
  drawHouseVariants() {
    const projectRoofs = [0xc97b5f, 0xb98a4a, 0xa8724f];
    const decoRoofs = [0x9a8e7a, 0x8f9a8a, 0x8a8a92];

    projectRoofs.forEach((roof, i) => {
      this.drawHouse(`house_project_${i}`, {
        wall: 0xf1e6cf,
        roof,
        door: PALETTE.ink,
        windowLit: true,
        outline: PALETTE.ink,
        flag: true
      });
    });

    decoRoofs.forEach((roof, i) => {
      this.drawHouse(`house_deco_${i}`, {
        wall: 0xd9d2c0,
        roof,
        door: 0x6c7a89,
        windowLit: false,
        outline: 0x8b8378,
        flag: false
      });
    });
  }

  drawHouse(key, { wall, roof, door, windowLit, outline, flag }) {
    const W = 64;
    const H = 56;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // roof (simple triangle-ish pixel gable)
    g.fillStyle(roof, 1);
    g.fillTriangle(0, 22, W / 2, 0, W, 22);
    g.lineStyle(2, outline, 1);
    g.strokeTriangle(0, 22, W / 2, 0, W, 22);

    // walls
    g.fillStyle(wall, 1);
    g.fillRect(6, 22, W - 12, H - 22);
    g.lineStyle(2, outline, 1);
    g.strokeRect(6, 22, W - 12, H - 22);

    // door
    g.fillStyle(door, 1);
    g.fillRect(W / 2 - 6, H - 16, 12, 16);

    // windows
    g.fillStyle(windowLit ? 0xf3d9a0 : 0xb9c3c9, 1);
    g.fillRect(12, 30, 10, 10);
    g.fillRect(W - 22, 30, 10, 10);
    g.lineStyle(1, outline, 1);
    g.strokeRect(12, 30, 10, 10);
    g.strokeRect(W - 22, 30, 10, 10);

    // chimney
    g.fillStyle(outline, 1);
    g.fillRect(W - 18, 4, 8, 12);

    if (flag) {
      // small bold flag/marker on the roof peak — a quiet visual cue that
      // this house is the interactable/project kind.
      g.fillStyle(PALETTE.goldAccent, 1);
      g.fillRect(W / 2, -6, 2, 10);
      g.fillTriangle(W / 2 + 2, -6, W / 2 + 12, -3, W / 2 + 2, 0);
    }

    g.generateTexture(key, W, H + 10);
    g.destroy();
  }

  drawChimneySmoke() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(3, 3, 3);
    g.generateTexture("smoke_puff", 6, 6);
    g.destroy();
  }
}
