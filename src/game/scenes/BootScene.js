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
    this.drawMountainLayers();
    this.drawForestSilhouette();
    this.drawTreeVariants();
    this.drawGrassTuft();
    this.drawGroundProps();
  }

  create() {
    this.scene.start("StartScene");
  }

  // --- Procedural pixel-art generators -------------------------------------

  drawPlayerFrames() {
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

    this.drawPlayerWalkFrames();
  }

  /**
   * Two-frame walk cycle (legs + swinging arm alternate), swapped in by
   * WorldScene only while the player is actually moving horizontally —
   * idle/wave frames take over the moment they stop, so it never looks like
   * they're "walking in place".
   */
  drawPlayerWalkFrames() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const draw = (strideOffset, frameKey) => {
      g.clear();
      // back leg
      g.fillStyle(PALETTE.slate, 1);
      g.fillRect(7 - strideOffset, 24, 4, 6);
      // body (slight lean)
      g.fillStyle(PALETTE.goldAccent, 1);
      g.fillRect(6, 10, 12, 14);
      g.fillStyle(0xb98d52, 1); // shaded side for a touch of depth
      g.fillRect(15, 10, 3, 14);
      // head
      g.fillStyle(0xead9c2, 1);
      g.fillRect(7, 2, 10, 9);
      g.fillStyle(PALETTE.ink, 1);
      g.fillRect(9, 6, 2, 2);
      g.fillRect(13, 6, 2, 2);
      // trailing arm
      g.fillStyle(0xead9c2, 1);
      g.fillRect(4 + strideOffset, 12, 3, 8);
      // front leg
      g.fillStyle(PALETTE.slate, 1);
      g.fillRect(13 + strideOffset, 24, 4, 6);
      // leading arm
      g.fillStyle(0xead9c2, 1);
      g.fillRect(18 - strideOffset, 12, 3, 8);
      g.generateTexture(frameKey, 24, 32);
    };
    draw(3, "player_walk_a");
    draw(-3, "player_walk_b");
    g.destroy();
  }

  drawVillagerFrames() {
    const variants = [
      { key: "villager_sprout", outfit: 0x9caf88, hair: 0x8a6b4a, skin: 0xead9c2 },
      { key: "villager_tide", outfit: 0xa7b6cf, hair: 0x4a3f35, skin: 0xead9c2 },
      { key: "villager_ember", outfit: 0xc38d94, hair: 0xc9a66b, skin: 0xe0c4a8 }
    ];

    variants.forEach(({ key, outfit, hair, skin }) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      const drawFrame = (stepOffset, frameKey) => {
        g.clear();
        g.fillStyle(PALETTE.ink, 1);
        g.fillRect(7 + stepOffset, 25, 4, 6);
        g.fillRect(13 - stepOffset, 25, 4, 6);
        g.fillStyle(outfit, 1);
        g.fillRect(6, 12, 12, 14);
        g.fillStyle(hair, 1);
        g.fillRect(6, 2, 12, 5);
        g.fillStyle(skin, 1);
        g.fillRect(7, 4, 10, 8);
        g.fillStyle(hair, 1);
        g.fillRect(6, 3, 3, 4);
        g.fillRect(15, 3, 3, 4);
        g.fillStyle(PALETTE.ink, 1);
        g.fillRect(9, 7, 2, 2);
        g.fillRect(13, 7, 2, 2);
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
    // grass blade flecks along the top edge for a fuller, less flat look
    g.fillStyle(PALETTE.groundDark, 1);
    for (let i = 0; i < 6; i++) {
      g.fillRect(2 + i * 5, 4, 2, 4);
    }
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

  drawBirdFrames() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const draw = (wingsUp, key) => {
      g.clear();
      g.fillStyle(PALETTE.slate, 1);
      g.fillRect(4, 3, 6, 3);
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
   * Village houses: stone-block walls, tiled roof ridge lines, an arched
   * wooden door, and (on project houses) climbing ivy accents — inspired by
   * cozy stone-cottage mood boards, drawn from scratch.
   *  - "house_project_*" — BOLD, saturated roof + lit window + ivy + roof
   *    flag. These are the interactable houses tied to a real project.
   *  - "house_deco_*"    — muted/desaturated, plain, no ivy/flag. Pure
   *    background scenery, never interactable.
   */
  drawHouseVariants() {
    const projectRoofs = [0xc97b5f, 0xb98a4a, 0xa8724f];
    const decoRoofs = [0x9a8e7a, 0x8f9a8a, 0x8a8a92];

    projectRoofs.forEach((roof, i) => {
      this.drawHouse(`house_project_${i}`, {
        wall: 0xe4d3ae,
        roof,
        door: 0x7a5230,
        windowLit: true,
        outline: PALETTE.ink,
        flag: true,
        ivy: true
      });
    });

    decoRoofs.forEach((roof, i) => {
      this.drawHouse(`house_deco_${i}`, {
        wall: 0xc9c2b2,
        roof,
        door: 0x6c7a89,
        windowLit: false,
        outline: 0x8b8378,
        flag: false,
        ivy: false
      });
    });
  }

  drawHouse(key, { wall, roof, door, windowLit, outline, flag, ivy }) {
    const W = 64;
    const H = 56;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // roof with tile-ridge lines
    g.fillStyle(roof, 1);
    g.fillTriangle(0, 22, W / 2, 0, W, 22);
    g.lineStyle(1, outline, 0.35);
    for (let ry = 4; ry < 22; ry += 5) {
      const spread = (22 - ry) * (W / 2 / 22);
      g.lineBetween(W / 2 - spread, ry + (22 - ry), W / 2 + spread, ry + (22 - ry));
    }
    g.lineStyle(2, outline, 1);
    g.strokeTriangle(0, 22, W / 2, 0, W, 22);

    // stone-block wall texture
    g.fillStyle(wall, 1);
    g.fillRect(6, 22, W - 12, H - 22);
    g.lineStyle(1, outline, 0.3);
    const blockH = 6;
    let row = 0;
    for (let by = 22; by < H; by += blockH) {
      const offset = row % 2 === 0 ? 0 : 6;
      for (let bx = 6 + offset; bx < W - 6; bx += 12) {
        g.strokeRect(bx, by, 12, blockH);
      }
      row++;
    }
    g.lineStyle(2, outline, 1);
    g.strokeRect(6, 22, W - 12, H - 22);

    // arched wooden door
    g.fillStyle(door, 1);
    g.fillRoundedRect(W / 2 - 6, H - 16, 12, 16, { tl: 5, tr: 5, bl: 0, br: 0 });
    g.lineStyle(1, outline, 0.6);
    g.lineBetween(W / 2, H - 14, W / 2, H);

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

    if (ivy) {
      // climbing ivy accent along one corner — a warm, lived-in touch,
      // reserved for the bold/interactable project houses.
      g.fillStyle(PALETTE.ground, 1);
      const ivySpots = [
        [8, 24], [10, 30], [7, 36], [11, 42], [8, 48],
        [W - 10, 26], [W - 8, 33]
      ];
      ivySpots.forEach(([ix, iy]) => g.fillRect(ix, iy, 4, 4));
    }

    if (flag) {
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

  /**
   * Two parallax mountain-ridge silhouette strips (far = lighter/hazier,
   * near = a touch darker/greener), tiled behind the world via tileSprite.
   * Composition inspired by layered pixel-art parallax backgrounds, but the
   * peaks/colors are original.
   */
  drawMountainLayers() {
    const layers = [
      { key: "mountain_far", color: 0xb7c6cf, peaks: [40, 70, 35, 85, 45, 65], height: 130 },
      { key: "mountain_near", color: 0x9cb0a8, peaks: [55, 30, 75, 40, 60, 25], height: 150 }
    ];

    layers.forEach(({ key, color, peaks, height }) => {
      const width = 220;
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(color, 1);
      const segW = width / (peaks.length - 1);
      g.beginPath();
      g.moveTo(0, height);
      peaks.forEach((p, i) => g.lineTo(i * segW, height - p));
      g.lineTo(width, height);
      g.closePath();
      g.fillPath();
      g.generateTexture(key, width, height);
      g.destroy();
    });
  }

  /**
   * A tileable strip of pine-tree silhouettes for a mid-distance forest
   * edge, sitting between the mountain layers and the playable foreground.
   */
  drawForestSilhouette() {
    const width = 180;
    const height = 90;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x7e9a82, 1);
    const treeXs = [10, 42, 74, 106, 140, 168];
    treeXs.forEach((x, i) => {
      const h = 55 + (i % 3) * 10;
      g.fillTriangle(x, height, x + 16, height - h, x + 32, height);
    });
    g.generateTexture("forest_strip", width, height);
    g.destroy();
  }

  /**
   * Standalone foreground trees/bushes used to dot the world and thicken
   * into denser "hutan" clusters in the wilderness gaps between villages.
   */
  drawTreeVariants() {
    // Round leafy tree
    {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(PALETTE.soil, 1);
      g.fillRect(15, 40, 6, 16);
      g.fillStyle(PALETTE.groundDark, 1);
      g.fillCircle(18, 22, 20);
      g.fillStyle(PALETTE.ground, 1);
      g.fillCircle(12, 18, 14);
      g.fillCircle(24, 16, 12);
      g.fillCircle(18, 28, 13);
      g.generateTexture("tree_round", 36, 56);
      g.destroy();
    }
    // Pine/conifer tree
    {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(PALETTE.soil, 1);
      g.fillRect(13, 46, 6, 12);
      g.fillStyle(0x6f8a72, 1);
      g.fillTriangle(16, 0, 32, 30, 0, 30);
      g.fillStyle(PALETTE.ground, 1);
      g.fillTriangle(16, 14, 30, 40, 2, 40);
      g.fillStyle(0x89a686, 1);
      g.fillTriangle(16, 26, 28, 50, 4, 50);
      g.generateTexture("tree_pine", 32, 58);
      g.destroy();
    }
    // Small bush (used for foreground clutter / hedges)
    {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(PALETTE.groundDark, 1);
      g.fillCircle(11, 14, 11);
      g.fillStyle(PALETTE.ground, 1);
      g.fillCircle(7, 12, 8);
      g.fillCircle(15, 12, 8);
      g.generateTexture("bush_small", 22, 22);
      g.destroy();
    }
  }

  drawGrassTuft() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(PALETTE.groundDark, 1);
    g.fillTriangle(0, 10, 2, 0, 4, 10);
    g.fillTriangle(3, 10, 5, 2, 7, 10);
    g.fillTriangle(6, 10, 8, 0, 10, 10);
    g.generateTexture("grass_tuft", 10, 10);
    g.destroy();
  }

  /**
   * Small original ground clutter (mushroom, flower, log) — same spirit as a
   * generic pixel-art nature asset pack, drawn from scratch, in our muted
   * palette rather than a bright saturated one.
   */
  drawGroundProps() {
    // mushroom
    {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xead9c2, 1);
      g.fillRect(5, 8, 4, 6);
      g.fillStyle(PALETTE.rose, 1);
      g.fillRoundedRect(0, 0, 14, 9, 3);
      g.fillStyle(0xf1e6cf, 0.7);
      g.fillCircle(4, 4, 1.4);
      g.fillCircle(10, 3, 1.2);
      g.generateTexture("prop_mushroom", 14, 14);
      g.destroy();
    }
    // small flower
    {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(PALETTE.groundDark, 1);
      g.fillRect(4, 6, 2, 6);
      g.fillStyle(PALETTE.rose, 1);
      g.fillCircle(2, 3, 2.2);
      g.fillCircle(6, 3, 2.2);
      g.fillCircle(4, 1, 2.2);
      g.fillCircle(4, 5, 2.2);
      g.fillStyle(PALETTE.goldAccent, 1);
      g.fillCircle(4, 3, 1.6);
      g.generateTexture("prop_flower", 10, 12);
      g.destroy();
    }
    // fallen log
    {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(PALETTE.soil, 1);
      g.fillRoundedRect(0, 2, 26, 8, 3);
      g.fillStyle(0xead9c2, 1);
      g.fillEllipse(2, 6, 4, 7);
      g.fillEllipse(24, 6, 4, 7);
      g.lineStyle(1, PALETTE.ink, 0.4);
      g.strokeCircle(2, 6, 2);
      g.strokeCircle(24, 6, 2);
      g.generateTexture("prop_log", 26, 12);
      g.destroy();
    }
  }
}
