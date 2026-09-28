# AI Context & Development Mandates

All AI agents MUST read and follow these rules before proposing or implementing any changes.

> **Orientasi (paham project tanpa baca kode):** baca berurutan — [initiate/PRD.md](initiate/PRD.md) (sumber produk) → dokumen ini (mandat) → [initiate/TECHNICAL_DESIGN.md](initiate/TECHNICAL_DESIGN.md) (desain awal dan blocker) → [architecture.md](architecture.md) (peta modul) → [data-model.md](data-model.md) (struktur data) → [features/index.md](features/index.md) (detail fitur yang sudah shipped).

---

## 1. Tech Stack (STRICT — no deviations)

| Area | Ketetapan V1 |
|---|---|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Hosting frontend | GitHub Pages melalui GitHub Actions |
| Mode pengembangan saat ini | Local-first: Vite + Supabase PostgreSQL/Auth/Edge Functions di localhost |
| Data dan backend | Supabase lokal menyimpan snapshot normalisasi; PandaScore hanya dipanggil Edge Function server-side |
| Simulation engine | TypeScript murni, berjalan di browser; Web Worker bila pengukuran performa membutuhkannya |
| Provider data V1 | PandaScore, hanya diakses server-side |
| State frontend | `useState`, `useMemo`, `useCallback`, dan React Context bila benar-benar diperlukan |
| Infrastruktur | Prioritaskan free tier; dependency atau layanan baru memerlukan alasan terdokumentasi |

Baseline package/test runner dan runtime Supabase lokal telah terverifikasi melalui `npm run test:local:acceptance`.

---

## 2. Architecture Mandates

1. Klasemen selalu dihitung dari hasil pertandingan; tabel klasemen tidak menjadi sumber kebenaran terpisah.
2. Simulation engine, perhitungan klasemen, dan tiebreaker harus berada di TypeScript murni di luar React. React hanya mengelola UI dan state skenario lokal.
3. Semua aturan kompetisi bersifat konfigurasi season. Tidak ada konstanta global untuk MPL Indonesia, jumlah tim, BO3, cutoff playoff, upper bracket, atau tiebreaker.
4. Provider PandaScore berada di batas Edge Function server-side. Frontend membaca data publik Supabase; bundle browser tidak pernah memanggil PandaScore.
5. Manual dan scheduled sync harus masuk ke satu service sinkronisasi idempotent yang sama; keduanya mencatat `sync_logs`.
6. Token PandaScore hanya dibaca Edge Function dari Vault. Route guard frontend bukan mekanisme otorisasi; setiap mutasi memeriksa JWT dan membership admin server-side.
7. RLS wajib aktif. Client publik read-only untuk data kompetisi yang dipublikasikan; tidak ada akses langsung ke secret atau operasi tulis.

---

## 3. Rules

**Rule 1 — Probabilitas netral:** Outcome setiap pertandingan yang belum dikunci memiliki bobot yang sama. UI harus menyebut ini probabilitas skenario, bukan prediksi kekuatan tim.

**Rule 2 — Kontrak scoreline:** Scoreline yang didukung harus diturunkan dari `best_of` pertandingan/season. Hasil yang dikunci dipakai pada semua iterasi; `?` berarti tidak dikunci.

**Rule 3 — Tiebreaker eksplisit:** Implementasikan hanya aturan resmi yang sudah diverifikasi. Jangan mengganti aturan yang belum didukung dengan fallback diam-diam; tampilkan/dokumentasikan keterbatasannya.

**Rule 4 — Deterministik saat diuji:** Core engine menerima random seed opsional agar hasil test dan debugging reproduktif.

**Rule 5 — Kegagalan tidak merusak data:** Sync menggunakan upsert, menyimpan log aman tanpa secret, dan tidak menghapus data valid hanya karena respons provider tidak lengkap atau gagal.

**Rule 6 — Secret write-only:** API key tidak boleh masuk repository, environment frontend, bundle Vite, respons API, atau log. Penggantian key hanya dilakukan setelah key baru tervalidasi ke provider.

**Rule 7 — Mobile dan aksesibilitas:** Kontrol scoreline harus berupa semantic button, keyboard-accessible, memiliki focus state, dan nyaman disentuh. Informasi tidak boleh bergantung pada warna saja.

**Rule 8 — Validasi sebelum implementasi:** Sebelum ticket menyentuh tiebreaker, sync scheduler, atau secret storage, verifikasi aturan/kemampuan yang bersangkutan dan rekam batasannya di dokumentasi.

---

## 4. Local Development Environment

**Status awal:** belum ada aplikasi atau konfigurasi package di repository; belum ada perintah yang dapat dijalankan.

