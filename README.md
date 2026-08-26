# Aldi Triantama — Pixel Portfolio Quest

Portfolio 2D side-scrolling bergaya pixel art, dibangun dengan **React + Phaser 3 (Canvas/WebGL)** untuk game world, dan **Supabase Storage** untuk hosting aset gambar (webp). Semua data proyek/sertifikat/link disimpan secara lokal di `src/data/portfolioData.json` — **tidak ada scraping otomatis**.

Panduan ini ditulis khusus supaya kamu **tidak perlu install apa pun di komputer**. Semua langkah Supabase dilakukan lewat **Supabase Dashboard (web)**, dan project bisa dijalankan/dideploy lewat editor cloud (StackBlitz / CodeSandbox / GitHub Codespaces) atau Vercel.

---

## 1. Struktur Proyek

```
portfolio-game/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── lib/
│   │   └── supabaseClient.js      # koneksi Supabase + resolver URL Storage
│   ├── data/
│   │   └── portfolioData.json     # <-- SATU-SATUNYA sumber data proyek/sertifikat/link
│   ├── components/
│   │   ├── QuestOverlay.jsx       # dialog "quest window" kertas retro
│   │   └── QuestOverlay.css
│   └── game/
│       ├── GameCanvas.jsx         # bridge React -> Phaser
│       ├── config/
│       │   ├── gameConfig.js
│       │   └── palette.js         # token warna pastel-muted
│       ├── scenes/
│       │   ├── BootScene.js       # generate pixel art prosedural (tanpa file gambar)
│       │   ├── StartScene.js      # layar judul + tombol PRESS START
│       │   ├── CharacterSelectScene.js
│       │   └── WorldScene.js      # world side-scrolling utama
│       └── systems/
│           ├── DayNightCycle.js   # siklus siang/malam real-time
│           └── SeasonCycle.js     # siklus 4 musim tiap beberapa hari nyata
```

**Catatan penting:** Karena environment build tidak selalu punya sprite pixel art buatan tangan, `BootScene.js` **menggambar semua sprite karakter/tile/ikon secara prosedural** memakai `Phaser.Graphics`, jadi project ini langsung jalan tanpa satupun file gambar di-commit. Untuk foto proyek, sertifikat, dan (opsional) sprite custom, gambar diambil dari **Supabase Storage** lewat `getAssetUrl()` — lihat bagian 3.

---

## 2. Cara Menjalankan Tanpa Install Lokal

Karena kamu tidak mau install apa pun secara lokal, ada tiga opsi — pilih salah satu:

### Opsi A — StackBlitz (paling cepat)
1. Buka https://stackblitz.com → **Create Project** → pilih **Import from GitHub** (setelah kamu upload folder ini ke repo GitHub lewat web, lihat Opsi C langkah 1–2) atau **Upload Folder** kalau tersedia di akun kamu.
2. StackBlitz otomatis `npm install` dan menjalankan `npm run dev` di cloud — semua di browser.
3. Tambahkan environment variable lewat panel "Environment Variables" di StackBlitz (isi sesuai `.env.example`).

### Opsi B — CodeSandbox
1. Buka https://codesandbox.io → **Import Project** → upload folder ini atau import dari GitHub repo.
2. CodeSandbox akan mendeteksi `package.json` (Vite) dan otomatis install + run.
3. Tambahkan `.env` lewat menu **Server Control Panel → Environment Variables**.

### Opsi C — Deploy langsung ke Vercel/Netlify (tanpa CLI, tanpa install)
1. Buat repo baru di https://github.com (lewat web, tombol "Add file → Upload files" — drag & drop seluruh folder `portfolio-game`).
2. Login ke https://vercel.com (atau https://netlify.com) → **Add New Project** → **Import Git Repository** → pilih repo tadi.
3. Vercel otomatis mendeteksi Vite. Build command: `npm run build`, Output: `dist`.
4. Di step "Environment Variables" Vercel, masukkan `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_BUCKET` (nilainya dari langkah Supabase di bawah).
5. Klik **Deploy**. Semua proses build terjadi di server Vercel, bukan di komputermu.

