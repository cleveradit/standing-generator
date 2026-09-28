# Implementation Plan: TICKET-001 (Local Frontend Foundation)

**Ticket:** `TICKET-001`  
**Status:** `DONE`  
**Target Audience:** AI Developer Agents  
**Depends On:** `None`

---

## 1. Business Decision Snapshot (Approved)

| Item | Approved Value |
|---|---|
| Development scope | Local-first; Supabase, GitHub Pages, admin, scheduler, and persistence are excluded. |
| Runtime/tooling | React + TypeScript + Vite + Tailwind CSS, npm, Vitest. |
| Data boundary | Browser later calls a local gateway; no PandaScore token in any `VITE_*` variable. |

## 2. Objective

Create the minimal local application foundation needed by subsequent small tickets. The project must run, test, lint, and build locally without connecting to PandaScore yet.

## 3. Non-Negotiable Technical Contract

1. File: `package.json`
   - Change: define npm scripts `dev`, `build`, `test`, and `lint`; use React, TypeScript, Vite, Tailwind CSS, Vitest, and no state-management library.
2. File: `vite.config.ts`
   - Change: configure the React Vite application only; PandaScore middleware is reserved for TICKET-002.
3. File: `src/main.tsx`
   - Change: mount `src/App.tsx` into `#root` with TypeScript strict checking enabled by project configuration.
4. Files: `src/App.tsx`, `src/index.css`, `src/test/setup.ts`, `src/App.test.tsx`
   - Integration point: render a minimal accessible application shell and prove it through a component test.
5. File: `.gitignore`
   - Change: ignore `.env.local` and generated outputs; do not ignore `.env.example`.

## 4. Scope of Changes

1. Initialize the Vite React TypeScript project and Tailwind styling baseline.
2. Configure strict TypeScript, Vitest, and linting suitable for the tickets that follow.
3. Add only the folder skeleton required immediately: `src/domain`, `src/engine`, `src/services`, `src/components`, and `src/pages`.
4. Record verified local commands in `docs/ai-context.md`.

## 5. Acceptance Test Matrix

| Case | Input | Expected Result | Status |
|---|---|---|---|
| App shell | `npm run dev` | Vite serves an accessible application shell. | `[x]` |
| Test baseline | `npm run test -- --run` | The App component test passes. | `[x]` |
| Boundary | Empty application state | Shell renders without requiring provider data. | `[x]` |
| Failure | Missing PandaScore environment variable | Foundation still starts because it makes no provider request. | `[x]` |

## 6. Verification Commands

1. `npm run lint`
2. `npm run test -- --run`
3. `npm run build`

Expected: all commands exit successfully.

## 7. Out of Scope

1. PandaScore requests or token handling.
2. Supabase, GitHub Pages, admin, scheduler, or database setup.
3. Simulation and standings logic.

## 8. Completion Checklist

- [x] Contract files exist and satisfy the stated roles.
- [x] Acceptance matrix is completed.
- [x] Verification commands succeed.
- [x] `docs/ai-context.md` contains verified local commands.
