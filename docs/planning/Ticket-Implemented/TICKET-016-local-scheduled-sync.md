# Implementation Plan: TICKET-016 (Local Scheduled Synchronization)

**Ticket:** `TICKET-016`  
**Status:** `DONE`  
**Target Audience:** AI Developer Agents  
**Depends On:** `TICKET-012`, `TICKET-013`

---

## 1. Business Decision Snapshot (Approved)

| Item | Approved Value |
|---|---|
| Scheduler | Local PostgreSQL `pg_cron` invokes the local Edge Function through `pg_net`; it does not depend on a cloud scheduler. |
| Schedule | Friday through Sunday at 16:30 UTC, matching the approved PRD baseline. |
| Invocation authentication | Scheduler credentials/function endpoint are stored as private local secrets and accepted only by the scheduled invocation path. |
| Observability | Every automated attempt is recorded through the same sync log as a manual action. |

## 2. Objective

Make automatic refresh behavior executable and verifiable on the local stack. The scheduled path must use the same normalized, secret-safe synchronization service as an administrator's manual refresh.

## 3. Non-Negotiable Technical Contract

1. File: `supabase/migrations/20260921090500_schedule_pandascore_sync.sql`
   - Change: enable/configure local scheduling prerequisites, register one Friday–Sunday 16:30 UTC cron job, and persist only the private data required to invoke `sync-pandascore`.
2. File: `supabase/functions/sync-pandascore/index.ts`
   - Change: accept the existing authenticated-admin request and a private scheduler-authenticated request; both call `syncConfiguredPandaScoreSeason` exactly once.
3. File: `scripts/trigger-local-scheduled-sync.mjs`
   - Method signature: command invokes the locally configured scheduler path and exits non-zero when no corresponding sync-log row is recorded.
4. File: `docs/ai-context.md`
   - Change: document local scheduler startup, verification, log inspection, and how to pause it during development.

## 4. Scope of Changes

1. Determine the local Edge Function URL/key from local Supabase configuration, not a hosted deployment URL.
2. Make migration/reset idempotent so exactly one canonical schedule remains after repeated resets.
3. Add a deterministic test hook for the scheduler path rather than waiting for the wall-clock Friday–Sunday window.
4. Verify the scheduler never returns or logs the PandaScore token, authorization token, or full upstream response.

## 5. Acceptance Test Matrix

| Case | Input | Expected Result | Status |
|---|---|---|---|
| Registered schedule | Fresh reset | Exactly one cron expression targets Friday–Sunday 16:30 UTC. | `[x]` |
| Triggered path | Deterministic local scheduler trigger and HTTP fixture | One successful sync log is recorded through the shared service. | `[x]` |
| Manual path | Admin invokes the same function | Same service result shape and logging behavior are used. | `[x]` |
| Boundary | Repeated reset/migration | No duplicate cron job is present. | `[x]` |
| Failure | Scheduler secret invalid or provider fails | Failure is recorded safely; existing public snapshot remains intact. | `[x]` |

## 6. Verification Commands

1. `npm run supabase:reset`
2. `npm run scheduler:trigger-local`
3. `npx supabase db lint --local`

Expected: local schedule is registered once and its deterministic invocation is observable in `sync_logs`.

## 7. Out of Scope

1. Hosted cron jobs, GitHub Actions, or external task schedulers.
2. Changing the business schedule without a new approved decision.
3. Provider token administration UI.

## 8. Completion Checklist

- [x] Local cron and Edge Function integration are reproducible.
- [x] Manual and automated triggers share one sync service.
- [x] Duplicate schedules and failure paths are tested.
- [x] Verification commands succeed.
