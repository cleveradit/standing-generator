# Dokumen Kebutuhan Produk
## Simulator Skenario Playoff Esports

**Status:** Draf V1  
**Kompetisi pertama:** MPL Indonesia  
**Game pertama:** Mobile Legends: Bang Bang  
**Sumber data utama:** PandaScore  
**Hosting frontend:** GitHub Pages  
**Backend dan basis data:** Supabase  
**Target biaya infrastruktur awal:** Gratis

---

# 1. Gambaran Produk

Simulator Skenario Playoff Esports adalah aplikasi web yang memungkinkan pengguna melihat kemungkinan posisi akhir setiap tim berdasarkan:

- klasemen saat ini;
- hasil pertandingan yang telah selesai;
- pertandingan yang masih tersisa;
- skenario hasil pertandingan yang ditentukan pengguna.

Pengguna dapat mencoba berbagai kemungkinan hasil pertandingan dan melihat perubahan peluang setiap tim untuk:

- mendapatkan upper bracket;
- lolos playoff;
- gagal lolos playoff.

Versi pertama aplikasi akan menggunakan **MPL Indonesia** sebagai kompetisi pertama.

Namun, struktur aplikasi tidak boleh dibuat khusus hanya untuk MPL Indonesia.

> MPL Indonesia adalah implementasi pertama, bukan batas arsitektur aplikasi.

Aplikasi harus dirancang agar pada masa mendatang dapat mendukung kompetisi, season, jumlah tim, format pertandingan, dan aturan playoff yang berbeda.

---

# 2. Permasalahan yang Ingin Diselesaikan

Menjelang akhir regular season, penggemar MPL sering ingin mengetahui hal-hal seperti:

- Berapa peluang RRQ masuk playoff?
- Apakah EVOS masih mungkin mendapatkan upper bracket?
- Apa yang terjadi jika suatu tim menang 2-0?
- Bagaimana jika pesaingnya kalah 1-2?
- Apakah suatu tim sudah dipastikan lolos?
- Apakah suatu tim secara matematis sudah tidak mungkin lolos?

Perhitungan tersebut menjadi rumit ketika masih terdapat banyak pertandingan karena setiap pertandingan mempunyai beberapa kemungkinan hasil.

Aplikasi ini bertujuan menghitung dan menampilkan berbagai kemungkinan tersebut secara otomatis.

---

# 3. Tujuan Produk

Versi pertama harus memungkinkan pengguna untuk:

1. Melihat klasemen season aktif.
2. Melihat pertandingan regular season yang belum selesai.
3. Menentukan hasil hipotetis pertandingan.
4. Melihat peluang setiap tim untuk mendapatkan upper bracket.
5. Melihat peluang setiap tim untuk lolos playoff.
6. Melihat peluang setiap tim untuk gagal lolos playoff.
7. Melihat perubahan probabilitas secara langsung ketika skenario diubah.
8. Mengembalikan seluruh skenario ke kondisi awal.
9. Mengetahui kapan data terakhir diperbarui.
10. Menggunakan aplikasi tanpa membuat akun.
11. Mengakses aplikasi melalui desktop maupun perangkat mobile.

Selain halaman publik, aplikasi mempunyai **panel admin privat** yang hanya dapat diakses oleh pemilik aplikasi.

Panel tersebut digunakan untuk:

- menjalankan sinkronisasi secara manual;
- melihat status sinkronisasi;
- melihat waktu sinkronisasi terakhir;
- melihat riwayat sinkronisasi;
- mengelola API key sumber data.

---

# 4. Hal yang Tidak Menjadi Target V1

Versi pertama tidak bertujuan untuk:

- memprediksi kekuatan sebenarnya sebuah tim;
- menggunakan machine learning;
- menggunakan statistik pemain sebagai dasar probabilitas;
- menggunakan performa historis sebagai bobot probabilitas;
- menggunakan betting odds;
- menyediakan live score realtime;
- menyediakan fantasy league;
- menyediakan akun untuk pengguna publik;
- menyediakan sistem multi-admin;
- melakukan simulasi utama di server;
- menyediakan aplikasi native Android atau iOS.

Probabilitas yang ditampilkan merupakan **probabilitas skenario**, bukan prediksi kekuatan tim.

---

# 5. Prinsip Dasar Probabilitas

Semua kemungkinan hasil pertandingan yang belum ditentukan pengguna dianggap mempunyai peluang yang sama.

Untuk pertandingan BO3, kemungkinan hasil adalah:

