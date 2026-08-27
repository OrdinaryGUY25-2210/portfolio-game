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
const INTERACT_RADIUS = 50;
const BUBBLE_RADIUS = 110;

const VILLAGER_KEYS = ["villager_sprout", "villager_tide", "villager_ember"];

/**
 * IMPORTANT: portfolioData is NOT imported statically anymore.
 * It's read from `this.registry.get("portfolioData")`, which App.jsx populates
 * once (from local JSON, merged with any live Supabase content) before the
 * game boots. This lets the hidden Admin CMS push edits into the running
 * world without a full page reload.
 *
 * World layout: each project is represented by a bold-colored, interactable
 * "project house" with a villager standing/wandering nearby. Getting close
 * (BUBBLE_RADIUS) makes that villager show a speech bubble naming the
 * project; pressing E within INTERACT_RADIUS opens the full detail overlay.
 * Extra muted, non-interactive "decorative houses" fill the gaps so the
 * village reads as lived-in rather than a row of kiosks.
 */
export default class WorldScene extends Phaser.Scene {
  constructor() {
    super("WorldScene");
    this.activeQuestId = null;
    this.nearbyInteractable = null;
    this.projectHouses = [];
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
    this.buildBirds(worldWidth, groundY);
    this.buildZoneBands(groundY, worldWidth);
    this.buildGround(groundY, worldWidth);
    this.buildPlayer(groundY);
    this.buildVillage(groundY);
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

  buildBirds(worldWidth, groundY) {
    // A handful of ambient birds drifting across the sky at varying heights,
    // with a simple two-frame flap animation, to make the world feel alive
    // even far from any village. Muted slate tone keeps them unobtrusive.
    this.birds = [];
    const birdCount = 9;
    for (let i = 0; i < birdCount; i++) {
      const startX = Phaser.Math.Between(0, worldWidth);
      const y = groundY - Phaser.Math.Between(220, 400);
      const bird = this.add.image(startX, y, "bird_a");
      bird.setScrollFactor(0.6);
      bird.setScale(Phaser.Math.FloatBetween(1.2, 1.9));
      bird.setDepth(-6);
      bird.flapToggle = Math.random() > 0.5;

      const speed = Phaser.Math.FloatBetween(18, 40);
      bird.driftSpeed = speed;
      bird.driftDir = Math.random() > 0.5 ? 1 : -1;
      if (bird.driftDir < 0) bird.setFlipX(true);

      this.time.addEvent({
        delay: Phaser.Math.Between(220, 340),
        loop: true,
        callback: () => {
          bird.flapToggle = !bird.flapToggle;
          bird.setTexture(bird.flapToggle ? "bird_a" : "bird_b");
        }
      });

      this.birds.push(bird);
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
        .text(zone.startX + 24, groundY - 230, zone.title.toUpperCase(), {
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

  /**
   * Builds one small village per zone: a bold "project house" + wandering
   * villager + hidden speech bubble for every project, interleaved with
   * muted decorative houses that are purely atmospheric (not interactable).
   */
  buildVillage(groundY) {
    this.projectHouses = [];

    this.zones.forEach((zone) => {
      const zoneProjects = this.projects
        .filter((p) => p.zoneId === zone.id)
        .sort((a, b) => a.worldX - b.worldX);

      zoneProjects.forEach((project, i) => {
        this.buildProjectHouse(project, groundY, i);
      });

      this.buildDecorativeHouses(zone, zoneProjects, groundY);
    });
  }

  buildProjectHouse(project, groundY, variantSeed) {
    const houseKey = `house_project_${variantSeed % 3}`;
    const houseY = groundY - 28;
    const house = this.add.image(project.worldX, houseY, houseKey);
    house.setScale(1.5);
    house.setDepth(house.y);

    house.setInteractive({ useHandCursor: true });
    house.setData("interactable", {
      type: "project",
      id: project.id,
      worldX: project.worldX
    });

    // A villager stationed at this house, wandering a short patrol range and
    // never standing perfectly still.
    const villagerKey = VILLAGER_KEYS[variantSeed % VILLAGER_KEYS.length];
    const villager = this.add.sprite(project.worldX + 20, groundY - 30, `${villagerKey}_a`);
    villager.setScale(1.6);
    villager.setDepth(villager.y + 1);

    const patrolRange = 30;
    const baseX = villager.x;
    this.tweens.add({
      targets: villager,
      x: baseX + patrolRange,
      duration: Phaser.Math.Between(2400, 3400),
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
      onUpdate: () => {
        villager.setFlipX(villager.x < villager._lastX);
        villager._lastX = villager.x;
      }
    });
    villager._lastX = villager.x;

    let stepFrame = false;
    this.time.addEvent({
      delay: 320,
      loop: true,
      callback: () => {
        stepFrame = !stepFrame;
        villager.setTexture(`${villagerKey}_${stepFrame ? "b" : "a"}`);
      }
    });

    const bubble = this.createSpeechBubble(
      project.worldX + 10,
      houseY - 66,
      `🏠 ${project.title}`
    );

    this.projectHouses.push({
      project,
      house,
      villager,
      bubble,
      x: project.worldX,
      y: houseY
    });
  }

  buildDecorativeHouses(zone, zoneProjects, groundY) {
    const projectXs = zoneProjects.map((p) => p.worldX);
    const candidates = [];

    if (projectXs.length === 0) {
      candidates.push(zone.startX + (zone.endX - zone.startX) / 2);
    } else {
      candidates.push(zone.startX + 50);
      for (let i = 0; i < projectXs.length - 1; i++) {
        candidates.push((projectXs[i] + projectXs[i + 1]) / 2);
      }
      candidates.push(zone.endX - 50);
    }

    const MIN_GAP = 95;
    candidates
      .filter((x) => projectXs.every((px) => Math.abs(px - x) > MIN_GAP))
      .forEach((x, i) => {
        const key = `house_deco_${i % 3}`;
        const y = groundY - 26;
        const house = this.add.image(x, y, key);
        house.setScale(1.3);
        house.setDepth(house.y - 1);
        house.setAlpha(0.95);

        // Occasional chimney smoke puffs for ambient life on decorative
        // houses too, without making them interactable.
        if (Math.random() > 0.4) {
          this.time.addEvent({
            delay: Phaser.Math.Between(1400, 2600),
            loop: true,
            callback: () => {
              const puff = this.add.image(x + 14, y - 44, "smoke_puff");
              puff.setAlpha(0.5);
              puff.setScale(1.2);
              this.tweens.add({
                targets: puff,
                y: puff.y - 22,
                alpha: 0,
                scale: 2,
                duration: 1800,
                onComplete: () => puff.destroy()
              });
            }
          });
        }
      });
  }

  /**
   * Creates a hidden pixel-styled speech bubble (rounded box + tail, drawn
   * with Graphics — original artwork, sized to fit the given text) anchored
   * above a house/villager. Shown ambiently on proximity, no button needed.
   */
  createSpeechBubble(x, y, text) {
    const measurer = this.add.text(0, 0, text, {
      fontFamily: '"VT323"',
      fontSize: "15px"
    });
    const textWidth = measurer.width;
    measurer.destroy();

    const paddingX = 10;
    const boxW = Phaser.Math.Clamp(textWidth + paddingX * 2, 70, 230);
    const boxH = 34;

    const g = this.add.graphics();
    g.fillStyle(0xfbf6ea, 0.97);
    g.fillRoundedRect(-boxW / 2, -boxH, boxW, boxH, 5);
    g.lineStyle(2, PALETTE.ink, 1);
    g.strokeRoundedRect(-boxW / 2, -boxH, boxW, boxH, 5);
    g.fillStyle(0xfbf6ea, 0.97);
    g.fillTriangle(-6, 0, 6, 0, 0, 8);
    g.lineStyle(2, PALETTE.ink, 1);
    g.lineBetween(-6, 0, 0, 8);
    g.lineBetween(6, 0, 0, 8);

    const label = this.add
      .text(0, -boxH / 2, text, {
        fontFamily: '"VT323"',
        fontSize: "15px",
        color: "#4a3f35",
        align: "center",
        wordWrap: { width: boxW - paddingX * 2 }
      })
      .setOrigin(0.5);

    const container = this.add.container(x, y, [g, label]);
    container.setDepth(500);
    container.setVisible(false);
    return container;
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
    this.handleBirds();
    this.handleBubbles();
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

  handleBirds() {
    if (!this.birds) return;
    const worldWidth = this.meta.worldWidthPx;
    this.birds.forEach((bird) => {
      bird.x += bird.driftSpeed * bird.driftDir * (1 / 60);
      if (bird.driftDir > 0 && bird.x > worldWidth + 40) {
        bird.x = -40;
      } else if (bird.driftDir < 0 && bird.x < -40) {
        bird.x = worldWidth + 40;
      }
    });
  }

  handleBubbles() {
    this.projectHouses.forEach((entry) => {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, entry.x, entry.y);
      entry.bubble.setVisible(dist < BUBBLE_RADIUS);
    });
  }

  handleInteractionCheck() {
    let closest = null;
    let closestDist = INTERACT_RADIUS;

    this.projectHouses.forEach(({ house, x, y }) => {
      const data = house.getData("interactable");
      if (!data) return;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y);
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
      this.promptText.setText("PRESS E TO VIEW");
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
    if (entry.type === "project") {
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
