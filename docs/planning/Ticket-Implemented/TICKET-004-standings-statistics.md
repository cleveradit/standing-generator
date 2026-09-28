# Implementation Plan: TICKET-004 (Standings Statistics Engine)

**Ticket:** `TICKET-004`  
**Status:** `DONE`  
**Target Audience:** AI Developer Agents  
**Depends On:** `TICKET-003`

---

## 1. Business Decision Snapshot (Approved)

| Item | Approved Value |
|---|---|
| Source of truth | Only normalized matches with status `finished` contribute to current statistics. |
| Statistics | Match win/loss, game win/loss, and game difference are computed, never fetched as a separate standing. |
| Invalid data | Finished match without a legal score is rejected from engine input; it is not silently counted. |
| Ranking | This ticket stops at per-team statistics; official ordering is isolated to TICKET-005. |

## 2. Objective

Implement a pure, testable calculation of current team statistics from finished matches. This creates the common foundation for standing display and future simulation without choosing an unverified tiebreaker.

## 3. Non-Negotiable Technical Contract

1. File: `src/engine/standings.ts`
   - Method signature: `calculateStandings(teams: readonly Team[], matches: readonly Match[]): TeamStanding[]`.
   - Return shape: each `TeamStanding` has `teamId`, `matchWins`, `matchLosses`, `gameWins`, `gameLosses`, and `gameDifference`.
2. File: `src/engine/types.ts`
   - Export: `type TeamStanding` and engine-owned read-only input shapes derived from `src/domain/season-snapshot.ts`.
3. File: `src/engine/standings.test.ts`
   - Integration point: test the pure method only; no React, gateway, or network mocking.

## 4. Scope of Changes

1. Aggregate only completed valid matches.
2. Count a match win from higher game score and game statistics from the exact scoreline.
3. Return zero statistics for an eligible team with no finished match.
4. Throw a descriptive domain error when a finished match lacks a valid winner/score.

## 5. Acceptance Test Matrix

| Case | Input | Expected Result | Status |
|---|---|---|---|
| Mixed results | Two teams with 2–0 and 1–2 finished matches | Match/game totals and difference are exact. | `[x]` |
| Boundary | Team with no finished match | All statistics are zero. | `[x]` |
| Exclusion | Scheduled/postponed match | Does not affect any statistic. | `[x]` |
| Failure | Finished match has missing/equal illegal score | Engine rejects the input rather than producing a standing. | `[x]` |

## 6. Verification Commands

1. `npm run lint`
2. `npm run test -- --run src/engine/standings.test.ts`
3. `npm run build`

Expected: exact aggregate tests pass without browser or provider access.

## 7. Out of Scope

1. Sorting/ranking and all tiebreakers.
2. Monte Carlo, scoreline locks, and UI.
3. Supabase persistence or live request changes.

## 8. Completion Checklist

- [x] Only finished valid matches are counted.
- [x] Boundary and failure tests pass.
- [x] Acceptance matrix is completed.
- [x] Verification commands succeed.