```text
2-0
2-1
1-2
0-2
```

Masing-masing dianggap memiliki probabilitas:

```text
25%
```

Dengan demikian:

```text
Tim A menang = 50%
Tim B menang = 50%
```

Tidak ada pembobotan berdasarkan:

- posisi klasemen;
- performa sebelumnya;
- head-to-head;
- statistik pemain;
- recent form;
- betting odds.

Antarmuka harus menjelaskan bahwa probabilitas merupakan hasil eksplorasi skenario dengan bobot yang sama, bukan prediksi tim mana yang lebih kuat.

---

# 6. Jenis Pengguna

Aplikasi mempunyai dua jenis pengguna.

## 6.1 Pengguna Publik

Tidak memerlukan login.

Pengguna publik dapat:

- melihat season;
- melihat klasemen;
- melihat jadwal;
- menggunakan simulator;
- mengubah skenario pertandingan secara lokal;
- melihat probabilitas;
- melihat waktu pembaruan data terakhir.

Pengguna publik tidak dapat mengubah data permanen.

## 6.2 Admin

Pada V1 hanya terdapat satu admin, yaitu pemilik aplikasi.

Admin harus login.

Admin dapat:

- melihat dashboard admin;
- menjalankan sinkronisasi manual;
- melihat status sinkronisasi;
- melihat riwayat sinkronisasi;
- melihat kesalahan sinkronisasi;
- mengganti API key PandaScore.

Tidak diperlukan fitur pendaftaran admin secara publik.

---

# 7. Alur Utama Pengguna Publik

```text
Pengguna membuka website
        ↓
Season aktif dimuat
        ↓
Klasemen ditampilkan
        ↓
Pertandingan tersisa ditampilkan
        ↓
Simulasi dijalankan
        ↓
Probabilitas ditampilkan
        ↓
Pengguna memilih hasil pertandingan
        ↓
Simulasi dijalankan ulang
        ↓
Probabilitas diperbarui
```

---

# 8. Halaman Utama

Versi pertama menggunakan satu halaman utama untuk simulator.

Struktur:

```text
Header
↓
Informasi season
↓
Hasil probabilitas
↓
Klasemen saat ini
↓
Simulator pertandingan tersisa
↓
Informasi pembaruan data
```

Antarmuka harus responsif untuk desktop maupun mobile.

---

# 9. Klasemen

Klasemen minimal menampilkan:

- peringkat;
- nama tim;
- jumlah kemenangan pertandingan;
- jumlah kekalahan pertandingan;
- kemenangan game;
- kekalahan game;
- game difference.

Contoh:

| Peringkat | Tim | Match | Game | Selisih |
|---|---|---|---|---|
| 1 | Team A | 9-1 | 18-5 | +13 |
| 2 | Team B | 8-2 | 17-5 | +12 |

Nama tim tidak boleh ditulis secara hardcoded pada frontend.

---

# 10. Sumber Kebenaran Klasemen

Basis data klasemen bukan sumber utama kebenaran.

Sumber utama adalah:

```text
hasil pertandingan
```

Klasemen dihitung berdasarkan seluruh pertandingan yang telah selesai.

Dengan demikian, data yang sama digunakan oleh:

- klasemen;
- simulation engine;
- perhitungan game difference;
- tiebreaker.

Hal ini mencegah perbedaan hasil antara klasemen dan simulator.

---

# 11. Pertandingan Tersisa

Seluruh pertandingan regular season yang belum selesai harus ditampilkan.

Pertandingan dikelompokkan berdasarkan tanggal.

Contoh:

```text
20 September

AE vs DEWA

[ ? ] [ 2-0 ] [ 2-1 ] [ 1-2 ] [ 0-2 ]
```

Nilai awal:

```text
?
```

berarti hasil pertandingan belum ditentukan oleh pengguna.

---

# 12. Penguncian Skenario

Setiap pertandingan mempunyai dua kondisi.

## Belum ditentukan

Simulation engine memilih salah satu kemungkinan skor menggunakan probabilitas yang sama.

## Dikunci

Simulation engine selalu menggunakan hasil yang dipilih pengguna.

Contoh:

```text
AE 2-0 DEWA
```

berarti seluruh iterasi simulasi harus menggunakan hasil tersebut.

Pengguna dapat memilih `?` untuk mengembalikan pertandingan ke kondisi belum ditentukan.

---

# 13. Reset Skenario

Harus tersedia tombol:

```text
Reset
```

