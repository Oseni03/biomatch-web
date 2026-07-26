## Parent

Database schema audit (2026-07-26) — see AGENTS.md "Schema Hardening Issues" section. Not part of a prior grilling session; surfaced by a direct schema review of `EmergencyAlert`, `HospitalBank`, `DonorScreening`, `User`, and `Location`.

## What to build

`EmergencyAlert` has no uniqueness constraint on `(requestId, donorId)`. Deduplication today is entirely in application code: `expandRadiusIfNeeded()` in `servers/emergency.ts` filters candidate donors against `alreadyAlertedIds` (an in-memory array) before calling `emergencyAlert.createMany`, and the initial dispatch in `createEmergencyRequest()` has no dedup check at all since it assumes the request is fresh. This is a check-then-insert race: two overlapping radius-expansion calls (e.g. a retry after a timeout, or two queue/cron triggers firing close together) can both pass the in-memory check before either has written, and both insert an alert row for the same donor against the same request.

Duplicate alert rows cause real damage: `computeAlertAggregates()` double-counts the donor's status, the donor gets a duplicate alert email, and `MAX_ALERTS_PER_REQUEST` can be reached artificially early since duplicates count toward the cap.

Add a database-level uniqueness constraint so duplicates are impossible regardless of application-level races, and update both `createMany` call sites in `servers/emergency.ts` to tolerate (not crash on) an attempted duplicate insert — either via Prisma's `skipDuplicates` option or by catching the unique-constraint violation.

## Acceptance criteria

- [ ] `EmergencyAlert` has `@@unique([requestId, donorId])` in `schema.prisma`, applied via a migration
- [ ] The initial dispatch `createMany` in `createEmergencyRequest()` and the radius-expansion `createMany` in `expandRadiusIfNeeded()` no longer throw/fail when a duplicate (requestId, donorId) pair is attempted
- [ ] Firing two concurrent radius-expansion calls for the same request results in at most one `EmergencyAlert` row per donor (verify manually or with a test that runs both calls concurrently via `Promise.all`)
- [ ] Existing single-call dispatch and expansion flows behave identically to before (no regression in alert counts for the non-concurrent case)

## Blocked by

None — can start immediately.
