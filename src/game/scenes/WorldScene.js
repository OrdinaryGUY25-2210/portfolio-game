import Phaser from "phaser";
import { PALETTE } from "../config/palette.js";
import DayNightCycle from "../systems/DayNightCycle.js";
import {
  getCurrentSeason,
  getSeasonTint,
  getSeasonParticleConfig
} from "../systems/SeasonCycle.js";
import { getAssetUrl } from "../../lib/supabaseClient.js";

const PLAYER_SPEED = 220;
const JUMP_VELOCITY = -430;
const INTERACT_RADIUS = 46;

/**
 * IMPORTANT: portfolioData is NOT imported statically anymore.
 * It's read from `this.registry.get("portfolioData")`, which App.jsx populates
 * once (from local JSON, merged with any live Supabase content) before the
 * game boots. This is what lets the hidden Admin CMS push edits into the
 * running world without a full page reload — see AdminPanel.jsx's
 * `refreshLiveWorld()` which calls `game.registry.set("portfolioData", ...)`
 * and restarts this scene.
 */
export default class WorldScene extends Phaser.Scene {
  constructor() {
    super("WorldScene");
    this.activeQuestId = null;
    this.nearbyInteractable = null;
  }

  create() {
    const portfolioData = this.registry.get("portfolioData");
    this.meta = portfolioData.meta;
    this.zones = portfolioData.zones;
    this.projects = portfolioData.projects;
    this.certificates = portfolioData.certificates;

    const groundY = this.meta.groundY;
    const worldWidth = this.meta.worldWidthPx;

    this.physics.world.setBounds(0, 0, worldWidth, 640);
    this.cameras.main.setBounds(0, 0, worldWidth, 640);
    this.cameras.main.setBackgroundColor(0xb9cdd6);

    this.season = getCurrentSeason();
    this.applySeasonTint();

    this.buildParallaxSky(worldWidth);
    this.buildZoneBands(groundY, worldWidth);
    this.buildGround(groundY, worldWidth);
    this.buildPlayer(groundY);
    this.buildCategoryGates(groundY);
    this.buildProjectMarkers(groundY);
    this.buildCertificateIslands(groundY);
    this.buildSeasonParticles(worldWidth);
    this.buildHud();

    this.dayNight = new DayNightCycle(this, 40000);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys("W,A,S,D,E,SPACE");

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.fadeIn(400, 232, 220, 196);

    this.scale.on("resize", (gameSize) => {
      this.dayNight.resize(gameSize.width, gameSize.height);
    });

    this._onQuestClose = () => {
      this.activeQuestId = null;
    };
    window.addEventListener("quest:close", this._onQuestClose);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener("quest:close", this._onQuestClose);
    });
  }

  // --- World construction ---------------------------------------------------

  buildParallaxSky(worldWidth) {
    for (let i = 0; i < 14; i++) {
      const cloud = this.add.image(
        Phaser.Math.Between(0, worldWidth),
        Phaser.Math.Between(30, 180),
        "cloud"
      );
      cloud.setScrollFactor(0.25);
      cloud.setAlpha(0.7);
      cloud.setDepth(-10);
    }
  }

  buildZoneBands(groundY, worldWidth) {
    this.zoneLabelZones = [];
    this.zones.forEach((zone) => {
      const width = zone.endX - zone.startX;
      const band = this.add.rectangle(
        zone.startX + width / 2,
        groundY - 60,
        width,
        120,
        PALETTE[zone.colorKey],
        0.18
      );
      band.setDepth(-5);

      const label = this.add
        .text(zone.startX + 24, groundY - 190, zone.title.toUpperCase(), {
          fontFamily: '"Press Start 2P"',
          fontSize: "12px",
          color: "#4a3f35"
        })
        .setDepth(-4);
      label.setAlpha(0.85);

      this.zoneLabelZones.push({ ...zone, width, midX: zone.startX + width / 2 });
    });
  }

  buildGround(groundY, worldWidth) {
    this.groundGroup = this.physics.add.staticGroup();
    const tileSize = 32;
    for (let x = 0; x < worldWidth; x += tileSize) {
      const tile = this.add.tileSprite(x + tileSize / 2, groundY + tileSize / 2, tileSize, tileSize, "ground_tile");
      this.physics.add.existing(tile, true);
      this.groundGroup.add(tile);
    }
  }

  buildPlayer(groundY) {
    const tint = this.registry.get("selectedTint") || "#c9a66b";
    this.player = this.physics.add.sprite(160, groundY - 60, "player_idle");
    this.player.setTint(Phaser.Display.Color.HexStringToColor(tint).color);
    this.player.setScale(2);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(16, 30).setOffset(4, 2);
    this.physics.add.collider(this.player, this.groundGroup);

    this.blinkTimer = this.time.addEvent({
      delay: 3200,
      loop: true,
      callback: () => {
        if (this.player.texture.key === "player_idle") {
          this.player.setTexture("player_wave");
          this.time.delayedCall(150, () => {
            if (this.player.texture.key === "player_wave") {
              this.player.setTexture("player_idle");
            }
          });
        }
      }
    });
  }

  buildCategoryGates(groundY) {
    // One signpost per zone, placed just past the zone's entrance. Interacting
    // with it opens the layered "category list" menu (all projects in that
    // zone) rather than jumping straight to a single project's detail page —
    // this is the primary "press category" entry point requested for the
    // menu-overlay system. Individual project NPCs (buildProjectMarkers)
    // still allow jumping straight to a detail page for players who prefer
    // to explore organically.
    this.gates = this.physics.add.staticGroup();

    this.zones.forEach((zone) => {
      const gateX = zone.startX + 60;
      const gate = this.add.image(gateX, groundY - 26, "category_gate");
      gate.setScale(1.6);
      gate.setData("interactable", {
        type: "category",
        id: `gate-${zone.id}`,
        zoneId: zone.id
      });
      this.gates.add(gate);

      this.tweens.add({
        targets: gate,
        y: gate.y - 4,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    });
  }

  buildProjectMarkers(groundY) {
    this.markers = this.physics.add.staticGroup();

    this.projects.forEach((project) => {
      const marker = this.add.image(project.worldX, groundY - 110, "marker_gem");
      marker.setScale(1.6);
      this.tweens.add({
        targets: marker,
        y: marker.y - 8,
        duration: 1100,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });

      const zone = this.zones.find((z) => z.id === project.zoneId);
      const npc = this.add.image(project.worldX, groundY - 46, zone?.npcSprite || "npc_scholar");
      npc.setScale(1.8);

      npc.setData("interactable", {
        type: "project",
        id: project.id,
        worldX: project.worldX
      });
      this.markers.add(npc);
    });
  }

  buildCertificateIslands(groundY) {
    this.islandInteractables = [];
    this.certificates.forEach((cert) => {
      const islandY = groundY - 280;

      const island = this.add.image(cert.islandX, islandY, "island_chunk");
      island.setScale(1.4);
      this.tweens.add({
        targets: island,
        y: islandY - 6,
        duration: 2200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });

      for (let ry = groundY - 20; ry > islandY + 30; ry -= 30) {
        const rung = this.add.image(cert.islandX - 70, ry, "ladder_rung");
        rung.setScale(0.9);
      }

      const portal = this.add.image(cert.islandX, islandY - 30, "portal");
      this.tweens.add({
        targets: portal,
        alpha: 0.6,
        duration: 900,
        yoyo: true,
        repeat: -1
      });

      this.add
        .text(cert.islandX, islandY - 70, "CERTIFICATE", {
          fontFamily: '"Press Start 2P"',
          fontSize: "8px",
          color: "#4a3f35"
        })
        .setOrigin(0.5)
        .setAlpha(0.8);

      const platform = this.physics.add.staticSprite(cert.islandX, islandY - 6, "ground_tile");
      platform.setScale(4, 0.6).refreshBody();
      platform.setAlpha(0);
      this.physics.add.collider(this.player, platform);

      this.islandInteractables.push({
        type: "certificate",
        id: cert.id,
        x: cert.islandX,
        y: islandY - 30
      });
    });
  }

  buildSeasonParticles(worldWidth) {
    const cfg = getSeasonParticleConfig(this.season);
    const particleTexture = this.textures.exists("season_particle")
      ? "season_particle"
      : this.generateParticleTexture(cfg.color);

    this.seasonEmitter = this.add.particles(0, 0, particleTexture, {
      x: { min: 0, max: worldWidth },
      y: -10,
      lifespan: 6000,
      speedY: { min: cfg.speedY[0], max: cfg.speedY[1] },
      speedX: { min: -10, max: 10 },
      scale: { start: 0.6, end: 0.6 },
      quantity: 1,
      frequency: 260,
      alpha: { start: 0.9, end: 0.2 }
    });
    this.seasonEmitter.setDepth(50);
  }

  generateParticleTexture(color) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(color, 1);
    g.fillRect(0, 0, 4, 4);
    g.generateTexture("season_particle", 4, 4);
    g.destroy();
    return "season_particle";
  }

  applySeasonTint() {
    this.cameras.main.setBackgroundColor(getSeasonTint(this.season));
  }

  buildHud() {
    this.hudText = this.add
      .text(12, 10, "", {
        fontFamily: '"VT323"',
        fontSize: "18px",
        color: "#4a3f35",
        backgroundColor: "#e8dcc4cc",
        padding: { x: 8, y: 4 }
      })
      .setScrollFactor(0)
      .setDepth(1000);

    this.promptText = this.add
      .text(this.scale.width / 2, this.scale.height - 40, "", {
        fontFamily: '"Press Start 2P"',
        fontSize: "10px",
        color: "#4a3f35",
        backgroundColor: "#e8dcc4",
        padding: { x: 10, y: 8 }
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000)
      .setVisible(false);
  }

  // --- Per-frame update -------------------------------------------------

  update() {
    this.handleMovement();
    this.handleInteractionCheck();

    const phase = this.dayNight.update();
    const zoneNow = this.zoneLabelZones.find(
      (z) => this.player.x >= z.startX && this.player.x <= z.endX
    );
    this.hudText.setText(
      `${zoneNow ? zoneNow.title : "The Wilds"}  |  ${phase}  |  ${this.season[0].toUpperCase()}${this.season.slice(1)}`
    );
  }

  handleMovement() {
    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const jump = this.cursors.up.isDown || this.wasd.W.isDown || this.wasd.SPACE.isDown;

    if (left) {
      this.player.setVelocityX(-PLAYER_SPEED);
      this.player.setFlipX(true);
    } else if (right) {
      this.player.setVelocityX(PLAYER_SPEED);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    if (jump && this.player.body.blocked.down) {
      this.player.setVelocityY(JUMP_VELOCITY);
    }
  }

  handleInteractionCheck() {
    let closest = null;
    let closestDist = INTERACT_RADIUS;

    this.markers.children.iterate((npc) => {
      if (!npc) return;
      const data = npc.getData("interactable");
      if (!data) return;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
      if (dist < closestDist) {
        closestDist = dist;
        closest = data;
      }
    });

    this.gates.children.iterate((gate) => {
      if (!gate) return;
      const data = gate.getData("interactable");
      if (!data) return;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, gate.x, gate.y);
      if (dist < closestDist) {
        closestDist = dist;
        closest = data;
      }
    });

    this.islandInteractables.forEach((entry) => {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, entry.x, entry.y);
      if (dist < closestDist) {
        closestDist = dist;
        closest = entry;
      }
    });

    this.nearbyInteractable = closest;

    if (closest && this.activeQuestId !== closest.id) {
      this.promptText.setVisible(true);
      this.promptText.setText(closest.type === "category" ? "PRESS E TO BROWSE" : "PRESS E TO VIEW");
      if (Phaser.Input.Keyboard.JustDown(this.wasd.E)) {
        this.triggerQuest(closest);
      }
    } else {
      this.promptText.setVisible(false);
    }
  }

  triggerQuest(entry) {
    this.activeQuestId = entry.id;

    let payload = null;
    if (entry.type === "category") {
      const zone = this.zones.find((z) => z.id === entry.zoneId);
      const zoneProjects = this.projects
        .filter((p) => p.zoneId === entry.zoneId)
        .map((p) => ({ ...p, imageUrl: getAssetUrl(p.image) }));
      payload = {
        kind: "category",
        zoneId: entry.zoneId,
        zoneTitle: zone?.title || "Projects",
        projects: zoneProjects
      };
    } else if (entry.type === "project") {
      const project = this.projects.find((p) => p.id === entry.id);
      payload = {
        kind: "project",
        ...project,
        imageUrl: getAssetUrl(project.image)
      };
    } else if (entry.type === "certificate") {
      const cert = this.certificates.find((c) => c.id === entry.id);
      payload = {
        kind: "certificate",
        ...cert,
        imageUrl: getAssetUrl(cert.image)
      };
    }

    if (payload) {
      window.dispatchEvent(new CustomEvent("quest:open", { detail: payload }));
    }
  }
}
