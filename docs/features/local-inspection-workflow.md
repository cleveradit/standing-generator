# Local Inspection Workflow

**Status:** Live

## Ringkasan

`npm run dev:local` menyiapkan mode pemeriksaan fixture tanpa langkah konfigurasi manual. Ia memastikan Supabase lokal berjalan, membuat credential browser lokal, menyiapkan admin fixture, lalu menjalankan Edge Functions dan Vite. Fixture sintetis menghasilkan probabilitas skenario yang dapat diperiksa tanpa mengklaim aturan tiebreaker MPL resmi.

## Quick Reference

| Kebutuhan | Cara |
|---|---|
| Menjalankan aplikasi fixture | `npm run dev:local` |
| Simulator publik | Buka URL Vite yang ditampilkan, biasanya `/` |
| Admin fixture | Buka `/admin` dengan `local-admin@example.test` / `local-admin-password` |
| Menampilkan hasil skenario | Kunci pilihan scoreline pertandingan Fixture C vs Fixture D |
| Menguji stack penuh | `npm run test:local:acceptance` |

## Gotchas

- Edge Function berjalan dengan `PANDASCORE_TEST_MODE=true` hanya dalam `dev:local`; token fixture tidak pernah menjadi token PandaScore nyata.
- Port Vite dapat berubah jika port default sudah digunakan. Gunakan URL yang tercetak pada terminal.
- Riwayat dashboard adalah metadata aman: token PandaScore tidak pernah menjadi bagian respons browser.

## Terkait

[[local-runtime-admin]], [[LOCAL_TESTING]], [[architecture]]