Tombol tersebut:

- menghapus seluruh pilihan hasil pengguna;
- mengembalikan pertandingan menjadi belum ditentukan;
- menjalankan simulasi ulang.

Reset hanya memengaruhi state lokal pengguna.

Reset tidak boleh mengubah data pada Supabase.

---

# 14. Hasil Probabilitas

Untuk setiap tim ditampilkan minimal:

- Upper Bracket;
- Playoff;
- Tidak Lolos.

Untuk MPL Indonesia, aturan awal adalah:

```text
Upper Bracket = peringkat akhir 1-2
Playoff       = peringkat akhir 1-6
Tidak Lolos   = peringkat akhir 7-9
```

Nilai tersebut tidak boleh menjadi konstanta global.

Aturan harus berasal dari konfigurasi season.

Contoh:

```ts
playoffCutoff: 6
upperBracketCutoff: 2
```

---

# 15. Simulation Engine

Simulation engine dibuat menggunakan TypeScript murni dan dipisahkan dari React.

Struktur yang disarankan:

```text
src/
└── engine/
    ├── simulator.ts
    ├── standings.ts
    ├── tiebreaker.ts
    └── types.ts
```

Input:

```text
Season
Tim
Pertandingan selesai
Pertandingan tersisa
Aturan kompetisi
Hasil yang dikunci pengguna
```

Output:

```text
TeamSimulationResult[]
```

Contoh:

```ts
{
    teamId: "...",
    upperBracketProbability: 0.35,
    playoffProbability: 0.72,
    eliminatedProbability: 0.28
}
```

---

# 16. Metode Simulasi

V1 dapat menggunakan Monte Carlo.

Target awal:

```text
50.000 iterasi
```

Jumlah iterasi dapat disesuaikan berdasarkan performa perangkat.

Jika jumlah kemungkinan yang tersisa cukup kecil, implementasi pada masa mendatang dapat menggunakan exhaustive enumeration.

---

# 17. Web Worker

Perhitungan simulasi tidak boleh menyebabkan antarmuka terasa macet.

Jika diperlukan, simulasi dijalankan melalui Web Worker.

```text
React
  ↓
Web Worker
  ↓
Simulation Engine
  ↓
Hasil probabilitas
  ↓
React
```

Perubahan hasil pertandingan harus terasa responsif bagi pengguna.

---

# 18. Perhitungan Klasemen

Minimal data yang dihitung:

```text
Match Win
Match Loss
Game Win
Game Loss
Game Difference
```

Urutan klasemen kemudian ditentukan berdasarkan aturan season.

---

# 19. Tiebreaker

Logika tiebreaker harus berada pada modul tersendiri.

```text
tiebreaker.ts
```

Aturan tidak boleh tersebar di React component.

Contoh konfigurasi:

```ts
tiebreakers: [
    "match_win",
    "game_difference",
    "head_to_head"
]
```

Implementasi harus mengikuti aturan resmi kompetisi.

Jika aturan tertentu belum dapat dihitung dengan benar, aplikasi tidak boleh diam-diam menggantinya dengan asumsi lain.

Keterbatasan tersebut harus terdokumentasi.

---

# 20. Abstraksi Kompetisi

Aplikasi tidak boleh menganggap hal berikut sebagai aturan global:

```text
9 tim
6 tim playoff
2 tim upper bracket
BO3
MPL Indonesia
```

Setiap season mempunyai konfigurasi sendiri.

Contoh:

```ts
{
    game: "mobile-legends",
    competition: "mpl-id",
    season: "18",

    format: {
        regularSeasonBestOf: 3,
        playoffCutoff: 6,
        upperBracketCutoff: 2
    }
}
```

---

# 21. Dukungan Banyak Season

Model data harus mendukung:

```text
MPL Indonesia
├── Season 18
├── Season 19
└── Season 20
```

Status season:

```text
upcoming
active
completed
```

Halaman utama secara default membuka season aktif.

---

# 22. Pengembangan ke Kompetisi Lain

Arsitektur harus memungkinkan dukungan:

```text
Mobile Legends
├── MPL Indonesia
├── MPL Philippines
├── MPL Malaysia
└── kompetisi lainnya
```

selama sumber data menyediakan kompetisi tersebut dan aturan kompetisi dapat direpresentasikan oleh engine.

Dukungan kompetisi lain bukan syarat penyelesaian V1.

---

# 23. Sumber Data

Sumber data utama V1:

```text
PandaScore
```

Data yang diperlukan:

