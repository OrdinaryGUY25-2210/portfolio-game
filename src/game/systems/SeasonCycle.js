import { PALETTE } from "../config/palette.js";

const SEASONS = ["spring", "summer", "autumn", "winter"];
const SEASON_LENGTH_DAYS = 3; // each season lasts 3 real-world days
const STORAGE_KEY = "portfolio_world_epoch";

const SEASON_TINTS = {
  spring: PALETTE.seasonSpring,
  summer: PALETTE.seasonSummer,
  autumn: PALETTE.seasonAutumn,
  winter: PALETTE.seasonWinter
};

const PARTICLE_BY_SEASON = {
  spring: { color: 0xf3d9e6, speedY: [10, 30], label: "petals" },
  summer: { color: 0xf7e9a0, speedY: [-5, 5], label: "fireflies" },
  autumn: { color: 0xd3a97c, speedY: [15, 40], label: "leaves" },
  winter: { color: 0xffffff, speedY: [20, 45], label: "snow" }
};

/**
 * The "epoch" (first-ever visit timestamp) is written once to localStorage so
 * that the season is a genuine function of real calendar time across visits,
 * not just of the current session. If you'd rather have this be consistent
 * for *every* visitor (not per-browser), store/read this same epoch value in
 * a small Supabase table instead — see README "Optional: Shared World Epoch".
 */
function getEpoch() {
  let epoch = Number(window.localStorage.getItem(STORAGE_KEY));
  if (!epoch) {
    epoch = Date.now();
    window.localStorage.setItem(STORAGE_KEY, String(epoch));
  }
  return epoch;
}

export function getCurrentSeason() {
  const epoch = getEpoch();
  const daysElapsed = Math.floor((Date.now() - epoch) / (1000 * 60 * 60 * 24));
  const seasonIndex = Math.floor(daysElapsed / SEASON_LENGTH_DAYS) % SEASONS.length;
  return SEASONS[seasonIndex];
}

export function getSeasonTint(season = getCurrentSeason()) {
  return SEASON_TINTS[season];
}

export function getSeasonParticleConfig(season = getCurrentSeason()) {
  return PARTICLE_BY_SEASON[season];
}

export const SEASON_LIST = SEASONS;
