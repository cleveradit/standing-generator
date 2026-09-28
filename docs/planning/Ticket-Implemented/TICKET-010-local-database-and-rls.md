# Implementation Plan: TICKET-010 (Local Database Schema and RLS)

**Ticket:** `TICKET-010`  
**Status:** `DONE`  
**Target Audience:** AI Developer Agents  
**Depends On:** `TICKET-009`

---

## 1. Business Decision Snapshot (Approved)

| Item | Approved Value |
|---|---|
| Source of truth | Finished match records are the only source for standings and simulation inputs. |
| Schema delivery | Versioned SQL migrations in `supabase/migrations/`; `supabase db reset` recreates the full local schema. |
| Public access | Anonymous users have read-only access only to public game, competition, season, team, season-team, and match data. |
| Private access | Sync logs, admin metadata, and provider settings are not exposed through public RLS policies. |

## 2. Objective

Create a local PostgreSQL schema matching the V1 domain, with constraints and RLS that make the public simulator read-only and leave sensitive operational data server-side.

## 3. Non-Negotiable Technical Contract

1. File: `supabase/migrations/20260921090000_create_competition_schema.sql`
   - Change: create `games`, `competitions`, `seasons`, `teams`, `season_teams`, `matches`, and `sync_logs` with primary keys, provider identity uniqueness, foreign keys, status constraints, and timestamps.
2. File: `supabase/migrations/20260921090100_enable_rls.sql`
   - Change: enable RLS on every application table; add explicit anonymous `SELECT` policies only to public simulator tables.
3. File: `supabase/seed.sql`
   - Change: seed a non-secret local MPL-shaped fixture that permits browser and database acceptance tests without PandaScore credentials.
4. File: `src/types/database.ts`
   - Change: define the application-facing database row types used by the frontend adapter; do not duplicate provider raw payload types.

## 4. Scope of Changes

1. Store season format/rules as validated JSONB with playoff cutoff, upper-bracket cutoff, and tiebreaker chain.
2. Make `(provider, provider_id)` stable/upsertable for imported entities and match records.
3. Prevent negative scores, a team playing itself, and duplicate season-team membership.
4. Exercise RLS as anonymous and service contexts after reset.

## 5. Acceptance Test Matrix

| Case | Input | Expected Result | Status |
|---|---|---|---|
| Fresh schema | `npm run supabase:reset` | All tables, indices, constraints, seed fixture, and policies are recreated. | `[x]` |
| Public read | Local anonymous key queries published matches | Read succeeds only for public domain data. | `[x]` |
| Public write | Anonymous insert/update/delete | Database rejects mutation. | `[x]` |
| Failure | Invalid score or duplicate provider ID | Constraint rejects malformed/duplicate data. | `[x]` |

## 6. Verification Commands

1. `npm run supabase:reset`
2. `npx supabase db lint --local`
3. `npm run test -- --run src/services/supabase`

Expected: migration, RLS, constraint, and local data-access tests pass.

## 7. Out of Scope

1. Admin identity, encrypted provider secrets, and Edge Function implementation.
2. PandaScore network calls or scheduled work.
3. Browser dashboard migration.

## 8. Completion Checklist

- [x] Schema is fully reconstructible through migrations.
- [x] Public RLS is read-only and private tables are hidden.
- [x] Constraint and RLS cases are tested.
- [x] Verification commands succeed.