- kompetisi;
- season;
- tim;
- jadwal;
- pertandingan selesai;
- skor pertandingan;
- pertandingan mendatang.

Frontend tidak boleh mengakses PandaScore secara langsung.

---

# 24. Arsitektur Data

Alur data:

```text
PandaScore
     ↑
Supabase Edge Function
     ↓
Supabase PostgreSQL
     ↓
Frontend GitHub Pages
```

Simulation engine berjalan pada browser pengguna.

---

# 25. Sinkronisasi Otomatis

Data tidak perlu diperbarui terus-menerus.

Jadwal awal:

```text
Jumat  23:30 WIB
Sabtu  23:30 WIB
Minggu 23:30 WIB
```

WIB menggunakan UTC+7 sehingga ekuivalennya:

```text
16:30 UTC
```

Contoh cron:

```cron
30 16 * * 5,6,0
```

Jadwal harus mudah diubah tanpa mengubah simulation engine.

---

# 26. Strategi Sinkronisasi

Setiap sinkronisasi tidak hanya mengambil pertandingan pada hari tersebut.

Sinkronisasi harus memeriksa state relevan dari season aktif, termasuk:

- pertandingan selesai;
- skor;
- pertandingan mendatang;
- perubahan jadwal;
- pertandingan yang ditunda.

Data kemudian diperbarui menggunakan mekanisme idempotent seperti `upsert`.

Tujuannya agar sinkronisasi berikutnya dapat memperbaiki:

- skor yang sebelumnya belum tersedia;
- jadwal yang berubah;
- pertandingan yang ditunda;
- koreksi data dari provider.

---

# 27. Sinkronisasi Manual

Selain sinkronisasi otomatis, admin mempunyai tombol:

```text
Sinkronkan Sekarang
```

Alur:

```text
Admin
  ↓
Sinkronkan Sekarang
  ↓
Supabase Edge Function
  ↓
Validasi autentikasi
  ↓
Validasi hak admin
  ↓
PandaScore
  ↓
Upsert data
  ↓
Catat hasil sinkronisasi
```

Sinkronisasi manual dan otomatis harus menggunakan service/logika sinkronisasi yang sama.

Tidak boleh terdapat dua implementasi terpisah.

---

# 28. Status Sinkronisasi

Sistem minimal menyimpan:

```text
last_sync_attempt_at
last_successful_sync_at
sync_status
provider
```

Status minimal:

```text
idle
running
success
failed
```

Frontend publik hanya perlu menampilkan waktu pembaruan data terakhir yang berhasil.

Contoh:

```text
Data terakhir diperbarui:
20 September 2026, 23:30 WIB
```

---

# 29. Riwayat Sinkronisasi

Setiap percobaan sinkronisasi harus dicatat.

Contoh:

| Waktu | Status | Durasi | Perubahan |
|---|---|---:|---:|
| 20 Sep 23:30 | Berhasil | 1,4 dtk | 3 |
| 19 Sep 23:30 | Berhasil | 1,2 dtk | 2 |
| 18 Sep 23:30 | Gagal | 0,8 dtk | 0 |

Jika gagal, log dapat menyimpan informasi kesalahan yang aman.

Contoh:

```text
PandaScore mengembalikan HTTP 429.
```

API key atau secret tidak boleh dicatat pada log.

---

# 30. Panel Admin

Panel admin tersedia pada route:

```text
/admin
```

Halaman ini bersifat privat.

Contoh struktur:

```text
/admin
├── Login
├── Dashboard
└── Pengaturan
```

Dashboard minimal menampilkan:

```text
Status sumber data
Status sinkronisasi
Sinkronisasi terakhir
Sinkronisasi terakhir yang berhasil
Tombol Sinkronkan Sekarang
Riwayat sinkronisasi
```

---

# 31. Autentikasi Admin

Autentikasi menggunakan:

```text
Supabase Auth
```

V1 hanya membutuhkan satu admin.

Tidak diperlukan:

- registrasi publik;
- lupa password yang kompleks;
- role management;
- multi-admin management.

Akun admin dibuat secara manual.

Mengetahui URL `/admin` tidak memberikan akses kepada seseorang.

Semua operasi sensitif tetap harus diverifikasi pada server.

---

# 32. Otorisasi Admin

Autentikasi dan otorisasi adalah dua hal berbeda.

Edge Function tidak boleh hanya memeriksa apakah request berasal dari pengguna yang sudah login.

Function harus memastikan pengguna tersebut memang admin.

