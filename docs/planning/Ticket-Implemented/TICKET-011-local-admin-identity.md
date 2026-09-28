# Implementation Plan: TICKET-011 (Local Admin Identity and Authorization)

**Ticket:** `TICKET-011`  
**Status:** `DONE`  
**Target Audience:** AI Developer Agents  
**Depends On:** `TICKET-009`, `TICKET-010`

---

## 1. Business Decision Snapshot (Approved)

| Item | Approved Value |
|---|---|
| Authentication | Local Supabase Auth email/password session. Public registration remains disabled. |
| Admin model | `public.admin_users` stores authorized `auth.users.id`; exactly one local admin is provisioned by an explicit developer command. |
| Authorization | Sensitive Edge Functions verify the JWT and `admin_users` membership server-side. |
| Browser role | Frontend route guards improve UX only and never authorize mutation. |

## 2. Objective

Provide a reproducible local admin identity and a shared server-side authorization boundary, without allowing public signup or relying on a frontend-only protected route.

## 3. Non-Negotiable Technical Contract

1. File: `supabase/migrations/20260921090200_create_admin_users.sql`
   - Change: create `public.admin_users(user_id uuid primary key references auth.users(id))`, enable RLS, and expose no anonymous policy.
2. File: `scripts/create-local-admin.mjs`
   - Method signature: command reads `LOCAL_ADMIN_EMAIL`, `LOCAL_ADMIN_PASSWORD`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` from an ignored env file and upserts one Auth user plus admin membership.
3. File: `supabase/functions/_shared/auth.ts`
   - Method signature: `requireAdmin(request: Request): Promise<{ userId: string }>`.
   - Return shape: resolves only for an authenticated authorized user; otherwise returns/throws normalized 401 or 403 response data.
4. File: `src/services/supabase/auth.ts`
   - Change: export `signInAdmin(email: string, password: string): Promise<void>` and `signOutAdmin(): Promise<void>`.

## 4. Scope of Changes

1. Disable public sign-up in local config.
2. Provide a documented one-admin provisioning command that never writes credentials to source.
3. Unit-test expired/missing JWT and authenticated non-admin behavior.
4. Validate authorization inside a minimal protected test Edge Function.

## 5. Acceptance Test Matrix

| Case | Input | Expected Result | Status |
|---|---|---|---|
| Authorized user | Provisioned local admin session | Protected function accepts the request. | `[x]` |
| Non-admin | Authenticated user absent from `admin_users` | Protected function returns 403. | `[x]` |
| Boundary | Missing/expired JWT | Protected function returns 401. | `[x]` |
| Failure | Public sign-up request | Auth configuration rejects registration. | `[x]` |

## 6. Verification Commands

1. `npm run supabase:reset`
2. `npm run admin:create-local`
3. `npm run test -- --run src/services/supabase/auth.test.ts supabase/functions/_shared/auth-test.ts`

Expected: only the provisioned local admin can pass the server-side check.

## 7. Out of Scope

1. Admin page UI, sync actions, and provider settings form.
2. Multi-admin management, public registration, password reset, or OAuth.
3. Hosted auth configuration.

## 8. Completion Checklist

- [x] Local admin provisioning is explicit and non-secret source remains clean.
- [x] JWT and membership are checked server-side.
- [x] Negative authorization cases are tested.
- [x] Verification commands succeed.
