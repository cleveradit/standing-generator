# Implementation Plan: TICKET-007 (Live Season Dashboard)

**Ticket:** `TICKET-007`  
**Status:** `DONE`  
**Target Audience:** AI Developer Agents  
**Depends On:** `TICKET-003`, `TICKET-004`, `TICKET-005`

---

## 1. Business Decision Snapshot (Approved)

| Item | Approved Value |
|---|---|
| Data source | Browser fetches only `GET /api/local/season-snapshot`. |
| Initial content | Season identity, last fetched time, ranking, and current standing statistics. |
| Refresh behavior | Explicit user refresh refetches the local gateway; no automatic polling in this ticket. |
| Non-data states | Loading, safe provider failure, empty season, and no-finished-match states are first-class UI states. |

## 2. Objective

Display the live local season snapshot and current calculated standings in an accessible responsive dashboard, without yet exposing scenario controls or probabilities.

## 3. Non-Negotiable Technical Contract

1. File: `src/services/season-api.ts`
   - Method signature: `getSeasonSnapshot(signal?: AbortSignal): Promise<SeasonSnapshot>`.
   - Return shape: parsed snapshot on 2xx; throws a safe client error otherwise.
2. File: `src/pages/SimulatorPage.tsx`
   - Integration point: owns snapshot loading/refresh state and renders all named UI states.
3. Files: `src/components/SeasonHeader.tsx`, `src/components/StandingsTable.tsx`
   - Change: semantic heading/time and semantic table displaying rank, team, match record, game record, and difference.
4. File: `src/pages/SimulatorPage.test.tsx`
   - Change: mock `getSeasonSnapshot` for loading, success, empty, and failure views.

## 4. Scope of Changes

1. Load a snapshot once on page mount and support a visible retry/refresh action.
2. Calculate statistics with the engine and rank only through TICKET-005's rule module.
3. Provide horizontal table overflow treatment on narrow screens and keyboard-accessible refresh.
4. Show provider failures without exposing raw errors or credentials.

## 5. Acceptance Test Matrix

| Case | Input | Expected Result | Status |
|---|---|---|---|
| Success | Snapshot with finished matches | Header and complete standings table render. | `[x]` |
| Loading | Pending request | Stable loading state renders without blank page. | `[x]` |
| Boundary | Snapshot has no finished matches | Empty-state message renders; no fabricated rank. | `[x]` |
| Failure | Gateway returns safe error | Retry action and clear non-secret error message render. | `[x]` |

## 6. Verification Commands

1. `npm run lint`
2. `npm run test -- --run src/pages/SimulatorPage.test.tsx`
3. `npm run build`

Expected: dashboard handles all four states and does not call PandaScore from browser code.

## 7. Out of Scope

1. Scenario locks, reset, simulation output, and Worker integration.
2. Supabase, authentication, or deployment.
3. Automatic refresh/polling and persistent cache.

## 8. Completion Checklist

- [x] All data states are rendered and tested.
- [x] Standing table is semantic and responsive.
- [x] Acceptance matrix is completed.
- [x] Verification commands succeed.
