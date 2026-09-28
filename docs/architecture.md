# Architecture Map

**Status:** V1 local telah diimplementasikan: Supabase lokal, admin, persistence, dan scheduler tersedia. GitHub Pages tetap ditunda.

## Ringkasan

Standing Generator memisahkan antarmuka publik, domain simulasi di browser, dan boundary provider server-side pada Supabase Edge Function. MPL Indonesia adalah konfigurasi/implementasi pertama; competition, season, format, dan tiebreaker tidak menjadi asumsi global.

## Batas Sistem

```text
PandaScore → Supabase Edge Function → Supabase PostgreSQL → React (GitHub Pages)
                                                          ↓
                                                   TypeScript simulation engine
```

| Area | Tanggung jawab | Tidak boleh dilakukan |
|---|---|---|
| React public app | Memuat snapshot Supabase publik, menampilkan klasemen/probabilitas, dan menyimpan pilihan scoreline secara lokal | Mengakses PandaScore, menyimpan token, atau menjadi tempat algoritma simulasi |
| Simulation engine | Menghitung standing, tiebreaker, dan probabilitas dari snapshot season/matches/scenario | Bergantung pada React, Supabase client, atau aturan MPL yang hardcoded |
| Web Worker | Menjalankan engine di luar main thread bila benchmark menunjukkan UI tersendat | Menjadi sumber kebenaran domain yang berbeda dari engine utama |
| Supabase/Edge Functions | Persistence, admin, Vault token, dan sync lokal | Mengembalikan token atau mengizinkan mutasi browser langsung |

## Modul Frontend yang Direncanakan

```text
src/
  components/  # komponen presentasional dan kontrol scoreline
  engine/      # TypeScript murni: types, standings, tiebreaker, simulator
  hooks/       # orchestration data/simulation di React
  pages/       # halaman publik dan admin
  services/    # client browser + client server PandaScore dan normalisasi snapshot
  types/       # DTO/UI types di luar domain engine bila dibutuhkan
  workers/     # adapter pesan Web Worker; opsional berdasarkan benchmark
```

`engine/` menerima bentuk domain normalisasi, bukan response PandaScore atau React state mentah. Adapter UI mengubah pilihan `?`/scoreline menjadi scenario engine. Adapter worker harus memakai engine yang sama seperti fallback main thread.

## Alur Kritis

### Simulasi publik

1. Frontend meminta snapshot season aktif dari endpoint Vite lokal yang allowlisted.
2. Engine menghitung klasemen saat ini dari match berstatus `finished`.
3. Match regular season yang belum selesai menjadi outcome bebas atau outcome terkunci oleh state lokal pengguna.
4. Engine menghitung outcome Monte Carlo dengan bobot sama dan mengembalikan probabilitas per team.
5. UI memperbarui hasil tanpa mengubah data provider atau state persisten.

### Target tertunda: sinkronisasi

1. Trigger manual atau scheduler memanggil satu Edge Function yang sama dengan konteks trigger berbeda.
2. Function memuat konfigurasi provider secara server-side, mengambil state season aktif, memvalidasi payload, dan melakukan upsert secara transaksional bila memungkinkan.
3. Setiap upaya menulis `sync_logs`; kegagalan mempertahankan data sukses terakhir dan hanya mencatat pesan aman.

### Target tertunda: operasi admin

1. Supabase Auth memverifikasi identitas pengguna.
2. Edge Function memverifikasi klaim/daftar admin server-side sebelum setiap operasi sensitif.
3. Endpoint pengaturan API key mengirim metadata, tidak pernah key yang tersimpan; key baru divalidasi ke PandaScore sebelum menggantikan key lama.

## Invariant Arsitektur

- Standing dan simulation memakai kumpulan match yang sama.
- Rules seperti `regularSeasonBestOf`, cutoff playoff/upper bracket, dan tiebreaker hidup pada season, bukan konstanta engine.
- Browser hanya memanggil gateway lokal yang allowlisted, tidak menerima token PandaScore.
- API key PandaScore berada hanya pada environment proses Vite lokal dan tidak tercetak di error/log.
- Ketika persistence diaktifkan nanti, RLS dan sync non-destruktif tetap menjadi invariant tambahan.

## Ketidakpastian yang Menghambat Desain Detail

| Topik | Mengapa penting | Kondisi sebelum implementasi |
|---|---|---|
| Tiebreaker MPL Indonesia season target | Mengubah ranking, cutoff, dan probabilitas | Verifikasi sumber aturan resmi dan dokumentasikan urutan serta data yang tersedia |
| Skema PandaScore | Mapping competition/season/match menentukan idempotensi | Ambil sample/kontrak provider dan uji terhadap season target |

Secret storage Supabase dan scheduler tetap perlu diverifikasi saat scope persistence dibuka, tetapi bukan blocker ticket local-first.

## Terkait

[[TECHNICAL_DESIGN]], [[data-model]], [[IMPLEMENTATION_ROADMAP]]
