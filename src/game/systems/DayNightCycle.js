import Phaser from "phaser";

/**
 * Simulates a "dynamic shader" day/night tint using a full-screen overlay
 * rectangle with additive/multiply blending, updated every frame from a
 * continuous real-time clock. This avoids requiring custom WebGL GLSL
 * pipelines (which Phaser supports too, via Phaser.Renderer.WebGL.Pipelines,
 * if you want to swap this for a true fragment shader later) while still
 * producing a smooth, camera-independent lighting sweep.
 *
 * One full day/night cycle = CYCLE_DURATION_MS of real wall-clock time.
 * Default is 3 minutes so visitors actually get to see it change.
 */
const CYCLE_DURATION_MS = 3 * 60 * 1000;

const KEYFRAMES = [
  // [t (0..1), color, alpha]
  { t: 0.0, color: 0x0c1030, alpha: 0.55 }, // deep night
  { t: 0.15, color: 0xcf9f8f, alpha: 0.35 }, // dawn
  { t: 0.3, color: 0xffffff, alpha: 0.0 }, // full day
  { t: 0.65, color: 0xffffff, alpha: 0.0 }, // full day (held)
  { t: 0.8, color: 0xcf9f8f, alpha: 0.4 }, // dusk
  { t: 1.0, color: 0x0c1030, alpha: 0.55 } // deep night (wrap)
];

function lerpColor(a, b, t) {
  return Phaser.Display.Color.Interpolate.ColorWithColor(
    Phaser.Display.Color.ValueToColor(a),
    Phaser.Display.Color.ValueToColor(b),
    100,
    t * 100
  );
}

export default class DayNightCycle {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} startOffsetMs - lets a scene start already "mid-cycle"
   */
  constructor(scene, startOffsetMs = 0) {
    this.scene = scene;
    this.startTime = scene.time.now - startOffsetMs;

    const cam = scene.cameras.main;
    this.overlay = scene.add.rectangle(
      cam.width / 2,
      cam.height / 2,
      cam.width,
      cam.height,
      0x000000,
      0
    );
    this.overlay.setScrollFactor(0);
    this.overlay.setDepth(999);
    this.overlay.setBlendMode(Phaser.BlendModes.MULTIPLY);
  }

  getPhaseLabel(t) {
    if (t < 0.12 || t > 0.92) return "Night";
    if (t < 0.28) return "Dawn";
    if (t < 0.68) return "Day";
    if (t < 0.85) return "Dusk";
    return "Night";
  }

  update() {
    const elapsed = (this.scene.time.now - this.startTime) % CYCLE_DURATION_MS;
    const t = elapsed / CYCLE_DURATION_MS;

    let lower = KEYFRAMES[0];
    let upper = KEYFRAMES[KEYFRAMES.length - 1];
    for (let i = 0; i < KEYFRAMES.length - 1; i++) {
      if (t >= KEYFRAMES[i].t && t <= KEYFRAMES[i + 1].t) {
        lower = KEYFRAMES[i];
        upper = KEYFRAMES[i + 1];
        break;
      }
    }
    const span = upper.t - lower.t || 1;
    const localT = (t - lower.t) / span;

    const blended = lerpColor(lower.color, upper.color, localT);
    const alpha = Phaser.Math.Linear(lower.alpha, upper.alpha, localT);

    this.overlay.setFillStyle(
      Phaser.Display.Color.GetColor(blended.r, blended.g, blended.b),
      alpha
    );

    this.currentPhase = this.getPhaseLabel(t);
    return this.currentPhase;
  }

  resize(width, height) {
    this.overlay.setPosition(width / 2, height / 2);
    this.overlay.setSize(width, height);
  }
}
