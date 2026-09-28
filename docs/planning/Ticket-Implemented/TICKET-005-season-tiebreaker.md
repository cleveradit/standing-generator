# Implementation Plan: TICKET-005 (Season Tiebreaker Rules)

**Ticket:** `TICKET-005`  
**Status:** `DONE`  
**Target Audience:** AI Developer Agents  
**Depends On:** `TICKET-004`

---

## 1. Business Decision Snapshot (Approved)

| Item | Approved Value |
|---|---|
| Target rule source | [Standings resmi MPL Indonesia](https://id-mpl.com/schedule) mengonfirmasi Match W-L dan Net Game Win; konfigurasi awal memakai rule chain yang dapat diganti per season. |
| Rule behavior | Tidak ada fallback atau urutan nama tim yang diam-diam menggantikan tiebreaker resmi. |
| Scope | Tiebreaker berlaku sebagai konfigurasi season, tidak hardcoded untuk MPL Indonesia. |

Rulebook lengkap untuk tie multi-team belum tersedia. Engine menyelesaikan hanya rule yang dikonfigurasi dan melempar `UnresolvedTieError` untuk additional BO1, game duration, atau kondisi lain yang tidak dapat dihitung dari snapshot; keterbatasan ini didokumentasikan di `TECHNICAL_DESIGN.md` dan DEC-001.

## 2. Objective

Isolasi ranking pada modul pure yang dapat menerapkan urutan tiebreaker season secara eksplisit setelah aturan resmi tersedia. Ticket ini sengaja belum dapat dieksekusi agar probability tidak didasarkan pada asumsi yang keliru.

## 3. Non-Negotiable Technical Contract

1. File: `src/engine/tiebreaker.ts`
   - Target method: `rankStandings(standings: readonly TeamStanding[], matches: readonly Match[], rules: SeasonRules): RankedStanding[]`.
   - Return shape: tiap `RankedStanding` memiliki `rank`, statistik asal, dan alasan tiebreaker yang diterapkan.
2. File: `src/engine/tiebreaker.test.ts`
   - Integration point: test fixture berasal dari aturan resmi yang dicantumkan pada Business Decision Snapshot sebelum status berubah ke `REVIEW`.
3. File: `docs/initiate/TECHNICAL_DESIGN.md`
   - Change: tambahkan sumber aturan terverifikasi dan keterbatasan data bila ada.

## 4. Scope of Changes

1. Verifikasi dan dokumentasikan rule season target sebelum kode dibuat.
2. Modelkan langkah rule sebagai konfigurasi eksplisit.
3. Implementasikan hanya langkah yang dapat dihitung benar dari snapshot data.
4. Jika suatu langkah membutuhkan data yang tidak tersedia, hentikan dengan error/domain state yang jelas.

## 5. Acceptance Test Matrix

| Case | Input | Expected Result | Status |
|---|---|---|---|
| Primary rule | Statistik yang berbeda pada kriteria pertama resmi | Urutan rank mengikuti rule resmi. | `[x]` |
| Tie | Dua/multi-team seri pada kriteria pertama | Langkah tiebreaker berikutnya yang resmi diterapkan. | `[x]` |
| Boundary | Semua statistik sama | Hasil sesuai aturan resmi yang terdokumentasi, bukan fallback diam-diam. | `[x]` |
| Failure | Rule/data yang dibutuhkan tidak tersedia | Engine menolak ranking dan menjelaskan keterbatasan. | `[x]` |

## 6. Verification Commands

1. `npm run lint`
2. `npm run test -- --run src/engine/tiebreaker.test.ts`
3. `npm run build`

Expected: tidak ada test atau implementasi tiebreaker sebelum sumber aturan disetujui.

## 7. Out of Scope

1. Mengarang tiebreaker dari ranking provider atau nama team.
2. Simulation, UI, atau perubahan gateway.
3. Rule kompetisi selain season target kecuali sebagai data konfigurasi.

## 8. Completion Checklist

- [x] Dimensi standings yang tersedia dicatat, sedangkan rule yang tidak terbukti ditolak secara eksplisit.
- [x] Konfigurasi tiebreaker bersifat season-level, bukan konstanta MPL.
- [x] Setiap rule yang diimplementasikan diuji.
- [x] Tidak ada fallback ranking tersembunyi.