Konsep:

```text
Request
  ↓
JWT valid?
  ↓
User admin?
  ↓
Ya → lanjut
Tidak → 403
```

Keputusan otorisasi tidak boleh hanya dilakukan pada frontend.

---

# 33. Pengelolaan API Key

Panel admin menyediakan halaman pengaturan API key PandaScore.

Contoh:

```text
PandaScore

Status:
Terhubung

API Key:
••••••••••••••••••

Terakhir diperbarui:
20 September 2026

[ Ganti API Key ]
```

Admin dapat mengganti API key tanpa melakukan deployment ulang.

---

# 34. Keamanan API Key

API key tidak boleh:

- disimpan di repository;
- ditulis langsung pada source code;
- masuk ke bundle Vite;
- dikirim kembali ke frontend setelah disimpan;
- tersedia melalui endpoint publik;
- dicatat pada log.

Frontend hanya boleh mengetahui metadata seperti:

```text
configured: true
updatedAt: ...
```

Frontend tidak boleh mendapatkan nilai API key yang sebenarnya.

---

# 35. Penyimpanan Secret

API key yang dimasukkan melalui panel admin harus disimpan menggunakan mekanisme penyimpanan secret/enkripsi yang sesuai pada sisi server.

Jika penyimpanan dilakukan pada PostgreSQL, nilainya tidak boleh disimpan sebagai plaintext yang dapat dibaca oleh anonymous client.

Akses harus dibatasi hanya untuk server-side function yang membutuhkan secret tersebut.

Detail implementasi penyimpanan secret harus diputuskan pada dokumen desain teknis setelah kemampuan Supabase yang tersedia diverifikasi.

Prinsip utama:

> API key dapat diganti melalui panel admin, tetapi tidak dapat dibaca kembali oleh frontend.

---

# 36. Penggantian API Key

Alur:

```text
Admin
  ↓
Masukkan API key baru
  ↓
Protected Edge Function
  ↓
Validasi admin
  ↓
Validasi key ke PandaScore
  ↓
Jika valid
  ↓
Simpan secret
```

API key lama hanya diganti setelah API key baru berhasil divalidasi.

Frontend kemudian menerima:

```text
API key berhasil diperbarui.
```

bukan nilai key yang tersimpan.

---

# 37. Basis Data

Basis data menggunakan:

```text
Supabase PostgreSQL
```

Entitas awal:

```text
games
competitions
seasons
teams
season_teams
matches
sync_logs
```

Tabel atau mekanisme tambahan untuk konfigurasi privat dapat ditambahkan berdasarkan hasil desain teknis.

---

# 38. Model Data: Games

```text
id
name
slug
```

Contoh:

```text
Mobile Legends: Bang Bang
mobile-legends
```

---

# 39. Model Data: Competitions

```text
id
game_id
provider_id
name
slug
region
```

---

# 40. Model Data: Seasons

```text
id
competition_id
provider_id
name
status
starts_at
ends_at
rules
last_synced_at
```

`rules` dapat menggunakan JSONB jika sesuai.

---

# 41. Model Data: Teams

```text
id
provider_id
name
acronym
logo_url
```

---

# 42. Model Data: Season Teams

```text
season_id
team_id
```

---

# 43. Model Data: Matches

```text
id
provider_id
season_id
home_team_id
away_team_id
scheduled_at
home_score
away_score
status
best_of
updated_at
```

Status minimal:

```text
scheduled
running
finished
cancelled
postponed
```

---

# 44. Model Data: Sync Logs

```text
id
provider
season_id
trigger
started_at
finished_at
status
records_created
records_updated
error_message
```

`trigger` dapat berupa:

```text
scheduled
manual
```

Secret tidak boleh disimpan pada tabel ini.

---

# 45. Keamanan Supabase

Row Level Security harus diaktifkan.

Pengguna publik hanya mendapatkan akses baca terhadap data yang memang bersifat publik:

```text
games
competitions
seasons
teams
season_teams
matches
```

Pengguna publik tidak boleh melakukan perubahan data.

Operasi seperti:

- sinkronisasi;
- penggantian API key;
- pengelolaan konfigurasi privat;

hanya dapat dilakukan melalui backend yang terlindungi.

---

# 46. Stack Frontend

Frontend V1 menggunakan:

```text
React
TypeScript
Vite
Tailwind CSS
```

Library komponen seperti `shadcn/ui` bersifat opsional.

