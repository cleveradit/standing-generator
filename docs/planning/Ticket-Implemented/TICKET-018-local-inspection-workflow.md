# Implementation Plan: TICKET-018 (Local Inspection Workflow)

**Ticket:** `TICKET-018`  
**Status:** `DONE`  
**Target Audience:** AI Developer Agents  
**Depends On:** `TICKET-017`

---

## 1. Business Decision Snapshot (Approved)

| Item | Approved Value |
|---|---|
| Local inspection command | `npm run dev:local` starts Supabase if needed, provisions the deterministic local admin, starts the two Edge Functions in fixture mode, then starts Vite. |
| Fixture behaviour | The checked-in local fixture must always produce resolvable standings and visible scenario probabilities; this does not claim to be an official MPL rulebook. |
| Admin visibility | The protected admin dashboard exposes safe provider metadata, current sync status, last successful sync, and safe sync history; it never returns the PandaScore token. |

The user explicitly requested this repair in chat on 21 September 2026.

---

## 2. Objective

Make the entire local V1 demonstrable from a beginner-friendly command. The public simulator must show probability results for the fixture, and an authenticated local admin must see provider status and sync information without manually starting a separate Edge Function process.

---

## 3. Non-Negotiable Technical Contract

1. File: `package.json`
   - Change: add `dev:local` without changing the plain Vite `dev` command.
2. File: `scripts/run-local-inspection.mjs`
   - Change: start/verify the local Supabase stack, create `.env.local` from local public credentials, provision `local-admin@example.test`, run `supabase functions serve` with `supabase/functions/.env.local-fixture`, and stop only its child processes on exit.
3. File: `supabase/seed.sql` and `supabase/functions/_shared/pandascore-fixture.ts`
   - Change: use the same four-team fixture whose every outcome can be ordered by the configured explicit rules and whose playoff probability changes for one remaining BO3.
4. File: `supabase/functions/provider-settings/index.ts`
   - Return shape: `ProviderSettingsResponse` includes only `{ provider, configured, updatedAt, sync }`, where `sync` contains safe status and history metadata, never a provider token.
5. File: `src/services/supabase/provider-settings.ts` and `src/pages/AdminPage.tsx`
   - Integration point: map and render the protected safe sync summary/history from `provider-settings` before enabling the admin dashboard.
6. File: `tests/e2e/local-workflow.spec.ts`
   - Change: assert a visible probability table and the admin sync status/history after login.

---

## 4. Scope of Changes

### A. One-command local runtime

1. Add the safe fixture Edge Function environment file and runner script.
2. Document the one command and local test account.

### B. Inspectable fixture results

1. Make the database seed and provider fixture equivalent.
2. Add test coverage that the scenario probability table is rendered.

### C. Admin dashboard completeness

1. Return safe sync metadata from the existing protected Edge Function.
2. Render status, timestamps, and history for an authenticated admin.

---

## 5. Acceptance Test Matrix

| Case | Input | Expected Result | Status |
|---|---|---|---|
| Public fixture | Fresh local reset, open `/` | Probability table is visible and contains all four teams. | `[x]` |
| Scenario boundary | Lock the sole remaining match as either team win | The relevant team playoff outcome changes without a simulation error. | `[x]` |
| Admin fixture | Login with deterministic local admin | Token metadata plus sync status/history are visible; no token value is rendered. | `[x]` |
| Failure | Request admin endpoint without a JWT | Endpoint remains unauthorized and returns no metadata or token. | `[x]` |

---

## 6. Verification Commands

1. `npm run lint`
2. `npm run test -- --run`
3. `npm run build`
4. `npm run test:local:acceptance`

Expected: all commands pass and the browser test verifies public probabilities plus the protected admin dashboard.

---

## 7. Out of Scope

1. Real PandaScore credential configuration and live data sync.
2. Hosted Supabase, GitHub Pages, and CI/CD.
3. Filling in an unverified official MPL multi-team tiebreaker.

---

## 8. Completion Checklist

- [x] Business decisions are fully specified and user-approved.
- [x] All Non-Negotiable Technical Contract items implemented.
- [x] Acceptance Test Matrix completed.
- [x] Verification commands executed successfully.
- [x] No out-of-scope changes introduced.
