# Implementation Plan: TICKET-017 (Local End-to-End Acceptance)

**Ticket:** `TICKET-017`  
**Status:** `DONE`  
**Target Audience:** AI Developer Agents  
**Depends On:** `TICKET-014`, `TICKET-015`, `TICKET-016`

---

## 1. Business Decision Snapshot (Approved)

| Item | Approved Value |
|---|---|
| Test target | A developer can test the entire V1 workflow on localhost with Docker-compatible Supabase and Vite only. |
| Test data | Deterministic local seed and recorded PandaScore HTTP fixtures make automated tests independent of live provider availability. |
| Privacy gate | End-to-end checks prove anonymous users cannot mutate data and browser-visible artifacts contain no PandaScore token. |
| Completion gate | A documented one-command local acceptance workflow passes from a clean reset. |

## 2. Objective

Prove the integrated project—not isolated units—works locally from setup through public simulation, admin setup, manual and scheduled sync, and persistence. Package this as a repeatable acceptance workflow that a new developer can run without a hosted Supabase project or GitHub Pages.

## 3. Non-Negotiable Technical Contract

1. File: `tests/e2e/local-workflow.spec.ts`
   - Change: automate anonymous simulator, admin sign-in, write-only token configuration, fixture-backed manual sync, scheduled trigger, and post-sync public-dashboard assertions against localhost.
2. File: `scripts/test-local-stack.mjs`
   - Method signature: command starts/validates the local stack, resets schema, provisions the test admin, runs required test suites, and returns a non-zero exit code for any failed phase.
3. File: `package.json`
   - Change: add `test:local:e2e` and `test:local:acceptance`; the latter invokes `scripts/test-local-stack.mjs` and does not use remote credentials.
4. File: `docs/LOCAL_TESTING.md`
   - Change: document prerequisites, first-run setup, exact acceptance command, test fixture controls, URLs, expected results, cleanup, and diagnostics.

## 4. Scope of Changes

1. Add a browser-test runner and stable Vite/Supabase test setup using only localhost endpoints.
2. Run existing engine/unit tests, database/RLS checks, Edge Function tests, dashboard UI tests, and the browser workflow in the acceptance command.
3. Assert scenario changes update simulation output deterministically for the seeded fixture and that the public page works without login.
4. Build production assets during acceptance and inspect them for PandaScore token names, values, service-role values, and direct provider browser URLs.

## 5. Acceptance Test Matrix

| Case | Input | Expected Result | Status |
|---|---|---|---|
| Clean local journey | Fresh clone prerequisites plus `npm run test:local:acceptance` | Stack/reset/admin provisioning/tests complete locally with no hosted project. | `[x]` |
| Public workflow | Anonymous browser opens `/`, changes a remaining-match scenario | Standings/probability workflow renders and simulation result changes deterministically. | `[x]` |
| Admin workflow | Local provisioned admin at `/admin` | Sign-in, token write-only save, fixture manual sync, and status refresh succeed. | `[x]` |
| Scheduler workflow | Local deterministic scheduler trigger | A new safe sync log exists and public dashboard reflects refreshed data. | `[x]` |
| Privacy/failure gate | Anonymous write, invalid token, missing local stack, and build scan | Writes are denied; errors are actionable; no provider/service secret or direct provider route reaches browser artifacts. | `[x]` |

## 6. Verification Commands

1. `npm run test:local:acceptance`
2. `npm run lint`
3. `npm run build`

Expected: the acceptance command completes from a clean local reset, all suites pass, and build output is secret-free.

## 7. Out of Scope

1. Hosted Supabase, GitHub Pages, DNS, or CI deployment validation.
2. Live PandaScore credentials or live provider availability as a prerequisite for test success.
3. New product features outside the approved V1 PRD.

## 8. Completion Checklist

- [x] One documented local acceptance command covers the complete V1 journey.
- [x] Tests use deterministic local fixtures and no hosted services.
- [x] Public, admin, scheduler, privacy, and failure paths are exercised.
- [x] Verification commands succeed.
