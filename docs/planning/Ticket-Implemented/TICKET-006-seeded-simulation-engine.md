# Implementation Plan: TICKET-006 (Seeded Scenario Simulation)

**Ticket:** `TICKET-006`  
**Status:** `DONE`  
**Target Audience:** AI Developer Agents  
**Depends On:** `TICKET-005`

---

## 1. Business Decision Snapshot (Approved)

| Item | Approved Value |
|---|---|
| Simulation method | Monte Carlo with default 50.000 iterations; the caller may choose a lower test iteration count. |
| Unlocked BO3 result | `2-0`, `2-1`, `1-2`, and `0-2` each have equal probability. |
| Locked result | A locally selected legal scoreline is used on every iteration. |
| Reproducibility | `seed` is optional and produces deterministic test runs. |

## 2. Objective

Build the pure scenario simulator that applies remaining-match outcomes, delegates ranking to the verified tiebreaker module, and returns probability categories per team.

## 3. Non-Negotiable Technical Contract

1. File: `src/engine/simulator.ts`
   - Method signature: `simulate(input: SimulationInput): TeamSimulationResult[]`.
   - Return shape: each result has `teamId`, `upperBracketProbability`, `playoffProbability`, and `eliminatedProbability`.
2. File: `src/engine/random.ts`
   - Method signature: `createRandom(seed?: number): () => number`.
   - Return shape: generated values are in `[0, 1)` and repeat for equal seeds.
3. File: `src/engine/simulator.test.ts`
   - Integration point: fixed seed tests cover unlocked outcomes, locked outcome, cutoff boundary, and invalid input.
4. File: `src/engine/types.ts`
   - Change: define `SimulationInput` with season rules, matches, locks, `iterations`, and optional `seed`.

## 4. Scope of Changes

1. Validate every lock against its match `bestOf` before iterating.
2. Derive legal outcomes from `bestOf`; do not globally assume BO3.
3. Recalculate standing from completed and simulated matches on every iteration.
4. Classify ranks using season playoff and upper-bracket cutoffs.

## 5. Acceptance Test Matrix

| Case | Input | Expected Result | Status |
|---|---|---|---|
| Seeded run | Same input and seed twice | Identical probability output. | `[x]` |
| Locked result | One locked BO3 result | Every iteration uses that exact scoreline. | `[x]` |
| Boundary | Rank exactly equals each cutoff | Classified as upper bracket/playoff according to inclusive cutoff. | `[x]` |
| Failure | Zero iterations or illegal lock scoreline | Engine rejects input with a domain error. | `[x]` |

## 6. Verification Commands

1. `npm run lint`
2. `npm run test -- --run src/engine/simulator.test.ts`
3. `npm run build`

Expected: core simulation passes deterministic tests without React, browser, or network.

## 7. Out of Scope

1. Web Worker adapter, exhaustive enumeration, or weighted probability.
2. React state and rendering.
3. Provider fetch, storage, Supabase, or deployment.

## 8. Completion Checklist

- [x] Seeded and locked-result behavior is proven by tests.
- [x] Cutoff and invalid-input cases are covered.
- [x] Acceptance matrix is completed.
- [x] Verification commands succeed.
