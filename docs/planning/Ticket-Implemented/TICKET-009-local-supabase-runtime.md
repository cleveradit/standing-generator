# Implementation Plan: TICKET-009 (Local Supabase Runtime)

**Ticket:** `TICKET-009`  
**Status:** `DONE`  
**Target Audience:** AI Developer Agents  
**Depends On:** `TICKET-001`

---

## 1. Business Decision Snapshot (Approved)

| Item | Approved Value |
|---|---|
| Runtime | Supabase CLI runs Postgres, Auth, Edge Runtime, and Studio locally through a Docker-compatible runtime. |
| CLI installation | Project-scoped `supabase` npm dev dependency, invoked as `npx supabase`. |
| Network | Local stack is bound to localhost; it is never exposed publicly. |
| Scope | No hosted Supabase project, GitHub Pages, or production deployment. |

## 2. Objective

Make the complete Supabase runtime reproducible on a development machine so database, authentication, Edge Functions, and Studio can be tested locally from the same repository.

## 3. Non-Negotiable Technical Contract

1. File: `package.json`
   - Change: add a project-scoped Supabase CLI and scripts `supabase:start`, `supabase:stop`, `supabase:status`, and `supabase:reset`.
2. File: `supabase/config.toml`
   - Change: configure local project ID, localhost site URL `http://127.0.0.1:5173`, local auth redirects, and enabled Edge Runtime without hardcoded secrets.
3. File: `.gitignore`
   - Change: ignore Supabase generated state and `supabase/functions/.env`; keep config, migrations, seed, and function source versioned.
4. File: `docs/ai-context.md`
   - Change: record Docker-compatible runtime prerequisite and verified start/stop/status commands.

## 4. Scope of Changes

1. Initialize `supabase/` using the project-scoped CLI.
2. Configure local ports and browser redirect URLs for Vite.
3. Verify Studio, Postgres API, Auth, and Edge Runtime are healthy after startup.
4. Keep CLI output credentials local and out of source files.

## 5. Acceptance Test Matrix

| Case | Input | Expected Result | Status |
|---|---|---|---|
| First start | Docker runtime available, `npm run supabase:start` | Local services become healthy and status prints local URLs. | `[x]` |
| Restart | `npm run supabase:stop` then start | Services restart from the tracked configuration. | `[x]` |
| Boundary | No hosted project credentials | Stack starts without `supabase link` or cloud access. | `[x]` |
| Failure | Docker runtime unavailable | Script fails with an actionable prerequisite message; it does not fall back to a remote project. | `[x]` |

## 6. Verification Commands

1. `npm run supabase:start`
2. `npm run supabase:status`
3. `npm run supabase:stop`

Expected: all local service endpoints and credentials originate from the CLI status output.

## 7. Out of Scope

1. Database schema, RLS, user creation, or Edge Function business logic.
2. Hosted Supabase linking, deployment, or GitHub Actions.
3. Persisting PandaScore credentials.

## 8. Completion Checklist

- [x] Local stack is reproducible from a fresh clone with prerequisites installed.
- [x] No local/generated credential is committed.
- [x] Acceptance matrix is completed.
- [x] Verification commands succeed.
