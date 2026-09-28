# Technical Design — V1 Baseline

**Status:** V1 local telah diimplementasikan dengan Supabase PostgreSQL/Auth/Edge Functions, admin, Vault token, scheduler, dan acceptance test. GitHub Pages tetap ditunda.

## 1. Ringkasan Keputusan

| Area | Keputusan awal | Status |
|---|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS; static deployment ke GitHub Pages | Terkunci oleh PRD |
| Domain simulator | TypeScript murni, tidak bergantung React/Supabase; Monte Carlo 50.000 iterasi dengan seed opsional | Terkunci oleh PRD |
| Data local aktif | Frontend membaca snapshot publik Supabase lokal; Edge Function memanggil PandaScore | Terkunci |
| Data persistence | Supabase dan service sync idempoten | Implemented local |
| Data model | Match adalah sumber kebenaran standing; rule ada pada season | Terkunci oleh PRD |
| Admin, credential runtime, scheduler | Supabase Auth/Edge Function dan schedule Jumat–Minggu 23:30 WIB / 16:30 UTC | Implemented local |

## 2. Arsitektur Aplikasi

```text
                              ┌─────────────────────────┐
                              │ PandaScore              │
                              └───────────┬─────────────┘
                                          │ server-side only
┌────────────────────┐          ┌────────▼─────────┐
│ scheduler / admin  │─────────▶│ Supabase Edge     │
│ manual trigger     │          │ Function          │
└────────────────────┘          │ - authorize       │
                                │ - provider sync   │
                                │ - settings        │
                                └────────┬──────────┘
                                         │ upsert/log
                                ┌────────▼──────────┐
                                │ Supabase Postgres │
                                │ + RLS             │
                                └────────┬──────────┘
                                         │ public read
                                ┌────────▼──────────┐
                                │ React on GitHub   │
                                │ Pages             │
                                └────────┬──────────┘
                                         │ structured input
                                ┌────────▼──────────┐
                                │ Browser engine    │
                                │ (worker optional) │
                                └───────────────────┘
```

Pada scope local-first, kotak Supabase dan trigger admin pada diagram adalah target arsitektur yang ditunda. Frontend memanggil endpoint lokal yang disediakan Vite; endpoint itu yang memanggil PandaScore dengan Bearer token. Frontend dapat mengoptimalkan tampilan, namun tidak menggandakan business rule. Semua rule yang menentukan posisi akhir berjalan dalam engine. Engine menerima snapshot data dan scenario lokal, sehingga dapat dites tanpa browser/database dan kelak dapat dipakai Worker tanpa percabangan perilaku.

## 3. Domain dan Simulation Engine

### Input minimal

| Input | Asal | Ketentuan |
|---|---|---|
| Season | Gateway Vite lokal | Menyediakan status dan `rules` untuk season aktif |
| Season teams | Snapshot PandaScore yang dinormalisasi | Memberi peserta valid untuk ranking |
| Finished matches | Snapshot PandaScore yang dinormalisasi | Satu-satunya dasar standing awal |
| Remaining regular-season matches | Snapshot PandaScore yang dinormalisasi | Hanya match eligible; `cancelled`/match non-regular tidak diikutkan tanpa aturan eksplisit |
| Scenario locks | State browser | Tidak dipersistenkan server pada V1 |
| Simulation options | UI/config | Iteration count dan seed opsional; tidak mengubah rule season |

### Kontrak konseptual

```ts
type Scoreline = { home: number; away: number };

type SimulationInput = {
  season: Season;
  teams: Team[];
  finishedMatches: Match[];
  remainingMatches: Match[];
  lockedResults: ReadonlyMap<string, Scoreline>;
  iterations: number;
  seed?: number;
};

type TeamSimulationResult = {
  teamId: string;
  upperBracketProbability: number;
  playoffProbability: number;
  eliminatedProbability: number;
};
```

Nama tipe dan signature final ditetapkan di ticket engine; kontrak di atas memisahkan input domain, scenario, dan output yang diwajibkan PRD. Validasi harus menolak scoreline yang tidak legal untuk `best_of`, match yang tidak punya participant valid, serta cutoff/urutan tiebreaker yang tidak dapat dinilai.

### Algoritme

1. Normalisasi finished match menjadi statistik `matchWin`, `matchLoss`, `gameWin`, `gameLoss`, dan `gameDifference`.
2. Untuk setiap iterasi, gunakan scoreline terkunci jika tersedia; untuk yang tidak terkunci pilih outcome legal dengan bobot sama.
3. Hitung ulang standing dari finished match ditambah outcome iterasi.
4. Urutkan dengan rule tiebreaker season yang sudah diimplementasikan secara eksplisit.
5. Tambahkan counter upper bracket bila rank ≤ `upperBracketCutoff`, playoff bila rank ≤ `playoffCutoff`, selain itu eliminated.
6. Bagi counter dengan jumlah iterasi dan validasi bahwa kategori membentuk probabilitas lengkap.