---

## 3. Setup Supabase — 100% Lewat Dashboard Web (Tanpa CLI)

Buka https://supabase.com/dashboard di browser. Semua langkah di bawah dilakukan lewat klik-klik UI, tidak ada terminal.

### 3.1 Buat Project
1. Klik **New Project**.
2. Isi nama project (mis. `pixel-portfolio`), buat password database (simpan baik-baik), pilih region terdekat (mis. Singapore untuk Indonesia).
3. Klik **Create new project** dan tunggu provisioning selesai (~2 menit).

### 3.2 Ambil API Keys
1. Di sidebar kiri, buka **Project Settings → API**.
2. Salin **Project URL** → ini nilai `VITE_SUPABASE_URL`.
3. Salin **anon public key** (bukan `service_role`!) → ini nilai `VITE_SUPABASE_ANON_KEY`.
4. Tempel keduanya ke file `.env` di project kamu (copy dari `.env.example`), atau ke Environment Variables di StackBlitz/CodeSandbox/Vercel.

### 3.3 Buat Storage Bucket untuk Aset Gambar
1. Di sidebar, buka **Storage**.
2. Klik **New bucket**. Nama: `portfolio-assets` (harus sama dengan `VITE_SUPABASE_BUCKET` di `.env`).
3. Aktifkan toggle **Public bucket** (supaya gambar bisa diakses langsung lewat URL publik tanpa login) → **Create bucket**.

### 3.4 Upload Gambar (WebP) Lewat Dashboard
1. Buka bucket `portfolio-assets` yang baru dibuat.
2. Klik **Create folder**, buat folder-folder berikut supaya path-nya cocok dengan `portfolioData.json`:
   - `web-apps/`
   - `interactive-apps/`
   - `other-designs/`
   - `certificates/`
3. Masuk ke tiap folder, klik **Upload file**, drag & drop file `.webp` kamu.
   - Contoh: upload `aurora-dashboard.webp` ke folder `web-apps/` supaya path lengkapnya jadi `web-apps/aurora-dashboard.webp` — persis seperti field `"image"` di `portfolioData.json`.
4. Ulangi untuk semua proyek dan sertifikat. Kalau kamu belum punya gambar untuk item tertentu, tidak apa — overlay quest akan otomatis menampilkan placeholder pixel-art sampai gambarnya diupload.

