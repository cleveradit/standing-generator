# Runtime Lokal, Admin, dan Sinkronisasi

**Status:** Live

## Ringkasan

Simulator publik membaca season aktif dari Supabase lokal melalui RLS read-only. `/admin` menggunakan Supabase Auth email/password untuk mengatur token PandaScore secara write-only dan menjalankan sync manual; Edge Function yang sama juga dipakai scheduler lokal.

## Quick Reference

| Area | Lokasi | Perilaku |
|---|---|---|
| Stack lokal | `supabase/config.toml` | Postgres, Auth, Studio, dan Edge Runtime berjalan pada localhost. |
| Schema/RLS | `supabase/migrations/` | Match adalah sumber kebenaran; anonymous hanya dapat membaca data season aktif. |
| Browser read-path | `src/services/supabase/season-snapshot.ts` | Mengubah row database menjadi `SeasonSnapshot` untuk engine murni. |
| Admin | `src/pages/AdminPage.tsx` | Login, status token, token write-only, dan sync manual. |
| Secret | `supabase/functions/provider-settings/index.ts` | Memvalidasi token lalu menyimpan di Supabase Vault; respons hanya metadata. |
| Sync | `supabase/functions/sync-pandascore/index.ts` | Menggunakan service idempoten untuk manual maupun scheduled trigger. |
| Acceptance | `scripts/test-local-stack.mjs` | Reset, provisioning, fixture sync, browser test, dan scheduler test. |

## Gotchas

- `VITE_SUPABASE_PUBLISHABLE_KEY` aman untuk browser, tetapi `SUPABASE_SERVICE_ROLE_KEY` hanya untuk `.env.local.admin` yang di-ignore dan Edge Function.
- `PANDASCORE_TEST_MODE=true` hanya untuk fixture deterministik lokal. Sync nyata selalu membaca token dari Vault melalui function server-side.
- Route guard `/admin` adalah UX saja; `requireAdmin` tetap memeriksa JWT dan tabel `admin_users` pada setiap mutasi sensitif.

## Terkait

[[LOCAL_TESTING]], [[architecture]], [[data-model]]
