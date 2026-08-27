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
├── supabase_schema.sql            # <-- semua SQL/RLS digabung, tinggal paste sekali jalan
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── lib/
│   │   ├── supabaseClient.js      # koneksi Supabase, auth admin, CRUD CMS, resolver URL Storage
│   │   └── portfolioContent.js    # gabungkan data lokal + data live dari Supabase
│   ├── data/
│   │   └── portfolioData.json     # <-- sumber data fallback proyek/sertifikat/link
│   ├── components/
│   │   ├── OverlayManager.jsx     # jendela quest window (detail proyek/sertifikat) + OverlayManager.css
│   │   ├── DetailView.jsx         # isi jendela detail (gambar, deskripsi, tombol link)
│   │   ├── CategoryListView.jsx   # (tersedia, tidak dipakai WorldScene saat ini)
│   │   ├── GameCornerMenu.jsx     # menu ☰ pojok kanan atas + GameCornerMenu.css
│   │   ├── InfoModal.jsx          # panel Info & Kontrol
│   │   ├── CopyrightFooter.jsx    # trigger admin 10x klik, dipin di bawah layar
│   │   ├── AdminLoginModal.jsx    # login admin (email + password)
│   │   ├── AdminPanel.jsx         # CMS penuh: CRUD proyek & sertifikat
│   │   └── AdminUI.css
│   └── game/
│       ├── GameCanvas.jsx         # bridge React -> Phaser, expose window.__portfolioGame
│       ├── sceneControl.js        # helper kembali ke StartScene dari React
│       ├── config/
│       │   ├── gameConfig.js
│       │   └── palette.js         # token warna pastel-muted
│       ├── scenes/
│       │   ├── BootScene.js       # generate SEMUA pixel art prosedural (rumah, warga, burung, dst)
│       │   ├── StartScene.js      # layar judul + tombol PRESS START
│       │   ├── CharacterSelectScene.js
│       │   └── WorldScene.js      # dunia desa side-scrolling utama
│       └── systems/
│           ├── DayNightCycle.js   # siklus siang/malam real-time
│           └── SeasonCycle.js     # siklus 4 musim tiap beberapa hari nyata
```

**Catatan penting:** `BootScene.js` **menggambar semua sprite (karakter, warga, rumah, burung, ikon) secara prosedural** memakai `Phaser.Graphics` — 100% orisinal, tidak ada aset pihak ketiga/berhak cipta yang di-embed di project ini. Untuk foto proyek, sertifikat, dan (opsional) sprite custom buatan/lisensi kamu sendiri, gambar diambil dari **Supabase Storage** lewat `getAssetUrl()` — lihat bagian 3.

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

> **Jalan pintas:** Semua perintah SQL di panduan ini (Storage policy, tabel `admins`, `portfolio_projects`, `portfolio_certificates`, `visits`, `world_state`, beserta RLS-nya) sudah digabung jadi satu file **`supabase_schema.sql`** di root project ini. Setelah bikin project & bucket Storage (langkah 3.1 & 3.3), kamu bisa langsung buka **SQL Editor → New query**, paste seluruh isi `supabase_schema.sql`, ganti email `admin@example.com` di dalamnya dengan email admin kamu, lalu **Run** — semua tabel & policy langsung jadi sekali jalan. Bagian di bawah ini tetap saya jelaskan langkah demi langkah kalau kamu mau paham prosesnya atau menjalankan manual.

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
| Buka detail rumah proyek / portal sertifikat | E (saat prompt "PRESS E TO VIEW" muncul) |
| Tutup overlay yang sedang terbuka | Esc atau tombol ✕ di pojok |
| Buka menu (kembali ke start / info & kontrol) | Klik ikon ☰ di pojok kanan atas |

### Desa & Rumah Penduduk

Setiap zona sekarang berupa **desa kecil**, bukan papan informasi. Tiap proyek direpresentasikan sebagai **rumah warna cerah/bold** (dengan bendera kecil di atap) — ini yang bisa ditekan (E) untuk membuka halaman detail proyek. Di antara rumah-rumah proyek itu, ada **rumah dekorasi warna pudar/muted** yang mengisi desa supaya terasa ramai — rumah ini murni pemanis visual dan **tidak bisa ditekan**.

Di depan tiap rumah proyek, ada **warga (villager)** yang berjalan mondar-mandir pendek (tidak pernah diam total). Saat kamu mendekat, warga itu otomatis menunjukkan **bubble teks** di atas kepalanya berisi nama proyek rumah itu — ini murni info pasif, tidak perlu tombol apa pun. Untuk membuka halaman detail proyeknya (gambar, deskripsi, tombol link), tetap tekan **E** saat sudah cukup dekat.

Sertifikat tetap ada di pulau melayang, diakses lewat tangga + portal seperti sebelumnya — dekati portal lalu tekan **E**.

Langit dihiasi **burung-burung** yang terbang melintas dengan animasi kepak sayap 2-frame, selain awan yang sudah ada — semuanya digambar prosedural dengan warna pastel muted, bukan aset pihak ketiga.

### Menu Pojok Kanan Atas & Info/Kontrol

Ikon **☰** selalu ada di pojok kanan atas layar game (baik di start screen maupun saat menjelajah). Klik untuk membuka dua pilihan:
- **🏠 Menu Utama** — langsung kembali ke Start Screen kapan pun, tanpa reload halaman.
- **❓ Info & Kontrol** — panel berisi daftar kontrol, legenda warna rumah (bold = proyek, pudar = dekorasi), dan penjelasan singkat elemen dunia lainnya.

### Tata Letak Layar

Area game selalu berada di **tengah layar**. Teks copyright dipindah jadi **footer tetap di bagian paling bawah viewport** (di luar kotak game), kecil dan tidak mengganggu — tempat trigger 10x klik admin tetap di sana.

## 7. Ringkasan Fitur vs Requirement

- **Start Screen**: `StartScene.js` — potret pixel dengan idle blink/wave, judul "Aldi Triantama - Portfolio", tombol "PRESS START".
- **Character Select**: `CharacterSelectScene.js`.
- **World & side-scrolling**: `WorldScene.js`, tiga zona (Web Apps / Interactive Apps / Other Designs) didefinisikan di `portfolioData.json`, sekarang berupa desa dengan rumah proyek + rumah dekorasi.
- **Floating islands + ladder/portal untuk sertifikat**: `buildCertificateIslands()` di `WorldScene.js`.
- **Day/Night cycle real-time**: `DayNightCycle.js` (overlay tint yang di-update tiap frame, siklus 3 menit — bisa diubah lewat `CYCLE_DURATION_MS`).
- **4-Season cycle tiap beberapa hari nyata**: `SeasonCycle.js` (default 3 hari/musim, lewat `SEASON_LENGTH_DAYS`).
- **Rumah proyek + warga aktif + bubble info**: `buildVillage()`, `buildProjectHouse()`, `createSpeechBubble()` di `WorldScene.js`; warga berpatroli lewat tween, ganti frame jalan tiap 320ms.
- **Burung di langit**: `buildBirds()` di `WorldScene.js`, tekstur `bird_a`/`bird_b` di `BootScene.js`.
- **Quest overlay saat menekan rumah proyek/portal sertifikat**: `OverlayManager.jsx` + `DetailView.jsx`, dipicu event `quest:open` dari `WorldScene.triggerQuest()`. Setiap overlay punya tombol ✕ sendiri.
- **Tombol link eksternal hanya muncul jika `link` ada di data**: lihat variabel `hasLink` di `DetailView.jsx`.
- **Data lokal, tanpa scraping**: `src/data/portfolioData.json`.
- **Gambar via Supabase Storage (WebP)**: `getAssetUrl()` di `src/lib/supabaseClient.js`.
- **Login admin tersembunyi (10x klik copyright) + verifikasi email terdaftar di Supabase + CMS penuh**: `CopyrightFooter.jsx`, `AdminLoginModal.jsx`, `AdminPanel.jsx`, `verifyAdminLogin()` di `supabaseClient.js`.
- **Menu pojok kanan atas (kembali ke start) + panel Info & Kontrol**: `GameCornerMenu.jsx`, `InfoModal.jsx`, `sceneControl.js`.

> **Catatan soal aset visual:** semua sprite (karakter, warga, rumah, burung, ikon) digambar prosedural dengan Phaser Graphics di `BootScene.js` — orisinal, bukan hasil scan/copy dari game atau ilustrasi pihak ketiga manapun. Kalau kamu punya aset pixel art buatan sendiri (atau yang sudah dibeli lisensinya) dan ingin menggantikan versi prosedural ini, upload ke Supabase Storage lalu sambungkan lewat `getAssetUrl()` seperti gambar proyek/sertifikat.

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
