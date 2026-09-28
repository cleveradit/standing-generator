# Implementation Plan: TICKET-002 (Local PandaScore Gateway)

**Ticket:** `TICKET-002`  
**Status:** `DONE`  
**Target Audience:** AI Developer Agents  
**Depends On:** `TICKET-001`

---

## 1. Business Decision Snapshot (Approved)

| Item | Approved Value |
|---|---|
| Provider access | Live PandaScore data is fetched during local development. |
| Credential boundary | Vite dev-server middleware reads `PANDASCORE_API_TOKEN` from `.env.local`; the browser never receives it. |
| Authentication | Server-side requests use `Authorization: Bearer <token>`. |
| Scope | Gateway is development-only and exposes no generic proxy route. |

Rujukan keputusan autentikasi: [PandaScore Authentication](https://developers.pandascore.co/docs/authentication) mendukung Bearer token dan menyatakan token private tidak boleh dipakai pada aplikasi client-side.

## 2. Objective

Create a small, allowlisted local data gateway that can make authenticated PandaScore requests without leaking the API token into browser code, URLs, or logs.

## 3. Non-Negotiable Technical Contract

1. File: `vite.config.ts`
   - Change: install a Vite dev-server route at `GET /api/local/season-snapshot`; it must reject methods other than `GET` with `405`.
2. File: `src/services/pandascore/server-client.ts`
   - Method signature: `fetchPandaScore(path: string, query?: URLSearchParams): Promise<unknown>`.
   - Return shape: parsed provider JSON on a 2xx response; throws a redacted typed error for non-2xx/network failure.
3. File: `.env.example`
   - Change: document empty `PANDASCORE_API_TOKEN=` and `PANDASCORE_SERIES_ID=` entries only; no real credential or ID.
4. File: `src/services/pandascore/server-client.test.ts`
   - Integration point: mock `fetch` and verify the Bearer header is sent while the token is absent from errors.

## 4. Scope of Changes

1. Validate that the server process has a non-empty token before provider access.
2. Restrict requests to the exact season-snapshot flow needed by TICKET-003; do not accept arbitrary provider URLs from the browser.
3. Redact token values from thrown errors and console output.
4. Return a stable non-secret error response from the local gateway.

## 5. Acceptance Test Matrix

| Case | Input | Expected Result | Status |
|---|---|---|---|
| Authenticated request | Valid local token and mocked 200 provider response | Server client sends Bearer token and returns parsed JSON. | `[x]` |
| Unsupported method | `POST /api/local/season-snapshot` | Gateway responds `405` without contacting PandaScore. | `[x]` |
| Boundary | Provider response body is an empty array | Gateway returns the empty result without fabricating data. | `[x]` |
| Failure | Token missing or provider returns 401/429 | Gateway returns a safe error; token is absent from response and logs. | `[x]` |

## 6. Verification Commands

1. `npm run lint`
2. `npm run test -- --run src/services/pandascore/server-client.test.ts`
3. `npm run build`

Expected: tests prove no client token exposure and the production build contains no configured token value.

## 7. Out of Scope

1. Mapping PandaScore payload to application domain types.
2. Browser UI, caching, Supabase, deployment, or sync scheduling.
3. A public/reusable PandaScore proxy.

## 8. Completion Checklist

- [x] Gateway accepts only its allowlisted read flow.
- [x] Token is server-side only and redacted from errors.
- [x] Acceptance matrix is completed.
- [x] Verification commands succeed.
