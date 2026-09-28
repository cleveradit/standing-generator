# Data Model Reference

**Status:** Live di Supabase lokal melalui migration `supabase/migrations/` dan fixture `supabase/seed.sql`.

## Ringkasan

Model V1 menyimpan entitas kompetisi yang dinormalisasi dari provider. Hasil pertandingan adalah sumber kebenaran untuk klasemen dan simulator; standing tidak disimpan sebagai tabel yang dapat menyimpang. Semua rule yang memengaruhi ranking dan playoff melekat pada season.

## Entitas

| Entitas | Tujuan | Kunci utama / unik |
|---|---|---|
| `games` | Katalog game esports | `id`; `slug` unik |
| `competitions` | Liga dalam suatu game | `id`; kombinasi provider dan `provider_id` unik |
| `seasons` | Iterasi kompetisi dan aturan yang dipakai engine | `id`; kombinasi competition dan `provider_id` unik |
| `teams` | Identitas tim lintas season | `id`; kombinasi provider dan `provider_id` unik |
| `season_teams` | Keikutsertaan tim pada season | `(season_id, team_id)` unik |
| `matches` | Hasil dan jadwal match regular season | `id`; kombinasi provider dan `provider_id` unik |
| `sync_logs` | Audit setiap percobaan sync | `id` |
| `private.provider_settings` | Referensi token provider yang terenkripsi Vault | Hanya RPC/service role |

## Kolom Terencana

### `games`

| Kolom | Bentuk | Catatan |
|---|---|---|
| `id` | UUID | Primary key internal |
| `name` | text | Contoh: Mobile Legends: Bang Bang |
| `slug` | text | Identifier stabil publik |

### `competitions`

| Kolom | Bentuk | Catatan |
|---|---|---|
| `id` | UUID | Primary key internal |
| `game_id` | UUID FK → `games.id` | Game pemilik kompetisi |
| `provider_id` | text | ID kompetisi di PandaScore |
| `name` | text | Nama kompetisi |
| `slug` | text | Identifier stabil publik |
| `region` | text | Wilayah kompetisi |

### `seasons`

| Kolom | Bentuk | Catatan |
|---|---|---|
| `id` | UUID | Primary key internal |
| `competition_id` | UUID FK → `competitions.id` | Pemilik season |
| `provider_id` | text | ID season di provider |
| `name` | text | Contoh: Season 18 |
| `status` | enum/text | `upcoming`, `active`, atau `completed` |
| `starts_at`, `ends_at` | timestamptz nullable | Rentang season bila tersedia |
| `rules` | JSONB | Konfigurasi engine terversi/tervalidasi untuk season |
| `last_synced_at` | timestamptz nullable | Waktu sync sukses terakhir season |

`rules` minimal harus dapat memuat `regularSeasonBestOf`, `playoffCutoff`, `upperBracketCutoff`, dan urutan tiebreaker. Bentuk finalnya diputuskan pada ticket desain schema setelah aturan resmi diverifikasi.

### `teams` dan `season_teams`

| Tabel | Kolom | Catatan |
|---|---|---|
| `teams` | `id`, `provider_id`, `name`, `acronym`, `logo_url` | Identitas team dari provider; logo URL harus diperlakukan sebagai data eksternal |
| `season_teams` | `season_id`, `team_id` | Relasi many-to-many dan dasar validasi participant match |

### `matches`

| Kolom | Bentuk | Catatan |
|---|---|---|
| `id` | UUID | Primary key internal |
| `provider_id` | text | Identifier idempoten PandaScore |
| `season_id` | UUID FK → `seasons.id` | Season pemilik match |
| `home_team_id`, `away_team_id` | UUID FK → `teams.id` | Participant match |
| `scheduled_at` | timestamptz nullable | Jadwal yang bisa berubah |
| `home_score`, `away_score` | integer nullable | Skor game pada match selesai |
| `status` | enum/text | `scheduled`, `running`, `finished`, `cancelled`, atau `postponed` |
| `best_of` | smallint | Format scoreline match; tidak selalu global BO3 |
| `updated_at` | timestamptz | Timestamp perubahan lokal/provider yang dinormalisasi |

Constraint detail harus mencegah sebuah team bermain melawan dirinya sendiri, score negatif, dan duplikasi `provider_id` dalam provider yang sama. Penanganan match yang bukan regular season menunggu verifikasi payload/provider; engine tidak boleh memasukkannya secara implisit.

### `sync_logs`

| Kolom | Bentuk | Catatan |
|---|---|---|
| `id` | UUID | Primary key |
| `provider` | text | Contoh: `pandascore` |
| `season_id` | UUID nullable FK → `seasons.id` | Season yang ditargetkan bila sudah teridentifikasi |
| `trigger` | enum/text | `scheduled` atau `manual` |
| `started_at`, `finished_at` | timestamptz | Mengukur durasi |
| `status` | enum/text | `running`, `success`, atau `failed`; ringkasan status terakhir dapat diturunkan |
| `records_created`, `records_updated` | integer | Ringkasan perubahan |
| `error_message` | text nullable | Pesan aman; tidak boleh memuat key/token atau payload sensitif |

## Data Turunan

| Data | Cara memperoleh | Tidak disimpan sebagai sumber kebenaran |
|---|---|---|
| Match win/loss | Agregasi `matches.status = finished` | Ya |
| Game win/loss dan game difference | Agregasi score match selesai | Ya |
| Peringkat | Standing + rule tiebreaker season | Ya |
| Upper bracket/playoff/eliminated probability | Output simulation terhadap match tersisa dan scenario lokal | Ya |
| Waktu pembaruan publik | `seasons.last_synced_at` atau sync sukses terbaru | Tidak perlu mengekspose log/internal detail |

## Akses dan RLS

| Principal | Hak data publik | Hak data privat/operasi |
|---|---|---|
| Anonymous/public user | `SELECT` pada season/teams/matches kompetisi publik yang diperlukan UI | Tidak ada `INSERT`, `UPDATE`, `DELETE`; tidak ada secret atau sync log admin |
| Authenticated non-admin | Sama dengan public kecuali kebutuhan produk berubah | Tidak ada operasi admin |
| Admin | Metadata admin melalui endpoint terproteksi | Tidak diberi jalan pintas client-side untuk secret; Edge Function tetap mengotorisasi tiap aksi |
| Edge Function/service role | Akses minimal untuk sync, log, dan provider setting | Tidak mengekspos hasil rahasia ke client |

RLS aktif pada seluruh tabel aplikasi. `admin_users`, `sync_logs`, dan schema `private` tidak dapat diakses anonymous/authenticated browser; Edge Function memakai service role untuk batas administrasi dan sync. Scheduler credential berada pada schema `private`, bukan public API.

## Terkait

[[architecture]], [[TECHNICAL_DESIGN]], [[IMPLEMENTATION_ROADMAP]]
