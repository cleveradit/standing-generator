# Roadmap Implementasi V1

**Status:** Inisiasi — bukan ticket dan tidak mengizinkan penulisan kode.

## Tujuan

Roadmap ini menerjemahkan tahapan pada PRD ke milestone kecil yang dapat diverifikasi secara independen. Saat pekerjaan akan dimulai, setiap milestone atau bagian yang disetujui harus terlebih dahulu menjadi ticket pada `docs/planning/`; tidak ada nomor ticket yang dialokasikan dalam dokumen ini.

## Scope Local-First Aktif

Tahap aktif memakai PandaScore secara live melalui gateway Vite lokal dengan token server-side. Supabase, GitHub Pages, scheduled sync, admin, dan storage secret runtime ditunda. Urutan ticket terinci ada di [`docs/planning/index.md`](../planning/index.md); milestone Supabase dan seterusnya tetap menjadi target masa depan, bukan scope ticket lokal.

## Urutan Milestone

| Urutan | Milestone | Hasil terverifikasi | Prasyarat / blocker |
|---:|---|---|---|
| 1 | Validasi desain eksternal | Aturan tiebreaker MPL season target, kontrak PandaScore, secret storage, dan scheduler terdokumentasi dengan sumbernya | Akses dokumentasi/akun yang relevan |
| 2 | Fondasi frontend | React/TypeScript/Vite/Tailwind, test runner, lint/build, dan struktur modul tersedia | Keputusan versi tooling |
| 3 | Domain & simulation engine | Standing, scoreline lock, ranking, tiebreaker terverifikasi, Monte Carlo seeded, dan unit test core engine | Milestone 1 untuk aturan tiebreaker |
| 4 | UI publik dengan fixture | Klasemen/probabilitas, grouped remaining matches, reset, loading/empty/error state, mobile/a11y dasar | Milestone 3 |
| 5 | Supabase data plane | Migration, constraint, RLS public read-only, dan pembaca data frontend; fixture diganti data database | Milestone 1 secret/RLS, milestone 4 |
| 6 | PandaScore sync | Provider adapter, normalisasi/upsert idempoten, dan safe `sync_logs` dengan test failure paths | Milestone 1 kontrak provider; milestone 5 |
| 7 | Scheduler | Scheduled sync Jumat–Minggu 23:30 WIB (16:30 UTC) memanggil service sync yang sama dan dapat diaudit | Milestone 1 scheduler; milestone 6 |
| 8 | Admin & credential management | Login/authorization server-side, manual sync, status/riwayat, dan rotasi API key write-only | Milestone 1 secret storage; milestone 6 |
| 9 | Deployment | GitHub Actions membangun dan deploy Vite ke GitHub Pages tanpa secret frontend | Milestone 2 dan konfigurasi environment |
| 10 | Validasi V1 | Uji data MPL nyata, sync, authorization, keamanan secret, simulasi, responsive/mobile, dan acceptance criteria PRD | Seluruh milestone sebelumnya |

## Gerbang Kualitas yang Berlaku untuk Setiap Ticket Mendatang

- Milestone tidak boleh dimulai sebelum dependensi dan blocker pada tabel teratasi atau scope-nya disesuaikan secara eksplisit.
- Perubahan engine wajib memuat test deterministik untuk boundary dan failure case.
- Perubahan database/sync wajib membuktikan idempotensi dan non-destructive failure handling.
- Perubahan admin/secret wajib menjelaskan jalur otorisasi server-side dan membuktikan API key tidak kembali ke browser/log/repository.
- UI publik wajib mempertahankan scenario di state lokal serta dapat digunakan lewat keyboard dan layar mobile.

## Di Luar Roadmap V1

Multi-competition UI, season history untuk pengguna, share scenario, team-focus analysis, exhaustive enumeration otomatis, weighted simulation, dan PWA tetap berada di luar V1 kecuali scope produk diubah secara eksplisit.

## Terkait

[[PRD]], [[TECHNICAL_DESIGN]], [[architecture]], [[data-model]]
