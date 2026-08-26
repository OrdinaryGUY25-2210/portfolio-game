import localData from "../data/portfolioData.json";
import { supabase } from "./supabaseClient.js";

/**
 * The world's structural layout (meta, zones, characters) always comes from
 * the local JSON config — per the architecture requirement, zone geometry
 * and world size are not something the CMS edits.
 *
 * Projects and certificates, however, are "content" in the CMS sense: if the
 * Supabase tables `portfolio_projects` / `portfolio_certificates` have rows,
 * those rows fully replace the local JSON's projects/certificates arrays.
 * If the tables are empty or unreachable (e.g. Supabase not configured yet),
 * this silently falls back to the bundled local JSON — the game always boots.
 */
export async function loadPortfolioContent() {
  const base = JSON.parse(JSON.stringify(localData));

  if (!supabase) return base;

  try {
    const [projectsRes, certsRes] = await Promise.all([
      supabase.from("portfolio_projects").select("*").order("world_x", { ascending: true }),
      supabase.from("portfolio_certificates").select("*").order("island_x", { ascending: true })
    ]);

    if (!projectsRes.error && projectsRes.data && projectsRes.data.length > 0) {
      base.projects = projectsRes.data.map(projectRowToLocal);
    }
    if (!certsRes.error && certsRes.data && certsRes.data.length > 0) {
      base.certificates = certsRes.data.map(certificateRowToLocal);
    }
  } catch (err) {
    console.warn("[portfolioContent] Falling back to local JSON:", err.message);
  }

  return base;
}

function projectRowToLocal(row) {
  return {
    id: row.id,
    zoneId: row.zone_id,
    worldX: row.world_x,
    title: row.title,
    description: row.description,
    image: row.image ?? "",
    link: row.link ?? "",
    tags: Array.isArray(row.tags) ? row.tags : []
  };
}

function certificateRowToLocal(row) {
  return {
    id: row.id,
    islandX: row.island_x,
    title: row.title,
    issuer: row.issuer,
    date: row.date ?? "",
    description: row.description,
    image: row.image ?? "",
    link: row.link ?? ""
  };
}

export function projectLocalToRow(project) {
  return {
    id: project.id,
    zone_id: project.zoneId,
    world_x: Number(project.worldX) || 0,
    title: project.title,
    description: project.description,
    image: project.image || "",
    link: project.link || "",
    tags: project.tags || []
  };
}

export function certificateLocalToRow(cert) {
  return {
    id: cert.id,
    island_x: Number(cert.islandX) || 0,
    title: cert.title,
    issuer: cert.issuer,
    date: cert.date || "",
    description: cert.description,
    image: cert.image || "",
    link: cert.link || ""
  };
}