Jangan menambah dependency jika komponen sederhana dapat dibuat dengan mudah tanpa dependency tambahan.

---

# 47. Pengelolaan State

V1 tidak membutuhkan Redux.

Prioritaskan:

```text
useState
useMemo
useCallback
React Context jika diperlukan
```

State-management library hanya ditambahkan jika kebutuhan aplikasi memang berkembang.

---

# 48. Akses Data

Frontend membaca data publik dari Supabase.

Data season tidak berubah dengan frekuensi tinggi.

Library seperti TanStack Query bukan requirement V1 dan hanya digunakan jika memberikan manfaat nyata.

---

# 49. Hosting

Frontend di-host menggunakan:

```text
GitHub Pages
```

Build menggunakan:

```text
Vite
```

Deployment dilakukan melalui:

```text
GitHub Actions
```

Aplikasi tidak membutuhkan server Laravel, Node.js, atau PHP yang berjalan terus-menerus.

---

# 50. Struktur Repository

Struktur awal yang disarankan:

```text
/
├── docs/initiate
│   ├── PRD.md
│   ├── TECHNICAL_DESIGN.md
│   └── IMPLEMENTATION_PLAN.md
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── admin/
│   ├── engine/
│   ├── workers/
│   ├── services/
│   ├── hooks/
│   ├── types/
│   └── utils/
│
├── supabase/
│   ├── migrations/
│   └── functions/
│       ├── sync-pandascore/
│       └── provider-settings/
│
├── tests/
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── package.json
└── vite.config.ts
```

Struktur final diputuskan melalui desain teknis.

---

# 51. Pemisahan Tanggung Jawab

Logika harus dipisahkan menjadi:

```text
Antarmuka
    ↓
State aplikasi
    ↓
Simulation Engine
    ↓
Domain
```

Sedangkan data eksternal:

```text
PandaScore
    ↓
Provider
    ↓
Sinkronisasi
    ↓
Supabase
    ↓
Frontend
```

React component tidak boleh menjadi tempat perhitungan klasemen atau algoritma simulasi utama.

---

# 52. Performa

Target:

- perubahan skenario terasa cepat;
- halaman tetap responsif;
- simulasi tidak menyebabkan browser freeze;
- tetap dapat digunakan dengan nyaman pada mobile.

Web Worker digunakan jika diperlukan.

---

# 53. Reproduksibilitas Simulasi

Simulation engine sebaiknya mendukung random seed opsional.

Contoh:

```ts
simulate({
    iterations: 50000,
    seed: 12345
})
```

Hal ini berguna untuk automated testing dan debugging.

Seed tidak harus ditampilkan pada pengguna.

---

# 54. Pengujian

Prioritas automated test:

- perhitungan klasemen;
- match win/loss;
- game win/loss;
- game difference;
- tiebreaker;
- hasil pertandingan yang dikunci;
- hasil pertandingan yang belum ditentukan;
- agregasi probabilitas;
- cutoff playoff;
- cutoff upper bracket.

Core engine harus dapat diuji tanpa React dan browser.

---

# 55. Pengujian Sinkronisasi

Sinkronisasi harus diuji terhadap kondisi seperti:

- data baru;
- data yang sama;
- skor berubah;
- jadwal berubah;
- pertandingan ditunda;
- PandaScore gagal;
- PandaScore rate limited;
- response tidak lengkap;
- API key tidak valid.

Menjalankan sinkronisasi yang sama dua kali tidak boleh membuat data duplikat.

---

# 56. Penanganan Kesalahan

Jika Supabase gagal dimuat:

- tampilkan pesan kesalahan yang jelas;
- jangan menampilkan data palsu.

Jika sinkronisasi gagal:

- data lama tetap tersedia;
- data lama tidak dihapus;
- kegagalan dicatat;
- admin dapat mencoba sinkronisasi ulang.

Jika PandaScore memberikan data tidak lengkap:

- sistem tidak boleh menghapus data valid secara agresif.

---

# 57. Status Loading

Antarmuka harus mempunyai kondisi loading untuk:

- season;
- klasemen;
- pertandingan;
- simulasi;
- sinkronisasi manual.

Ketika simulasi dijalankan ulang, seluruh halaman tidak perlu menghilang.

---

# 58. Kondisi Data Kosong

Aplikasi harus menangani:

```text
Tidak ada season aktif
Tidak ada pertandingan tersisa
Season telah selesai
Data belum tersedia
Sinkronisasi belum pernah berhasil
```

