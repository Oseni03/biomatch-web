## Parent

Hospital-as-Organization grilling session (2026-07-22) — see AGENTS.md. Fourth of 6 tickets (52-57).

## What to build

Repoint `EmergencyRequest.hospitalId` (a `User` id) to `organizationId` (an `Organization` id), same expand-then-contract shape as ticket 54:

1. **Expand**: add a nullable `organizationId` column to `EmergencyRequest` additively.
2. **Backfill**: set `organizationId` from the Organization owned by the existing `hospitalId` user.
3. **Migrate call sites**: every server action in `servers/emergency.ts` that takes or reads `hospitalId` — `createEmergencyRequest()`, `matchDonors()`, `getEmergencyRequestsForHospital()`, `getPendingEmergencyRequestsForHospital()`, `getEmergencyHistory()`, `expandSearchRadius()` — needs to read/write `organizationId`. Callers currently pass `session.user.id` as `hospitalId` (see `app/hospital/emergency/page.tsx` and others); those call sites need to resolve the caller's active organization id instead (via the session/org membership from ticket 52), not their raw user id.
4. **Contract**: leave `hospitalId` in place until a human explicitly confirms the drop, same as ticket 54.

This is the largest of the FK-migration tickets by call-site count — budget time for it accordingly, and double check `getLocalDemandStats()`'s hospital-location lookup too, since it joins through `hospital: locationRel`.

## Acceptance criteria

- [ ] `EmergencyRequest.organizationId` added additively and backfilled
- [ ] All `servers/emergency.ts` functions and their callers use organization id, not raw hospital user id
- [ ] `matchDonors()`/donor-matching behavior is unchanged other than the id it filters on
- [ ] `hospitalId` column left in place pending explicit human-confirmed drop

## Blocked by

52 (needs Organization to exist), ideally sequenced after 54 since both touch the same hospital-context resolution logic