**Tips convert ke WebP tanpa install apa pun:** gunakan Squoosh (https://squoosh.app) — buka di browser, upload PNG/JPG, pilih format WebP, download. Semua di browser, tanpa software.

### 3.5 (Opsional tapi direkomendasikan) Set Policy Akses Publik untuk Objek
Kalau toggle "Public bucket" di 3.3 sudah aktif, ini biasanya sudah cukup. Untuk kontrol lebih rinci lewat SQL (masih di dashboard web, lewat **SQL Editor**, bukan CLI):

1. Buka **SQL Editor** di sidebar → **New query**.
2. Tempel query berikut lalu klik **Run**:

```sql
-- Izinkan siapa saja membaca (SELECT) objek di bucket portfolio-assets
create policy "Public read portfolio-assets"
on storage.objects for select
using ( bucket_id = 'portfolio-assets' );
```

### 3.6 Update `portfolioData.json`
File `src/data/portfolioData.json` sudah berisi path relatif contoh seperti `"image": "web-apps/aurora-dashboard.webp"`. Kamu tinggal:
1. Sesuaikan nama file dengan yang benar-benar kamu upload.
2. Isi/kosongkan field `"link"` sesuai kebutuhan — **kalau `"link"` string kosong `""`, tombol aksi eksternal otomatis disembunyikan** di overlay quest (lihat `QuestOverlay.jsx`, ini sudah diimplementasikan sesuai requirement).
3. Tidak perlu menulis URL Supabase penuh — kode secara otomatis menggabungkan `VITE_SUPABASE_URL` + bucket + path lewat `supabase.storage.from(bucket).getPublicUrl(path)`.

### 3.7 (Opsional) Tabel Analytics Kunjungan
Kalau mau mencatat zona/proyek mana yang paling sering dibuka pengunjung:

1. Buka **Table Editor** di dashboard → **New table**.
2. Nama tabel: `visits`. Tambahkan kolom:
   - `id` (int8, primary key, auto-increment) — sudah default ada.
   - `event_name` (text)
   - `payload` (jsonb)
   - `created_at` (timestamptz, default `now()`) — biasanya sudah otomatis ada.
3. Klik **Save**.
4. Buka **Authentication → Policies** (atau SQL Editor) dan jalankan:

```sql
alter table public.visits enable row level security;

create policy "Anyone can insert visit logs"
on public.visits for insert
with check (true);
```

Kode di `src/lib/supabaseClient.js` (`logVisit()`) sudah siap dipanggil dari mana pun jika kamu ingin mengaktifkan fitur ini — fitur ini opsional dan aplikasi tetap berjalan normal tanpanya.

### 3.8 (Opsional) World Epoch Bersama untuk Siklus Musim
Secara default, siklus 4 musim (`SeasonCycle.js`) dihitung dari `localStorage` browser masing-masing pengunjung (setiap orang mulai dari "hari pertama" mereka sendiri). Kalau kamu ingin musim yang **sama untuk semua pengunjung** berdasarkan tanggal kalender nyata:

1. Buat tabel `world_state` lewat **Table Editor** dengan kolom `key` (text, primary key) dan `epoch_ms` (int8).
2. Insert satu baris: `key = 'launch'`, `epoch_ms = <timestamp saat portfolio pertama kali online>`.
3. Ganti `getEpoch()` di `SeasonCycle.js` supaya fetch nilai ini dari Supabase alih-alih `localStorage` (query sederhana: `supabase.from('world_state').select('epoch_ms').eq('key','launch').single()`).

---

## 4. Sistem Login Master Game (Admin CMS Tersembunyi)

Portfolio ini punya **panel manajemen konten tersembunyi**, supaya kamu bisa menambah/mengubah/menghapus proyek dan sertifikat tanpa edit kode atau redeploy.

### Cara mengaksesnya
1. Klik teks **"© 2026 Aldi Triantama"** di pojok bawah layar sebanyak **10 kali berturut-turut** (jeda antar klik maksimal 1.5 detik, supaya tidak ke-trigger tidak sengaja).
2. Setelah 10 klik, muncul form **Login Admin** (email + password).
3. Login memverifikasi dua lapis:
   - **Supabase Auth** — akun harus benar-benar ada dan password cocok.
   - **Allow-list tabel `admins`** — email itu juga harus terdaftar sebagai admin. Jadi punya akun Supabase Auth saja tidak cukup; emailnya harus eksplisit didaftarkan sebagai admin.
4. Setelah lolos, **panel manajemen konten** terbuka penuh: tab Proyek dan Sertifikat, masing-masing dengan daftar + form tambah/edit/hapus.
5. Setiap perubahan langsung tersimpan ke Supabase **dan** langsung dipush ke dunia game yang sedang berjalan (world di-refresh otomatis, tanpa reload halaman).

### Setup di Supabase Dashboard (tanpa CLI)

**4.1 Buat akun admin**
1. Buka **Authentication → Users** di dashboard Supabase.
2. Klik **Add user → Create new user**.
3. Isi email dan password admin kamu, centang **Auto Confirm User** (supaya tidak perlu verifikasi email).
4. Klik **Create user**.

**4.2 Buat tabel allow-list `admins`**
1. Buka **Table Editor → New table**. Nama: `admins`.
2. Kolom: `email` (text, primary key).
3. Klik **Save**, lalu masukkan satu baris berisi email admin yang sama dengan langkah 4.1 (klik **Insert row**).
4. Aktifkan RLS dan buat policy lewat **SQL Editor**:

```sql
alter table public.admins enable row level security;

create policy "Authenticated users can read admin allow-list"
on public.admins for select
using ( auth.role() = 'authenticated' );
```

**4.3 Buat tabel konten `portfolio_projects`**
1. **Table Editor → New table**, nama `portfolio_projects`.
2. Kolom:
   - `id` (text, primary key)
   - `zone_id` (text)
   - `world_x` (int4)
   - `title` (text)
   - `description` (text)
   - `image` (text)
   - `link` (text)
   - `tags` (jsonb)
3. Simpan, lalu jalankan di **SQL Editor**:

```sql
alter table public.portfolio_projects enable row level security;

-- Pengunjung biasa (anon) boleh membaca daftar proyek untuk ditampilkan di game
create policy "Public can read projects"
on public.portfolio_projects for select
using (true);

-- Hanya user yang sudah login (admin) yang boleh menambah/ubah/hapus
create policy "Authenticated can manage projects"
on public.portfolio_projects for all
using ( auth.role() = 'authenticated' )
with check ( auth.role() = 'authenticated' );
```

**4.4 Buat tabel konten `portfolio_certificates`**
1. **Table Editor → New table**, nama `portfolio_certificates`.
2. Kolom:
   - `id` (text, primary key)
   - `island_x` (int4)
   - `title` (text)
   - `issuer` (text)
   - `date` (text)
   - `description` (text)
   - `image` (text)
   - `link` (text)
3. Simpan, lalu jalankan di **SQL Editor**:

```sql
alter table public.portfolio_certificates enable row level security;

create policy "Public can read certificates"
on public.portfolio_certificates for select
using (true);

create policy "Authenticated can manage certificates"
on public.portfolio_certificates for all
using ( auth.role() = 'authenticated' )
with check ( auth.role() = 'authenticated' );
```

### Cara kerjanya di kode
- `src/components/CopyrightFooter.jsx` — menghitung 10 klik dengan window reset 1.5 detik, lalu memanggil `onUnlock()`.
- `src/lib/supabaseClient.js` → `verifyAdminLogin()` — login Supabase Auth, lalu cek tabel `admins`; kalau tidak terdaftar, otomatis sign-out lagi.
- `src/components/AdminPanel.jsx` — CRUD penuh ke `portfolio_projects` / `portfolio_certificates`, lalu memanggil `refreshLiveWorld()` yang menulis ulang `game.registry` Phaser dan me-restart `WorldScene`.
- `src/lib/portfolioContent.js` → `loadPortfolioContent()` — dipanggil saat app pertama kali dibuka *dan* setiap kali admin menyimpan perubahan. Kalau tabel Supabase kosong/belum di-setup, otomatis fallback ke `portfolioData.json` lokal — game tidak akan pernah rusak karena tabel belum ada.

**Keamanan tambahan:** karena tombol trigger memakai teks copyright yang memang selalu ada di tampilan, tidak ada elemen UI baru yang bocor ke pengunjung biasa — form login hanya muncul setelah pola klik spesifik terpenuhi, dan akses tetap dibatasi lapisan Supabase Auth + allow-list di sisi server, bukan hanya disembunyikan di sisi client.

---

## 5. Menjalankan Secara Lokal (Opsional — Kalau Suatu Saat Berubah Pikiran)

```bash
npm install
cp .env.example .env   # lalu isi dengan kredensial Supabase kamu
npm run dev
```

Buka `http://localhost:5173`.

---

## 6. Kontrol Game

| Aksi | Tombol |
|---|---|
| Jalan kiri/kanan | ← → atau A / D |
| Lompat | ↑, W, atau Space |
| Interaksi (signpost kategori, NPC proyek, portal sertifikat) | E |
| Buka detail proyek dari daftar kategori | Klik baris proyek |
| Tutup layer overlay teratas / kembali ke layer sebelumnya | Esc atau tombol ✕ di pojok |

### Sistem Overlay Berlapis (Quest Window)

Setiap zona (Web Apps / Interactive Apps / Other Designs) punya **signpost kategori** di dekat pintu masuknya. Tekan **E** di depan signpost untuk membuka **menu daftar proyek** zona itu — jendela bergaya quest window RPG yang muncul cepat (transisi "snap-open" ala kotak dialog RPG, bukan fade generik).

Dari daftar itu, klik proyek mana pun untuk membuka **halaman detail** — jendela baru muncul di atas daftar (layered), sedikit bergeser supaya kelihatan jendela sebelumnya masih ada di belakang. Setiap jendela (daftar maupun detail) punya **tombol ✕ sendiri di pojok kanan atas**:
- Tutup jendela **detail** yang dibuka dari daftar → kembali ke daftar (layer di belakangnya tetap terbuka).
- Tutup jendela **daftar**, atau jendela **detail** yang dibuka langsung (lewat NPC proyek atau portal sertifikat, tanpa lewat daftar) → seluruh overlay tertutup, kembali menjelajah dunia.

NPC proyek individual dan portal sertifikat di pulau melayang tetap berfungsi seperti biasa — mendekat lalu tekan **E** langsung membuka halaman detail (tanpa lewat daftar), untuk pemain yang suka eksplorasi langsung. Semua overlay — daftar kategori, detail proyek, detail sertifikat — memakai chrome jendela dan tombol ✕ yang sama persis (`OverlayManager.jsx`), jadi perilakunya konsisten di seluruh dunia game.

## 7. Ringkasan Fitur vs Requirement

- **Start Screen**: `StartScene.js` — potret pixel dengan idle blink/wave, judul "Aldi Triantama - Portfolio", tombol "PRESS START".
- **Character Select**: `CharacterSelectScene.js`.
- **World & side-scrolling**: `WorldScene.js`, tiga zona (Web Apps / Interactive Apps / Other Designs) didefinisikan di `portfolioData.json`.
- **Floating islands + ladder/portal untuk sertifikat**: `buildCertificateIslands()` di `WorldScene.js`.
- **Day/Night cycle real-time**: `DayNightCycle.js` (overlay tint yang di-update tiap frame, siklus 3 menit — bisa diubah lewat `CYCLE_DURATION_MS`).
- **4-Season cycle tiap beberapa hari nyata**: `SeasonCycle.js` (default 3 hari/musim, lewat `SEASON_LENGTH_DAYS`).
- **Quest overlay saat mendekati proyek/sertifikat**: sistem berlapis di `OverlayManager.jsx` (+ `CategoryListView.jsx`, `DetailView.jsx`), dipicu event `quest:open` dari `WorldScene.triggerQuest()`. Signpost kategori per zona (`buildCategoryGates()`) membuka daftar proyek; NPC/portal individual membuka detail langsung. Setiap layer punya tombol ✕ sendiri.
- **Tombol link eksternal hanya muncul jika `link` ada di data**: lihat variabel `hasLink` di `QuestOverlay.jsx`.
- **Data lokal, tanpa scraping**: `src/data/portfolioData.json`.
- **Gambar via Supabase Storage (WebP)**: `getAssetUrl()` di `src/lib/supabaseClient.js`.
- **Login admin tersembunyi (10x klik copyright) + verifikasi email terdaftar di Supabase + CMS penuh**: `CopyrightFooter.jsx`, `AdminLoginModal.jsx`, `AdminPanel.jsx`, `verifyAdminLogin()` di `supabaseClient.js`.

---

## 8. Menambah Proyek/Sertifikat Baru

**Cara termudah (setelah setup Bagian 4):** buka panel admin (10x klik teks copyright → login), lalu tambah/edit langsung lewat form CMS. Tidak perlu sentuh kode atau redeploy.

**Cara manual (edit data lokal/fallback):** edit `src/data/portfolioData.json` — dipakai kalau tabel Supabase belum di-setup sama sekali:

```json
{
  "id": "proj-web-04",
  "zoneId": "web-apps",
  "worldX": 1950,
  "title": "Nama Proyek",
  "description": "Deskripsi singkat proyek.",
  "image": "web-apps/nama-file.webp",
  "link": "https://link-proyek-kamu.com",
  "tags": ["Tag1", "Tag2"]
}
```

Upload gambar `nama-file.webp` ke folder `web-apps/` di Supabase Storage (langkah 3.4), selesai.