Untuk BO3, empat outcome `2-0`, `2-1`, `1-2`, `0-2` masing-masing berbobot 25%. Generalisasi outcome untuk format lain harus dirancang dari `best_of`, bukan mengasumsikan empat outcome untuk seluruh match.

### Tiebreaker

Format aturan diimplementasikan agar season dapat menyatakan urutan seperti `match_wins`, `game_difference`, dan `head_to_head`; data head-to-head dihitung hanya dari match finished antar tim yang sedang seri. Jika semua konfigurasi tersebut tidak memecahkan seri, engine mengeluarkan `UnresolvedTieError` dan UI tidak membuat probability palsu.

Halaman [standings resmi MPL Indonesia](https://id-mpl.com/schedule) mempublikasikan Match W-L dan Net Game Win, serta memperlihatkan urutan tie pada nilai awal yang sama. Ia menjadi dasar konfigurasi lokal awal bersama PRD, bukan pengganti rulebook lengkap. Additional BO1 dan game-duration tiebreaker belum bisa dihitung dari snapshot saat ini; kondisi tersebut harus menghasilkan error eksplisit, bukan ranking perkiraan.

### Worker dan performa

Mulai dari engine yang pure dan benchmark dengan dataset representatif di desktop serta mobile. Jika 50.000 iterasi menghambat interaksi, buat adapter Worker yang mengirim input serializable dan cancellation/version token agar hasil lama tidak menimpa scenario baru. Worker tidak mengubah algoritme; fallback main-thread harus memakai engine identik. Keputusan penggunaan Worker ditentukan lewat hasil benchmark, bukan asumsi.

## 4. Data dan Supabase

Skema awal terdiri dari `games`, `competitions`, `seasons`, `teams`, `season_teams`, `matches`, dan `sync_logs`; detail kolom dan data turunan ada di [data-model.md](../data-model.md). ID provider harus disimpan bersama provenance provider dan dijadikan dasar constraint/upsert agar sync berulang tidak membuat duplikasi.

`seasons.rules` dapat memakai JSONB untuk rules yang berbeda antarseason. Sebelum migration dibuat, ticket schema harus menentukan JSON schema/version, foreign key, unique index provider, validation score, penanda match regular season, dan strategi evolusi rule. Tanpa penanda yang dapat dipercaya, data playoff/exhibition tidak boleh masuk simulator secara default.

Standing, rank, dan probability adalah data turunan. Penyimpanannya sebagai cache hanya boleh dipertimbangkan setelah kebutuhan performa dibuktikan; cache tidak boleh menjadi sumber kebenaran baru.

## 5. RLS dan Akses Data

RLS aktif pada setiap tabel yang diekspos. Public/anonymous client hanya boleh `SELECT` data yang dibutuhkan halaman publik, dan tidak boleh mengubah data kompetisi. Sync log lengkap, admin membership, serta provider setting tidak dibaca public client.

Frontend boleh menggunakan Supabase Auth untuk memperoleh session login. Namun setiap mutasi sensitif dilakukan melalui Edge Function dengan urutan: validasi JWT → tentukan membership admin server-side → validasi input → jalankan aksi → kembalikan hasil yang aman. Route `/admin` hanya meningkatkan UX; kebocoran URL atau manipulasi UI tidak boleh memberi wewenang.

Model membership admin, policy rinci, dan penggunaan service role perlu ditentukan setelah model autentikasi yang disediakan proyek Supabase dipilih. Semua policy diuji dengan anonymous, authenticated non-admin, admin, dan Edge Function context.

## 6. Secret dan API Key PandaScore

API key harus bersifat write-only terhadap frontend. Flow rotasi:

```text
Admin submits new key
  → protected Edge Function verifies admin
  → validates new key against PandaScore
  → atomically replaces private stored value only on success
  → returns success metadata, never the key
```

Tidak ada key pada source repository, Vite variable yang ter-embed, tabel/log public, atau respons endpoint. UI hanya menerima `configured` dan `updatedAt` (setelah format persisnya dipilih).

**Perlu verifikasi:** pilih mechanism Supabase yang benar-benar tersedia untuk menyimpan secret yang dapat diubah runtime oleh admin dan hanya dibaca Edge Function. Jika primitive tersebut tidak memenuhi threat model, implementasi tidak boleh menyimpan plaintext dalam tabel yang dapat diakses client; revisi desain memerlukan keputusan terdokumentasi sebelum ticket credential dieksekusi.

## 7. Provider dan Sinkronisasi

Provider adapter memetakan response PandaScore ke entity internal dan menjaga provider payload di batas Edge Function. Sync selalu meninjau state relevan season aktif—hasil, skor, jadwal, penundaan—lalu upsert berdasarkan identity provider. Re-run payload yang sama harus no-op secara semantik selain audit log baru.

Manual sync dan scheduler harus memanggil fungsi/service orkestrasi yang sama. Perbedaan hanya pada nilai `trigger` (`manual` atau `scheduled`) dan mekanisme identitas panggilan. Setiap upaya mencatat mulai/selesai/status/durasi/jumlah perubahan/error aman pada `sync_logs`.

| Kondisi | Perilaku yang disyaratkan |
|---|---|
| Data/provider baru | Buat atau update entity melalui upsert terikat provider ID |
| Score atau jadwal berubah | Update record terkait; standing berikutnya memakai data terbaru |
| Payload tidak lengkap | Jangan agresif menghapus data valid lama |
| Provider gagal/429/key invalid | Tandai sync gagal, catat pesan aman, pertahankan data terakhir sukses |
| Sync dijalankan dua kali | Tidak ada duplikasi data |

**Perlu verifikasi:** endpoint, rate limit, bentuk status, field phase/season, dan kualitas identifier PandaScore untuk kompetisi/season MPL target. Adapter tidak boleh ditulis dari asumsi contoh payload.

## 8. Sinkronisasi Terjadwal

Kebutuhan waktu adalah Jumat, Sabtu, dan Minggu pukul 23:30 WIB (16:30 UTC); ekspresi cron target `30 16 * * 5,6,0`. Saat desain awal ini dibuat, mekanisme scheduler yang kompatibel dengan Supabase/free tier dan cara mengautentikasi invocation belum diverifikasi. Pilih satu mekanisme terverifikasi yang memanggil Edge Function/service yang sama dengan manual sync, mudah diubah konfigurasinya, dan tidak membuka endpoint admin untuk publik.

## 9. Frontend dan UX

Halaman publik adalah single-page simulator: header → informasi season → hasil probability → standing → grouped remaining matches → last successful update. Scenario disimpan lokal; reset menghapus seluruh lock lokal dan menjalankan simulasi ulang tanpa write ke Supabase.

UI harus memiliki loading/error/empty states untuk season, match, standings, dan simulation. Saat season selesai atau tidak ada match tersisa, standing akhir tetap ditampilkan dan kontrol scenario disesuaikan. Tabel dapat horizontal-scroll di layar kecil; scoreline selector berupa semantic button dengan label, keyboard/focus state, dan tidak hanya membedakan state dengan warna.

## 10. GitHub Pages dan GitHub Actions

Vite menghasilkan static assets yang dapat di-host GitHub Pages. Ticket deployment harus menetapkan base path repository, routing fallback untuk `/admin`, environment variable public yang memang aman, serta workflow build/deploy yang minimal. Credential PandaScore tidak menjadi GitHub Pages secret frontend dan tidak boleh diperlukan oleh build client.

Sebelum memilih strategi client-side route untuk `/admin`, verifikasi perilaku deep link GitHub Pages agar reload tidak menghasilkan halaman 404. Ini memengaruhi UX saja, bukan control keamanan.

## 11. Observability dan Batas Biaya

V1 memakai `sync_logs`, Supabase Function Logs, GitHub Actions Logs, dan browser console selama development. Tidak ada layanan monitoring berbayar tanpa kebutuhan eksplisit. Log hanya menyimpan metadata diagnosis yang aman, dengan redaction untuk header/token/key dan payload sensitif.

Target infrastruktur awal adalah $0/bulan. Beban simulation utama berada di browser pengguna; perubahan volume data, quota provider, atau scheduler harus dievaluasi sebelum menambah layanan.

## 12. Ambiguitas dan Gerbang Sebelum Ticket

| Pertanyaan | Dampak | Ticket yang tidak boleh berjalan sebelum terjawab |
|---|---|---|
| Season MPL Indonesia mana yang menjadi target pertama dan apakah provider menyediakannya? | Mapping provider dan fixture validasi | Sync provider, validasi V1 |
| Apa aturan tiebreaker resmi lengkap untuk regular season target, termasuk seri multi-team? | Ketepatan rank dan probability | Simulation engine |
| Bagaimana match phase regular season diidentifikasi dari PandaScore? | Mencegah playoff/exhibition ikut simulasi | Schema, sync provider |
| Primitive secret/runtime configuration apa yang tersedia di Supabase proyek? | Keamanan rotasi key | Admin settings |
| Scheduler apa yang tersedia pada free tier dan bagaimana mengamankan invocation-nya? | Scheduled sync yang benar dan aman | Scheduler |
| Tooling test/lint dan versi Node apa yang dipakai? | Reproduksibilitas development | Fondasi |

## 13. Out of Scope Desain V1

Tidak mencakup model prediksi kekuatan tim, weighted probability, betting odds, live score realtime, public account, multi-admin, server-side simulation utama, native mobile, ataupun kompetisi kedua. Exhaustive enumeration dapat dipertimbangkan nanti bila jumlah kombinasi kecil, tetapi tidak mengubah keputusan Monte Carlo V1.

## Terkait

[[PRD]], [[architecture]], [[data-model]], [[IMPLEMENTATION_ROADMAP]]
