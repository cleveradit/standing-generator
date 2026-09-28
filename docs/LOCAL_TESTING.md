# Pengujian Local V1

## Prasyarat

Node.js 22, npm, dan Docker-compatible runtime harus tersedia. Tidak perlu akun Supabase hosted, GitHub Pages, atau token PandaScore live untuk acceptance test deterministik.

## Quick start

1. Jalankan `npm install`.
2. Untuk verifikasi otomatis, jalankan `npm run test:local:acceptance`.
3. Untuk melihat aplikasi sendiri, jalankan `npm run dev:local` lalu buka alamat yang ditampilkan Vite (biasanya `http://localhost:5173`).

Perintah acceptance menyalakan Supabase lokal, me-reset migration/seed, membuat admin test lokal, menjalankan Edge Functions dengan fixture PandaScore, menjalankan lint/unit/build/browser test, lalu memicu jalur scheduler lokal. Ia membuat `.env.local` berisi URL dan publishable key lokal; file ini di-ignore.

## Menjalankan aplikasi secara interaktif

Jalankan `npm run dev:local`. Perintah ini menyalakan stack bila belum hidup, menulis credential browser lokal yang aman ke `.env.local`, membuat akun fixture, menyalakan Edge Functions fixture, lalu menyalakan Vite.

Untuk login di `/admin`, gunakan:

- Email: `local-admin@example.test`
- Password: `local-admin-password`

Mode ini memakai data fixture lokal saja. Untuk PandaScore nyata, ikuti konfigurasi manual di bawah.

### Sync PandaScore nyata

1. Jalankan `npm run supabase:start` lalu `npm run supabase:status`.
2. Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` pada `.env.local` dari output status.
3. Salin `supabase/functions/.env.example` ke `supabase/functions/.env`, isi `PANDASCORE_SERIES_ID`, lalu jalankan `npx supabase functions serve --env-file supabase/functions/.env`.
4. Buat `.env.local.admin` yang di-ignore berisi `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `LOCAL_ADMIN_EMAIL`, dan `LOCAL_ADMIN_PASSWORD`; jalankan `npm run admin:create-local`.
5. Jalankan `npm run dev`, buka `/` untuk simulator atau `/admin` untuk panel admin.

`PANDASCORE_TEST_MODE=true` memakai fixture terekam khusus test. Untuk sync nyata, set ke `false`, isi series/tournament target, lalu masukkan API token melalui `/admin`; token tidak pernah diletakkan pada `.env.local` atau source.

## Diagnostik dan cleanup

| Kebutuhan | Perintah |
|---|---|
| Reset schema dan fixture | `npm run supabase:reset` |
| Cek endpoint/credential lokal | `npm run supabase:status` |
| Cek migration | `npx supabase db lint --local` |
| Memicu path scheduler sekarang | `npm run scheduler:trigger-local` |
| Menghentikan stack | `npm run supabase:stop` |

## Gotchas

- `npm run supabase:reset` menghapus data database lokal termasuk token Vault dan akun admin lokal.
- Scheduler canonical tetap terdaftar Jumat–Minggu pukul 16:30 UTC. Trigger manual ada agar jalur yang sama dapat diuji tanpa menunggu waktu tersebut.
- Jika rule tiebreaker season tidak dapat menyelesaikan scenario tertentu, simulator tetap fail-closed dan tidak menampilkan probability palsu.

## Terkait

[[local-runtime-admin]], [[architecture]], [[data-model]]
