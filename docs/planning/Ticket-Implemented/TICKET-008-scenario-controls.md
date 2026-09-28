# Implementation Plan: TICKET-008 (Scenario Controls and Probability Results)

**Ticket:** `TICKET-008`  
**Status:** `DONE`  
**Target Audience:** AI Developer Agents  
**Depends On:** `TICKET-006`, `TICKET-007`

---

## 1. Business Decision Snapshot (Approved)

| Item | Approved Value |
|---|---|
| Scenario state | Scoreline locks live only in browser memory and start as `?`. |
| Match presentation | Remaining regular-season matches are grouped by local scheduled date. |
| User controls | Each supported scoreline plus `?`; Reset clears every lock. |
| Probability language | UI labels outcomes as equal-weight scenario probability, not team-strength prediction. |

## 2. Objective

Add the interactive simulator to the live dashboard so users can lock remaining-match scorelines, reset local state, and see probability results update responsively.

## 3. Non-Negotiable Technical Contract

1. File: `src/hooks/useScenarioSimulation.ts`
   - Return shape: `{ locks, results, isSimulating, setLock(matchId: string, result: Scoreline | null): void, reset(): void }`.
2. File: `src/components/RemainingMatches.tsx`
   - Integration point: group eligible remaining matches by date and render semantic scoreline buttons including `?`.
3. File: `src/components/ProbabilityTable.tsx`
   - Change: render each team’s upper-bracket, playoff, and eliminated percentages plus explanatory copy.
4. File: `src/pages/SimulatorPage.tsx`
   - Integration point: compose dashboard, scenario controls, and probability results without persisting locks.
5. File: `src/hooks/useScenarioSimulation.test.tsx`
   - Change: test lock, unlock, reset, and simulation error states using seeded engine inputs.

## 4. Scope of Changes

1. Filter out finished/cancelled matches from selectable controls.
2. Validate/select only scorelines legal for each match `bestOf`.
3. Rerun simulation when snapshot or lock state changes while keeping the dashboard visible.
4. Support Reset without any network mutation.

## 5. Acceptance Test Matrix

| Case | Input | Expected Result | Status |
|---|---|---|---|
| Lock | User selects `2-0` for eligible BO3 match | Lock state updates and results recalculate. | `[x]` |
| Unlock/reset | User selects `?` then Reset | Individual lock and then all locks are cleared locally. | `[x]` |
| Boundary | No remaining matches | Final results render and no controls are shown. | `[x]` |
| Failure | Simulator rejects malformed snapshot | Existing dashboard remains visible with safe simulation error state. | `[x]` |

## 6. Verification Commands

1. `npm run lint`
2. `npm run test -- --run src/hooks/useScenarioSimulation.test.tsx`
3. `npm run build`

Expected: local scenario changes never create a provider/network mutation and all interaction tests pass.

## 7. Out of Scope

1. Worker/cancellation optimization unless benchmarked separately.
2. URL sharing, persistent scenario storage, or public account.
3. Supabase, admin, scheduler, and deployment.

## 8. Completion Checklist

- [x] All locks and reset are local-only.
- [x] Probability labels explain equal-weight scenario semantics.
- [x] Acceptance matrix is completed.
- [x] Verification commands succeed.
