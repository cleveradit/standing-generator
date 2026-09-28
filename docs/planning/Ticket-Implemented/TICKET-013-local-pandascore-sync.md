# Implementation Plan: TICKET-013 (Local PandaScore Synchronization)

**Ticket:** `TICKET-013`  
**Status:** `DONE`  
**Target Audience:** AI Developer Agents  
**Depends On:** `TICKET-010`, `TICKET-012`

---

## 1. Business Decision Snapshot (Approved)

| Item | Approved Value |
|---|---|
| Data source | PandaScore is called only from a trusted local Supabase Edge Function with a Vault-retrieved token. |
| Sync model | Manual and scheduled triggers invoke exactly the same synchronization service. |
| Write semantics | Provider IDs plus database upserts make rerunning a completed sync idempotent. |
| Failure policy | A failed provider request records a redacted sync log and keeps the last valid published snapshot intact. |

## 2. Objective

Replace the Vite development gateway with a durable local ingestion path that imports the configured PandaScore series into the local schema. The database becomes the public dashboard's data source, while provider credentials and raw failure details remain on the server side.

## 3. Non-Negotiable Technical Contract

1. File: `supabase/functions/_shared/pandascore.ts`
   - Method signature: `fetchPandaScoreSeasonSnapshot(apiToken: string, seriesId: string, regularSeasonTournamentId?: string): Promise<SeasonSnapshot>`.
   - Return shape: normalized application `SeasonSnapshot`; pagination is complete and provider errors are redacted.
2. File: `supabase/functions/_shared/season-sync.ts`
   - Method signature: `syncConfiguredPandaScoreSeason(client: SupabaseClient): Promise<{ syncLogId: string; seasonId: string; matchCount: number }>`.
   - Return shape: resolves only after transactional/idempotent upserts and a successful sync-log record; throws a redacted sync error on failure.
3. File: `supabase/functions/sync-pandascore/index.ts`
   - Method signature: `Deno.serve(async (request: Request): Promise<Response> => Response)`.
   - Return shape: authenticated-admin `POST` returns `{ syncLogId, seasonId, matchCount }`; scheduler calls use the same service and internal authorization described in TICKET-016.
4. File: `supabase/migrations/20260921090400_add_sync_function_support.sql`
   - Change: add only database helpers/constraints needed to retain sync state and deterministic upserts; do not create public write policies.

## 4. Scope of Changes

1. Move reusable PandaScore normalization from the Vite-only service into Edge Function shared code without changing its domain contract.
2. Read series and optional regular-season tournament identifiers from private provider settings, not browser request parameters.
3. Upsert games, competitions, seasons, teams, memberships, and matches; mark each sync outcome with timing and redacted failure status.
4. Test success, pagination, partial provider failure, rerun idempotency, and absence of credentials in returned errors.

## 5. Acceptance Test Matrix

| Case | Input | Expected Result | Status |
|---|---|---|---|
| Successful import | Valid configured token and recorded HTTP fixture | Domain tables contain normalized season/matches and one successful sync log. | `[x]` |
| Pagination | Fixture spans multiple API pages | All pages are imported exactly once. | `[x]` |
| Rerun | Run identical fixture twice | Entity counts remain stable; a new successful log records the later run. | `[x]` |
| Boundary | Series has zero matches | Sync succeeds with `matchCount: 0` and creates no malformed standings rows. | `[x]` |
| Failure | PandaScore 401/timeout | Sync returns a safe failure, logs no token, and leaves the prior published data unchanged. | `[x]` |

## 6. Verification Commands

1. `npm run supabase:reset`
2. `npx supabase functions serve sync-pandascore --env-file supabase/functions/.env`
3. `npm run test -- --run supabase/functions/_shared/pandascore supabase/functions/_shared/season-sync supabase/functions/sync-pandascore`

Expected: fixture-backed normalization, atomic persistence, idempotency, and redaction tests pass locally.

## 7. Out of Scope

1. Browser dashboard queries and UI migration.
2. Admin form and automatic scheduler wiring.
3. Live production imports or hosted Edge Function deployment.

## 8. Completion Checklist

- [x] PandaScore token is retrieved only through the trusted secret helper.
- [x] One shared service handles all sync triggers.
- [x] Database writes are idempotent and failure-safe.
- [x] Verification commands succeed.