Jika regular season telah selesai, klasemen akhir tetap dapat ditampilkan tanpa kontrol simulator.

---

# 59. Mobile

Mobile merupakan platform yang didukung secara penuh.

Tombol skor harus nyaman digunakan dengan sentuhan.

Tabel yang lebar harus mempunyai penanganan responsive atau horizontal scroll yang baik.

---

# 60. Aksesibilitas

Minimal:

- menggunakan semantic button;
- mendukung navigasi keyboard;
- mempunyai focus state;
- informasi tidak bergantung pada warna saja;
- tabel menggunakan markup semantik;
- kontras teks memadai.

---

# 61. Observability

Tidak diperlukan layanan monitoring berbayar pada V1.

Gunakan:

```text
sync_logs
Supabase Function Logs
GitHub Actions Logs
browser console selama development
```

Panel admin menjadi tempat utama untuk melihat kesehatan sinkronisasi.

---

# 62. Batasan Biaya

Target awal:

```text
$0/bulan
```

Layanan utama:

```text
GitHub Pages
GitHub Actions
Supabase Free
PandaScore free plan yang sesuai
```

Jangan memperkenalkan layanan berbayar pada V1 tanpa kebutuhan yang jelas.

---

# 63. Kriteria Selesai V1

V1 dianggap selesai jika:

- MPL Indonesia dapat digunakan sebagai kompetisi pertama;
- season aktif dapat dimuat;
- data pertandingan berasal dari hasil sinkronisasi;
- frontend tidak berisi data pertandingan hardcoded;
- klasemen dapat dihitung;
- pertandingan tersisa tampil;
- pengguna dapat memilih scoreline;
- pengguna dapat mengembalikan scoreline ke `?`;
- pengguna dapat reset seluruh skenario;
- simulasi berjalan;
- probabilitas Upper Bracket tampil;
- probabilitas Playoff tampil;
- probabilitas Tidak Lolos tampil;
- probabilitas berubah ketika skenario berubah;
- simulasi tidak menyebabkan UI freeze yang tidak wajar;
- waktu pembaruan data terakhir tampil;
- sinkronisasi otomatis berjalan Jumat–Minggu pukul 23:30 WIB;
- admin dapat login;
- pengguna publik tidak dapat membuka fungsi admin;
- admin dapat menjalankan sinkronisasi manual;
- admin dapat melihat status sinkronisasi;
- admin dapat melihat riwayat sinkronisasi;
- admin dapat mengganti API key PandaScore;
- API key tidak pernah dikirim kembali ke browser;
- API key tidak terdapat pada repository;
- pengguna publik hanya memiliki akses baca terhadap data publik;
- aplikasi dapat diakses melalui GitHub Pages;
- tampilan mobile dapat digunakan dengan baik;
- automated test core engine berhasil.

---

# 64. Tahapan Implementasi

## Tahap 1 — Fondasi

- inisialisasi React + TypeScript + Vite;
- konfigurasi Tailwind;
- konfigurasi testing;
- membuat struktur repository;
- mendefinisikan domain model.

## Tahap 2 — Simulation Engine

Implementasi:

```text
perhitungan klasemen
penerapan hasil pertandingan
ranking
tiebreaker
penguncian skenario
Monte Carlo
```

Gunakan mock data terlebih dahulu.

Tambahkan unit test.

## Tahap 3 — Antarmuka Publik

Implementasi:

```text
informasi season
tabel probabilitas
klasemen
remaining matches
pemilih scoreline
reset
loading state
responsive layout
```

## Tahap 4 — Supabase

Implementasi:

```text
schema database
migration
RLS
public read policy
Supabase client
```

Ganti mock data dengan data Supabase.

## Tahap 5 — PandaScore

Implementasi:

```text
provider PandaScore
Edge Function sinkronisasi
mapping season
mapping tim
mapping pertandingan
upsert
sync log
```

## Tahap 6 — Sinkronisasi Otomatis

Konfigurasi:

```text
Jumat 23:30 WIB
Sabtu 23:30 WIB
Minggu 23:30 WIB
```

Pastikan konversi timezone benar.

## Tahap 7 — Sistem Admin

Implementasi:

```text
Supabase Auth
login admin
protected route
otorisasi server-side
dashboard admin
manual sync
sync history
```

## Tahap 8 — Pengelolaan API Key

Implementasi:

```text
form penggantian API key
validasi key
penyimpanan secret
metadata konfigurasi
proteksi secret
```