Prasyarat local V1: Node.js 22.x, npm, dan Docker-compatible runtime. Tidak perlu akun/proyek Supabase hosted. Gunakan `npm run test:local:acceptance` untuk fixture deterministik; konfigurasi sync nyata dijelaskan di [LOCAL_TESTING.md](LOCAL_TESTING.md).

| Keperluan | Perintah terverifikasi |
|---|---|
| Install dependency | `npm install` |
| Jalankan aplikasi lokal | `npm run dev` |
| Lint | `npm run lint` |
| Test | `npm run test -- --run` |
| Production build | `npm run build` |

---

## 5. Documentation Workflow

**Aturan 0 — Semua dokumentasi/konteks WAJIB di `docs/` (versioned di git), JANGAN di memory lokal AI.**
Developer berpindah-pindah PC, dan memory lokal AI tidak ikut di-commit sehingga tidak tersedia di mesin lain. Maka: keputusan, status ticket, hasil analisis, dan konteks apa pun yang perlu bertahan antar-sesi/antar-PC harus ditulis ke file `docs/` yang sesuai (planning, feature, decision-log, atau backlog) — bukan disimpan sebagai memory lokal. AI agent tidak boleh mengandalkan memory lokal sebagai sumber kebenaran untuk project ini.

Never write code without going through this flow first. Do not create `implementation_plan.md` as a standalone artifact — use the official planning files below.

Sebelum membuat backlog atau ticket, baca sumber produk di [`initiate/PRD.md`](initiate/PRD.md), lalu [`initiate/TECHNICAL_DESIGN.md`](initiate/TECHNICAL_DESIGN.md), [`architecture.md`](architecture.md), dan [`data-model.md`](data-model.md). Roadmap di `initiate/IMPLEMENTATION_ROADMAP.md` hanya memecah urutan delivery; ia bukan ticket dan tidak mengizinkan implementasi.

**Step 1 — Backlog (`docs/backlog.md`)**
New bugs/ideas go here without ticket numbers. Status: `READY` or `BLOCKED`. Remove the item once it becomes a planning ticket.

**Step 2 — Planning (`docs/planning/TICKET-NAME.md`)**
Create the plan before writing any code. Use `docs/planning/_template-implementation-plan.md`. Register in `docs/planning/index.md`. Get explicit user approval before executing.

Status lifecycle: `DRAFT` → `REVIEW` → `READY` → `DONE`.
- `DRAFT`: decisions not locked, execution blocked.
- `REVIEW`: decisions locked, waiting for user manual approval — do NOT execute.
- `READY`: user gave explicit written approval in chat — execution allowed.
- `DONE`: implementation and verification complete.

Each plan must include: Business Decision Snapshot, Non-Negotiable Technical Contract (target files, method signatures, integration points, return shapes), Acceptance Test Matrix (min. 1 boundary + 1 failure case), and Out of Scope section.

When a ticket is DONE: move its file to `docs/planning/Ticket-Implemented/`, remove its entry from `docs/planning/index.md` (do not delete the index file itself). Check both locations when numbering new tickets to avoid duplicates.

**Step 3 — Feature Docs (`docs/features/`)**
Every shipped feature needs a doc here, terdaftar di [`docs/features/index.md`](features/index.md). Pakai template lean: `# Judul` → `**Status:** Live` → `## Ringkasan` (2–4 kalimat) → section relevan (Quick Reference / katalog sebagai tabel) → `## Gotchas` (hanya hal non-obvious) → `## Terkait` ([[cross-link]]). Bahasa Indonesia, istilah teknis Inggris.

Aturan gaya (wajib): tanpa emoji dekoratif di header; tanpa commit hash/branch/tanggal di Status; tanpa prosa motivasi/marketing; katalog method/field/kolom selalu berupa tabel; setiap klaim diverifikasi ke kode aktual (yang tak terverifikasi tidak ditulis). Doc tingkat struktural (peta modul, referensi data) berada satu level di atas: `docs/architecture.md` dan `docs/data-model.md`.

**Step 4 — Decision Log (`docs/decision-log.md`)**
Catat keputusan yang memenuhi minimal satu kriteria:
- Gotcha/trap teknis yang tidak bisa diturunkan dari membaca kode
- Trade-off bisnis dengan konsekuensi non-obvious
- Koreksi atas asumsi atau mandat yang sebelumnya salah

Jangan catat: cleanup code, perubahan UI minor, atau hal yang sudah terdokumentasi di `ai-context.md` sendiri. Entry yang SUPERSEDED harus dihapus, bukan dibiarkan.

Format per entry (4 field):

```markdown
## DEC-XXX — Judul singkat

**Decision:** Apa yang diputuskan.

**Why:** Kenapa — constraint, bug, atau asumsi yang salah.

**Impact:** Konsekuensi konkret yang tidak obvious dari kode.

**Tickets:** TICKET-XXX (opsional)
```
