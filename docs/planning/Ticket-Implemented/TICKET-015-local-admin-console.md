# Implementation Plan: TICKET-015 (Local Admin Console)

**Ticket:** `TICKET-015`  
**Status:** `DONE`  
**Target Audience:** AI Developer Agents  
**Depends On:** `TICKET-011`, `TICKET-012`, `TICKET-013`

---

## 1. Business Decision Snapshot (Approved)

| Item | Approved Value |
|---|---|
| Access | `/admin` is available only to a signed-in local admin; public simulator access stays unauthenticated. |
| Responsibilities | The console manages PandaScore token rotation, exposes safe configuration/sync status, and starts a manual sync. |
| Secret UX | Token input is write-only, cleared after submit, and never prefilled from storage. |
| Authority | All mutations use the authorized Edge Functions; no browser database write policy is introduced. |

## 2. Objective

Deliver the local administrator journey requested by the PRD: sign in, safely configure the PandaScore token, inspect sync status, and manually refresh the database. The UI must remain a client of server-side authorization rather than a second security boundary.

## 3. Non-Negotiable Technical Contract

1. File: `src/pages/AdminPage.tsx`
   - Change: implement loading, unauthenticated sign-in, authorized settings, manual-sync, success, and failure states for the `/admin` route.
2. File: `src/components/admin/AdminSignInForm.tsx`
   - Method signature: `AdminSignInForm(props: { onSuccess: () => void }): JSX.Element`.
   - Return shape: email/password form invokes `signInAdmin`; it renders normalized auth errors and never logs credentials.
3. File: `src/components/admin/ProviderSettingsForm.tsx`
   - Method signature: `ProviderSettingsForm(props: { settings: ProviderSettings; onSaved: (settings: ProviderSettings) => void }): JSX.Element`.
   - Return shape: write-only token field invokes `savePandaScoreToken`; it clears the field after any completed request.
4. File: `src/services/supabase/sync.ts`
   - Method signature: `runPandaScoreSync(): Promise<{ syncLogId: string; seasonId: string; matchCount: number }>`.
   - Return shape: invokes `sync-pandascore` with the current admin JWT and returns only its safe response fields.

## 4. Scope of Changes

1. Add a minimal client-side route selection for `/` and `/admin`, preserving the public simulator route.
2. Determine session state with the Supabase browser client; redirect/render sign-in when the session is absent.
3. Render `configured` state, last update, latest sync outcome, and a manual sync control for an authorized admin.
4. Test accessible labels, secret field clearing, authorization-state transitions, and error messages from the local functions.

## 5. Acceptance Test Matrix

| Case | Input | Expected Result | Status |
|---|---|---|---|
| Admin sign-in | Provisioned local admin credentials | `/admin` reveals settings and sync controls. | `[x]` |
| Public visitor | Visit `/admin` without session | Sign-in form appears; no secret/settings details are disclosed. | `[x]` |
| Token save | Valid write-only token input | UI reports configuration success, clears field, and never displays token. | `[x]` |
| Manual sync | Authorized click with configured provider | UI reports returned match count and refreshes safe status. | `[x]` |
| Failure | Non-admin/expired session or failed sync | UI displays normalized error and no privileged data. | `[x]` |

## 6. Verification Commands

1. `npm run supabase:reset && npm run admin:create-local`
2. `npm run test -- --run src/pages/AdminPage src/components/admin src/services/supabase/sync`
3. `npm run dev`

Expected: admin flows work against local Supabase and public simulator remains accessible without an account.

## 7. Out of Scope

1. Multi-admin management, registration, recovery email, or OAuth.
2. Automatic scheduled synchronization.
3. Mobile-specific design beyond the existing responsive baseline.

## 8. Completion Checklist

- [x] `/admin` is usable with the provisioned local admin.
- [x] Token is write-only throughout the browser experience.
- [x] Manual sync uses the protected Edge Function.
- [x] Verification commands succeed.