Frontend tidak boleh dapat membaca API key yang telah tersimpan.

## Tahap 9 — Deployment

Implementasi:

```text
Vite production build
GitHub Actions
GitHub Pages
environment configuration
```

## Tahap 10 — Validasi

Validasi menggunakan data MPL sebenarnya:

```text
klasemen
jadwal
hasil pertandingan
tiebreaker
simulasi
sinkronisasi
manual sync
scheduled sync
admin authorization
API key security
mobile UX
```

---

# 65. Pengembangan Setelah V1

Fitur potensial berikutnya:

## Banyak Kompetisi

MPL Philippines, MPL Malaysia, dan kompetisi lainnya.

## Riwayat Season

Pengguna dapat membuka season lama.

## Bagikan Skenario

Pilihan pertandingan disimpan pada URL.

Contoh:

```text
/scenario?ae-dewa=2-0&rrq-evos=2-1
```

## Fokus Tim

Pengguna memilih satu tim dan aplikasi menyoroti pertandingan yang memengaruhi peluang tim tersebut.

## Skenario Lolos

Aplikasi menghasilkan informasi seperti:

```text
Team A lolos jika:
- Team A menang melawan Team B
- Team C kalah melawan Team D
```

## Exhaustive Enumeration

Jika jumlah kombinasi tersisa cukup kecil, engine beralih dari Monte Carlo menjadi perhitungan seluruh kemungkinan secara eksak.

## Weighted Simulation

Mode opsional berdasarkan:

- historical performance;
- Elo;
- win rate;
- statistik lainnya.

Mode ini harus dipisahkan secara jelas dari mode probabilitas skenario dengan bobot sama.

## PWA

Aplikasi dapat dipasang seperti aplikasi mobile.

---

# 66. Prinsip Pengembangan

Setiap keputusan teknis harus mempertimbangkan prinsip berikut:

1. Ketepatan perhitungan lebih penting daripada kompleksitas visual.
2. Asumsi probabilitas harus transparan.
3. Aturan kompetisi harus dapat dikonfigurasi.
4. Simulation engine harus terpisah dari UI.
5. Sumber data eksternal harus dapat diganti.
6. Secret tidak boleh sampai ke browser.
7. API key dapat diganti tanpa deployment.
8. Sinkronisasi manual dan otomatis menggunakan logika yang sama.
9. Infrastruktur gratis diprioritaskan selama masih memadai.
10. Mobile dan desktop sama-sama didukung.
11. Jangan melakukan over-engineering pada V1.
12. MPL Indonesia adalah implementasi pertama, bukan batas arsitektur.

---

# 67. Instruksi untuk Codex

Sebelum melakukan implementasi, Codex harus:

1. Membaca seluruh `docs/PRD.md`.
2. Memeriksa kondisi repository.
3. Tidak langsung mengimplementasikan seluruh aplikasi.
4. Mengidentifikasi requirement yang masih ambigu.
5. Mengidentifikasi asumsi teknis yang perlu diverifikasi.
6. Memastikan aturan kompetisi yang memengaruhi ketepatan perhitungan telah jelas.
7. Memastikan desain keamanan API key dapat dilakukan dengan layanan yang dipilih.

Setelah itu buat:

```text
docs/TECHNICAL_DESIGN.md
```

Dokumen tersebut minimal membahas:

- arsitektur aplikasi;
- arsitektur frontend;
- domain model;
- simulation engine;
- Web Worker;
- struktur basis data;
- RLS;
- autentikasi admin;
- otorisasi admin;
- penyimpanan secret;
- PandaScore provider;
- sinkronisasi manual;
- sinkronisasi otomatis;
- penanganan kegagalan sinkronisasi;
- GitHub Pages;
- GitHub Actions.

Kemudian buat:

```text
docs/IMPLEMENTATION_PLAN.md
```

yang membagi implementasi menjadi milestone kecil dan dapat diverifikasi secara independen.

Codex tidak boleh:

- mengarang aturan kompetisi yang belum diketahui;
- menyimpan PandaScore API key di frontend;
- menyimpan secret pada repository;
- membuat API key dapat dibaca kembali oleh browser;
- mengandalkan proteksi route frontend sebagai satu-satunya mekanisme keamanan admin;
- menambah layanan atau dependency besar tanpa alasan yang terdokumentasi;
- mengikat simulation engine secara khusus pada MPL Indonesia.

Jika ditemukan konflik antara kemudahan implementasi dan keamanan credential, keamanan credential harus diprioritaskan.