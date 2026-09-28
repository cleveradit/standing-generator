# Feature Docs — Index

Daftar isi seluruh feature doc. Setiap doc mengikuti template lean: `Status` → `Ringkasan` → section relevan → `Gotchas` → `Terkait`. Bahasa Indonesia, istilah teknis tetap Inggris.

Untuk pemahaman menyeluruh, mulai dari [architecture.md](../architecture.md) dan [data-model.md](../data-model.md) lebih dulu.

<!-- ISI TABEL FEATURE DI BAWAH INI -->
<!-- Format:
| [nama-file](nama-file.md) | Deskripsi singkat (1 kalimat) | Key files: path/ke/file |
-->

| [local-runtime-admin](local-runtime-admin.md) | Runtime Supabase localhost, admin write-only, sync PandaScore, dan acceptance test. | `supabase/`, `src/pages/AdminPage.tsx`, `scripts/test-local-stack.mjs` |
| [local-inspection-workflow](local-inspection-workflow.md) | Satu perintah untuk menjalankan fixture dan memeriksa hasil publik/admin lokal. | `scripts/run-local-inspection.mjs`, `supabase/seed.sql` |

## Konvensi penulisan

- Tanpa emoji dekoratif di header; tanpa commit hash/branch di Status.
- Setiap klaim diverifikasi terhadap kode aktual. Hal yang tak terverifikasi tidak ditulis.
- Katalog (method/field/kolom) selalu berupa tabel.
- Cross-link antar-doc memakai `[[nama-file]]` di body.
