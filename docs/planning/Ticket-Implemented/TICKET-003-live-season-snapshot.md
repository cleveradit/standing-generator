# Implementation Plan: TICKET-003 (Live Season Snapshot)

**Ticket:** `TICKET-003`  
**Status:** `DONE`  
**Target Audience:** AI Developer Agents  
**Depends On:** `TICKET-002`

---

## 1. Business Decision Snapshot (Approved)

| Item | Approved Value |
|---|---|
| Season selection | Local operator supplies non-secret `PANDASCORE_SERIES_ID`; the gateway validates it before use. |
| Provider hierarchy | A PandaScore series identifies the time-bound competition; match data is retrieved from that series. |
| Data output | Browser receives a normalized `SeasonSnapshot`, never raw provider payload or provider credential. |
| Refresh | Each browser request fetches live data; persistence and cache are out of scope. |

Rujukan struktur provider: [PandaScore Getting Started](https://developers.pandascore.co/docs/getting-started) mendeskripsikan hirarki League → Series → Tournament → Match → Game dan pagination endpoint match.

## 2. Objective

Normalize live PandaScore series and match responses into a stable local snapshot for the domain engine and UI, while preserving enough provider identity for debugging without exposing secrets.

## 3. Non-Negotiable Technical Contract

1. File: `src/domain/season-snapshot.ts`
   - Export: `type SeasonSnapshot`, `type SeasonRules`, `type Team`, and `type Match` with provider IDs, participants, status, schedule, score, and `bestOf`.
2. File: `src/services/pandascore/season-snapshot.ts`
   - Method signature: `loadSeasonSnapshot(seriesId: string): Promise<SeasonSnapshot>`.
   - Return shape: `{ season, teams, matches, fetchedAt }`; rejects incomplete/unusable provider data with a safe error.
3. File: `vite.config.ts`
   - Integration point: `GET /api/local/season-snapshot` calls `loadSeasonSnapshot(process.env.PANDASCORE_SERIES_ID)` and serializes only `SeasonSnapshot`.
4. File: `src/services/pandascore/season-snapshot.test.ts`
   - Change: fixtures cover finished, scheduled, postponed, and malformed match records.

## 4. Scope of Changes

1. Fetch the configured series and its paginated matches using the server client.
2. Normalize provider status and scores without guessing score values that were absent in the payload.
3. Include only two-opponent matches in the snapshot; report invalid records rather than inventing a participant.
4. Establish an explicit `rules` placeholder that does not claim unverified MPL tiebreakers.

## 5. Acceptance Test Matrix

| Case | Input | Expected Result | Status |
|---|---|---|---|
| Live-shape normalization | Valid series and finished/scheduled match fixtures | Snapshot contains stable teams, matches, scores, and provider IDs. | `[x]` |
| Pagination | Two provider pages | Snapshot combines both pages with no duplicate provider match IDs. | `[x]` |
| Boundary | Series with no matches | Returns valid snapshot with empty `matches`. | `[x]` |
| Failure | Malformed match or provider error | Safe error is returned; no partial fabricated standing data. | `[x]` |

## 6. Verification Commands

1. `npm run lint`
2. `npm run test -- --run src/services/pandascore/season-snapshot.test.ts`
3. `npm run build`

Expected: normalization tests pass and bundle contains no PandaScore credential.

## 7. Out of Scope

1. Storing snapshots, background sync, or Supabase.
2. Ranking, tiebreaker, simulation, and React rendering.
3. Guessing the official rule configuration from provider data.

## 8. Completion Checklist

- [x] Browser endpoint returns normalized, non-secret snapshot only.
- [x] Pagination and malformed payload behavior are tested.
- [x] Acceptance matrix is completed.
- [x] Verification commands succeed.
