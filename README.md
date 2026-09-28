# Standing Generator

Simulator skenario playoff esports untuk mengeksplorasi peluang posisi akhir tim. V1 dimulai dengan MPL Indonesia untuk Mobile Legends: Bang Bang.

Probabilitas yang ditampilkan adalah probabilitas skenario berbobot sama, bukan prediksi kekuatan sebuah tim. Pengguna dapat mengunci atau mengosongkan scoreline pertandingan tersisa secara lokal dan melihat perubahan peluang upper bracket, playoff, serta eliminasi.

## Status

V1 dapat dijalankan serta diuji sepenuhnya di localhost dengan Supabase lokal: database/RLS, login admin, Vault token PandaScore, sync, scheduler, simulator publik, dan browser acceptance test. Deployment GitHub Pages tetap ditunda.

## Menjalankan lokal

1. Jalankan `npm install`.
2. Jalankan `npm run test:local:acceptance` untuk memverifikasi alur V1 memakai fixture lokal tanpa token live.
3. Untuk penggunaan interaktif atau sync PandaScore nyata, ikuti [panduan local testing](docs/LOCAL_TESTING.md).

Gunakan `npm run lint`, `npm run test -- --run`, dan `npm run build` untuk verifikasi lokal.

## Rujukan proyek

- [PRD](docs/initiate/PRD.md) — kebutuhan produk dan batas V1.
- [Technical Design](docs/initiate/TECHNICAL_DESIGN.md) — baseline arsitektur dan blocker yang harus diverifikasi.
- [Ticket archive](docs/planning/index.md) — rencana implementasi yang sudah diverifikasi.
- [Documentation Hub](docs/index.md) — mandat kerja, arsitektur, model data, dan workflow planning.

## Prinsip inti

- Hasil pertandingan adalah sumber kebenaran klasemen.
- Simulation engine TypeScript dipisahkan dari React dan aturan kompetisi dikonfigurasi per season.
- PandaScore hanya diakses server-side melalui Supabase Edge Function; token tidak pernah masuk bundle browser.
- API key tidak boleh berada di repository, bundle frontend, respons API, atau log.
- Supabase lokal, admin, scheduler, dan persistence sudah tersedia; hosted Supabase dan GitHub Pages masih di luar scope.

Pekerjaan implementasi hanya dimulai melalui ticket yang telah disetujui di `docs/planning/`.
