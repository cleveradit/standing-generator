# Decision Log

Catat keputusan yang memenuhi minimal satu kriteria:
- Gotcha/trap teknis yang tidak bisa diturunkan dari membaca kode
- Trade-off bisnis dengan konsekuensi non-obvious
- Koreksi atas asumsi atau mandat yang sebelumnya salah

Jangan catat: cleanup code, perubahan UI minor, atau hal yang sudah terdokumentasi di `ai-context.md` sendiri. Entry yang SUPERSEDED harus dihapus, bukan dibiarkan.

Format per entry (4 field):

```markdown
## DEC-XXX — Judul singkat

**Decision:** Apa yang diputuskan.

**Why:** Kenapa — constraint, bug, atau asumsi yang salah.

**Impact:** Konsekuensi konkret yang tidak obvious dari kode.

**Tickets:** TICKET-XXX (opsional)
```

---

<!-- ISI DECISION LOG DI BAWAH INI -->

## DEC-001 — Tiebreaker lokal bersifat konfiguratif dan fail-closed

**Decision:** Konfigurasi lokal awal memakai `match_wins` → `game_difference` → `head_to_head`. Jika langkah itu tidak dapat menyelesaikan seri, engine mengembalikan `UnresolvedTieError`; ia tidak mengurutkan berdasarkan nama tim atau fallback tersembunyi.

**Why:** Halaman standings MPL Indonesia yang tersedia publik menunjukkan Match W-L, Net Game Win, dan urutan team yang memiliki nilai awal identik, tetapi rulebook season target yang mendeskripsikan seri multi-team, additional BO1, serta game duration belum tersedia untuk diverifikasi.

**Impact:** Probability tidak ditampilkan untuk scenario yang menghasilkan seri yang belum dapat diselesaikan. Rulebook season target dapat mengganti konfigurasi tanpa mengikat engine pada MPL Indonesia.

**Tickets:** TICKET-005

## DEC-002 — Token provider berada di Vault, scheduler credential berada di schema private

**Decision:** Token PandaScore yang dapat dirotasi admin disimpan melalui Supabase Vault dan dibaca hanya oleh RPC yang diberikan kepada `service_role`. Secret scheduler lokal disimpan pada tabel `private` ber-RLS untuk menghindari nilai terenkripsi Vault dipakai sebagai HTTP header.

**Why:** Vault menyimpan token provider dengan encryption at rest dan tepat untuk credential yang dibaca Edge Function. Header scheduler membutuhkan nilai plaintext yang konsisten; memakai representasi ciphertext Vault akan menghasilkan header HTTP tidak valid.

**Impact:** Tidak ada token provider atau scheduler di browser, public schema, log, maupun file versioned. Hanya Edge Function/service role dan database security-definer function yang dapat membaca nilai tersebut.

**Tickets:** TICKET-012, TICKET-016
