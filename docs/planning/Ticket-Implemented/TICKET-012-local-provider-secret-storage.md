# Implementation Plan: TICKET-012 (Local Provider Secret Storage)

**Ticket:** `TICKET-012`  
**Status:** `DONE`  
**Target Audience:** AI Developer Agents  
**Depends On:** `TICKET-010`, `TICKET-011`

---

## 1. Business Decision Snapshot (Approved)

| Item | Approved Value |
|---|---|
| Secret owner | PandaScore API token is entered and rotated only by an authenticated local admin. |
| Secret boundary | The raw token is stored in local Supabase Vault and is readable only by trusted database/Edge Function execution. |
| Browser response | The browser may receive configuration state and last-updated time, never a token or token-derived value. |
| Bootstrap | `supabase/functions/.env` may contain only ignored local bootstrap values; it is not the persistent admin-managed token store. |

## 2. Objective

Let the local admin configure PandaScore without putting its API token in the Vite bundle, browser storage, versioned files, or public database API. Make the configuration status observable and testable while retaining a server-side-only secret read path for sync work.

## 3. Non-Negotiable Technical Contract

1. File: `supabase/migrations/20260921090300_create_provider_settings.sql`
   - Change: create the Vault-backed provider-secret metadata model, including a private provider-settings relation that records provider name, Vault secret reference, and audit timestamps; expose no anonymous policy.
2. File: `supabase/functions/provider-settings/index.ts`
   - Method signature: `Deno.serve(async (request: Request): Promise<Response> => Response)`.
   - Return shape: `GET` returns `{ provider: "pandascore", configured: boolean, updatedAt: string | null }`; authenticated-admin `PUT` accepts `{ apiToken: string }` and returns the same shape, never the submitted token.
3. File: `supabase/functions/_shared/provider-settings.ts`
   - Method signature: `getPandaScoreToken(client: SupabaseClient): Promise<string>`.
   - Return shape: resolves a non-empty raw token only in trusted function execution; otherwise throws a normalized unavailable-secret error.
4. File: `src/services/supabase/provider-settings.ts`
   - Change: export `getProviderSettings(): Promise<ProviderSettings>` and `savePandaScoreToken(apiToken: string): Promise<ProviderSettings>`; invoke the Edge Function using the signed-in session.

## 4. Scope of Changes

1. Use the local Vault extension/API supplied by the Supabase local stack; validate the migration works after a clean reset.
2. Validate blank and malformed token input before storage, and atomically rotate the stored secret on a valid update.
3. Require `requireAdmin` from TICKET-011 for both settings endpoints.
4. Write tests that inspect all JSON responses and browser-facing errors for secret absence.

## 5. Acceptance Test Matrix

| Case | Input | Expected Result | Status |
|---|---|---|---|
| Initial state | New reset with no setting | Admin GET reports `configured: false`; no raw field exists. | `[x]` |
| First configuration | Authorized PUT with valid token | Vault contains the value; GET reports configured and timestamp only. | `[x]` |
| Rotation | Authorized PUT with a second valid token | Sync helper resolves only the replacement token. | `[x]` |
| Boundary | Empty/whitespace token | PUT returns 422 and leaves the prior secret unchanged. | `[x]` |
| Failure | Anonymous or non-admin request | Endpoint returns 401/403 and does not read or modify the secret. | `[x]` |

## 6. Verification Commands

1. `npm run supabase:reset`
2. `npx supabase functions serve provider-settings --env-file supabase/functions/.env`
3. `npm run test -- --run supabase/functions/provider-settings src/services/supabase/provider-settings`

Expected: secret persistence, rotation, authorization, and response-redaction tests pass against the local stack.

## 7. Out of Scope

1. PandaScore match synchronization or scheduling.
2. The visual admin console.
3. Hosted Vault configuration or secret migration between environments.

## 8. Completion Checklist

- [x] Admin-managed token is persistent only in local Vault-backed storage.
- [x] No raw token is present in browser responses, logs, or tracked files.
- [x] Authorization and rotation paths are tested.
- [x] Verification commands succeed.
