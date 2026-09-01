# Code Review — Uncommitted Changes

## Summary
The changes add a new blood-group-based emergency request feed for donors, convert the hospital emergency request form to a modal with inline success state, and update React Query hooks to invalidate the new query key. The direction is useful, but the new server action has a critical authorization gap and embeds non-idempotent writes inside a polling read path. Additional warnings cover redundant DB queries, doubled polling load, and a broken units input in the modal form.

## Issues Found
| Severity | File:Line | Issue |
|---|---|---|
| CRITICAL | src/servers/emergency.ts:298 | `getCompatibleEmergencyRequests` accepts arbitrary `donorId` with no auth check |
| CRITICAL | src/servers/emergency.ts:400 | `createMany` write side-effect inside a polling `queryFn` |
| WARNING | src/servers/emergency.ts:302 | Unvalidated `page`/`pageSize` feed both queries and write amplification |
| WARNING | src/servers/emergency.ts:359 | N+1 query on nested `hospitalBanks` include every poll |
| WARNING | src/servers/emergency.ts:376 | Redundant `findMany` re-read of rows just inserted |
| WARNING | src/hooks/use-emergency-requests.ts:32 | Duplicate overlapping poll: dashboard + sidebar both poll donor alerts |
| WARNING | src/app/donor/page.tsx:24 | SSR prefetch immediately refetched because `staleTime` defaults to 0 |
| WARNING | src/hooks/use-emergency-mission-tracker.ts:28 | Tracker mutations only invalidate legacy `donor-alerts`, not the new query |
| SUGGESTION | src/components/hospital/emergency-request-form.tsx:217 | Units `Input` `onChange` missing `setReqPints`, so keyboard input is ignored |

## Detailed Findings
- **File:** `src/servers/emergency.ts:298`
  - **Confidence:** High
  - **Problem:** `getCompatibleEmergencyRequests(donorId, ...)` performs donor-scoped queries and writes without calling `auth.api.getSession()`. Sibling server actions (`respondToAlert`, `donorConfirmDonation`) all validate `session.user.id === donorId`; this one does not.
  - **Suggestion:** Add `const session = await auth.api.getSession({ headers: await headers() })` at the top and throw if `!session?.user || session.user.id !== donorId`.

- **File:** `src/servers/emergency.ts:400`
  - **Confidence:** High
  - **Problem:** The function is wired as a React Query `queryFn` with `refetchInterval: POLL_INTERVAL_MS` (20 s). Query functions should be idempotent reads, but this one executes `prisma.emergencyAlert.createMany(...)` on every poll. Combined with the missing auth check, an attacker can trigger cross-donor alert creation indefinitely.
  - **Suggestion:** Move alert auto-creation into a dedicated server action guarded by the session check, or make the query path read-only and create alerts via an explicit mutation.

- **File:** `src/servers/emergency.ts:302`
  - **Confidence:** High
  - **Problem:** `page` and `pageSize` are taken directly from the client `filters` object with no validation. Negative/zero `page` yields a negative `skip`; unbounded `pageSize` has no cap. Because these values also control how many alert rows are created per poll, an attacker can inflate writes per request.
  - **Suggestion:** Clamp/validate `page >= 1` and `1 <= pageSize <= 50` before any DB call.

- **File:** `src/servers/emergency.ts:359`
  - **Confidence:** High
  - **Problem:** Prisma issues a separate query per nested one-to-many `hospitalBanks` include inside the `findMany` that runs every 20 s per donor. With `pageSize: 10`, this is up to 11 round-trips per poll.
  - **Suggestion:** Denormalize hospital location onto `EmergencyRequest`, or batch-fetch organizations and merge in JS.

- **File:** `src/servers/emergency.ts:376`
  - **Confidence:** High
  - **Problem:** After `createMany`, an immediate `findMany` re-reads rows that were just inserted. The values are already known (`requestId`, `donorId`, `status: "alerted"`), so the round-trip is pure waste whenever new alerts were created.
  - **Suggestion:** Seed `alertMap` in-memory from `missingRequestIds` instead of re-reading from the DB.

- **File:** `src/hooks/use-emergency-requests.ts:32`
  - **Confidence:** High
  - **Problem:** Dashboard now uses `useCompatibleEmergencyRequests` while sidebar still uses legacy `useDonorAlerts`. Both poll every 20 s for the same donor, each running its own multi-query server action. Net DB load per donor per interval roughly doubled.
  - **Suggestion:** Migrate the sidebar badge count to derive from the same `compatible-emergency-requests` cache, or consolidate into a single shared query.

- **File:** `src/app/donor/page.tsx:24`
  - **Confidence:** High
  - **Problem:** React Query defaults `staleTime: 0`, so the SSR-prefetched data is treated as stale on hydration; the client immediately refetches, duplicating the multi-query server action right after page load.
  - **Suggestion:** Pass `staleTime: POLL_INTERVAL_MS` (or longer) to the prefetched query so the SSR data remains fresh until the next poll.

- **File:** `src/hooks/use-emergency-mission-tracker.ts:28`
  - **Confidence:** High
  - **Problem:** All mutation callbacks (`handleRespond`, `handleDecline`, `handleWithdraw`, `handleMarkEnRoute`, `handleMarkArrived`) only invalidate `["donor-alerts"]`. The dashboard now reads from `compatible-emergency-requests`, so the alert feed stays stale until the next poll tick after any action.
  - **Suggestion:** Invalidate `["compatible-emergency-requests"]` alongside `["donor-alerts"]` in each callback.

- **File:** `src/components/hospital/emergency-request-form.tsx:217`
  - **Confidence:** High
  - **Problem:** The units `Input` `onChange` no longer calls `setReqPints`. Previously it was `onChange={(e) => setReqPints(parseInt(e.target.value) || 1)}`; now it reads `onChange={(e) => parseInt(e.target.value) || 1}` with no setter, so typing a number is a no-op.
  - **Suggestion:** Restore the setter: `onChange={(e) => setReqPints(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}`.

## Recommendation
**NEEDS CHANGES** — The critical auth gap and write-side-effect in a polling path must be fixed before this is safe to merge. The performance and stale-data warnings are also significant for a polling-heavy donor experience.
