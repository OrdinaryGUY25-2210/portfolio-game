import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || "portfolio-assets";

const hasCredentials = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = hasCredentials
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/**
 * Resolve a relative asset path (e.g. "web-apps/aurora-dashboard.webp",
 * as stored in portfolioData.json) into a full public Supabase Storage URL.
 *
 * Falls back to null when Supabase isn't configured or the path is empty,
 * so callers can show a procedurally-drawn placeholder instead of a broken image.
 */
export function getAssetUrl(relativePath) {
  if (!relativePath) return null;

  if (!hasCredentials) {
    console.warn(
      "[supabaseClient] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — " +
        "falling back to placeholder art. See README.md Supabase setup section."
    );
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(relativePath);
  return data?.publicUrl ?? null;
}

/**
 * Optional: log a lightweight, anonymous "visit" row so you can see which
 * zones/projects get explored most. This is entirely optional — the app
 * works fully offline/without this table. See README.md step "Optional:
 * Visit Analytics Table" for the one-time Dashboard setup.
 */
export async function logVisit(eventName, payload = {}) {
  if (!supabase) return;
  try {
    await supabase.from("visits").insert({
      event_name: eventName,
      payload
    });
  } catch (err) {
    // Analytics failures should never break the game experience.
    console.debug("[supabaseClient] logVisit skipped:", err.message);
  }
}

// ---------------------------------------------------------------------------
// Hidden Admin Login (10-click copyright trigger) — Auth + allow-list check
// ---------------------------------------------------------------------------

/**
 * Verifies admin login in two steps:
 *  1. Authenticate the email/password against Supabase Auth (a real account
 *     must exist — created once via Dashboard > Authentication > Users).
 *  2. Confirm that email also appears in the `admins` allow-list table.
 *     This means simply having *any* Supabase Auth account isn't enough —
 *     the email must be explicitly registered as an admin, matching the
 *     "verifikasi... email terdaftar di Supabase" requirement.
 *
 * On any failure, the session (if one was created) is signed out again so
 * a valid-but-unauthorized account is never left half-logged-in.
 */
export async function verifyAdminLogin(email, password) {
  if (!supabase) {
    return { ok: false, error: "Supabase belum dikonfigurasi (cek .env)." };
  }

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password
  });

  if (authError || !authData?.user) {
    return { ok: false, error: authError?.message || "Login gagal." };
  }

  const { data: adminRow, error: adminError } = await supabase
    .from("admins")
    .select("email")
    .eq("email", authData.user.email)
    .maybeSingle();

  if (adminError || !adminRow) {
    await supabase.auth.signOut();
    return {
      ok: false,
      error: "Email ini terautentikasi tapi tidak terdaftar sebagai admin."
    };
  }

  return { ok: true, user: authData.user };
}

export async function getAdminSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session ?? null;
}

export async function signOutAdmin() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

// ---------------------------------------------------------------------------
// CMS Content CRUD — Projects & Certificates
// ---------------------------------------------------------------------------

export async function fetchProjectRows() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("portfolio_projects")
    .select("*")
    .order("world_x", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchCertificateRows() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("portfolio_certificates")
    .select("*")
    .order("island_x", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function upsertProjectRow(row) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
  const { error } = await supabase.from("portfolio_projects").upsert(row);
  if (error) throw error;
}

export async function deleteProjectRow(id) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
  const { error } = await supabase.from("portfolio_projects").delete().eq("id", id);
  if (error) throw error;
}

export async function upsertCertificateRow(row) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
  const { error } = await supabase.from("portfolio_certificates").upsert(row);
  if (error) throw error;
}

export async function deleteCertificateRow(id) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
  const { error } = await supabase.from("portfolio_certificates").delete().eq("id", id);
  if (error) throw error;
}
