# Implementation Plan: TICKET-014 (Local Public Data Path)

**Ticket:** `TICKET-014`  
**Status:** `DONE`  
**Target Audience:** AI Developer Agents  
**Depends On:** `TICKET-010`, `TICKET-013`

---

## 1. Business Decision Snapshot (Approved)

| Item | Approved Value |
|---|---|
| Browser source | The simulator reads normalized public data from local Supabase, never PandaScore directly. |
| Browser configuration | Only local Supabase URL and publishable/anon key may be exposed as `VITE_` variables. |
| Read behavior | The UI uses a typed adapter to convert database rows into the existing `SeasonSnapshot` engine contract. |
| Migration | The Vite PandaScore gateway is removed from the live browser path after the Supabase adapter is verified. |

## 2. Objective

Make the public dashboard fully testable against the local Supabase stack, including its seed fixture and synchronised data, without leaking the PandaScore token or coupling the browser to a development-only proxy.

## 3. Non-Negotiable Technical Contract

1. File: `src/services/supabase/client.ts`
   - Change: create the singleton browser client from `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; throw an actionable configuration error when either is absent.
2. File: `src/services/season-api.ts`
   - Method signature: `fetchSeasonSnapshot(): Promise<SeasonSnapshot>`.
   - Return shape: a validated domain snapshot read from public Supabase relations; provider raw payloads and credentials are absent.
3. File: `src/services/supabase/season-snapshot.ts`
   - Method signature: `loadActiveSeasonSnapshot(client: SupabaseClient): Promise<SeasonSnapshot>`.
   - Return shape: uses one active season and all related public teams/matches; throws an explicit empty-data error when no active season exists.
4. File: `vite.config.ts`
   - Change: remove the PandaScore local gateway middleware and its server-side environment dependency.

## 4. Scope of Changes

1. Add the browser Supabase library and its local environment documentation/example values without copying service-role secrets.
2. Translate public database rows to the already-tested engine snapshot shape, retaining dates, BO format, score, status, and season rules.
3. Preserve a readable dashboard loading/error state for missing local stack, denied read, or empty active season.
4. Add adapter and component tests with a local-stack fixture; scan the production bundle for prohibited PandaScore secret names/values.

## 5. Acceptance Test Matrix

| Case | Input | Expected Result | Status |
|---|---|---|---|
| Seeded dashboard | Local stack reset and Vite env configured | Public browser loads seeded standings and remaining matches. | `[x]` |
| Synced dashboard | Successful sync data | Public browser renders the imported active season. | `[x]` |
| Boundary | Active season with no matches | UI presents empty-but-valid state; no engine crash occurs. | `[x]` |
| Failure | Missing local URL/key or unavailable stack | UI shows actionable load error without retry loop or secret data. | `[x]` |

## 6. Verification Commands

1. `npm run supabase:reset`
2. `npm run test -- --run src/services/supabase src/services/season-api src/pages/SimulatorPage`
3. `npm run build`

Expected: local read-path tests pass, production build succeeds, and bundle inspection finds no PandaScore token configuration.

## 7. Out of Scope

1. Admin login and administration UI.
2. Provider token writes or PandaScore synchronization implementation.
3. Hosted Supabase configuration.

## 8. Completion Checklist

- [x] Public dashboard depends only on normalized local Supabase data.
- [x] Vite server no longer proxies PandaScore requests.
- [x] Error and empty states are covered.
- [x] Verification commands succeed.
