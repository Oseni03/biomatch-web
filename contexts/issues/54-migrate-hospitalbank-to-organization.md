## Parent

Hospital-as-Organization grilling session (2026-07-22) — see AGENTS.md. Third of 6 tickets (52-57). Independent of ticket 53 — only needs the org tables from 52, so can be built/verified in parallel.

## What to build

Repoint `HospitalBank` from `managedById` (a `User` id) to `organizationId` (an `Organization` id), following AGENTS.md's Database Safety expand-then-contract path:

1. **Expand**: add a nullable `organizationId` column to `HospitalBank` alongside the existing `managedById`, additive migration only.
2. **Backfill**: for every existing `HospitalBank`, set `organizationId` to the Organization owned by the user in `managedById` (every hospital-role user should already have exactly one org from ticket 52's auto-creation — if a bank's `managedById` user somehow has no org yet, that's a data problem to surface, not silently paper over).
3. **Migrate call sites**: update every server action and query that reads `managedById` (`servers/hospital.ts`, `servers/staff.ts`'s `getStaffMembers`, `hooks/use-hospital-bank.ts`, etc.) to read `organizationId` instead. This is also what finally fixes `getStaffMembers()`'s self-reference bug — staff membership becomes a real org query, not a `managedBanks` relation hack.
4. **Contract**: only after all call sites are migrated and a human has explicitly confirmed nothing depends on `managedById` anymore, drop the column in a separate follow-up migration. Do not do this automatically as part of this ticket — flag it and stop.

## Acceptance criteria

- [ ] `HospitalBank.organizationId` added additively, backfilled correctly for all existing banks
- [ ] All read/write call sites use `organizationId`, not `managedById`
- [ ] `getStaffMembers()` (or its replacement) returns actual invited staff for a hospital, not just the calling user
- [ ] `managedById` column is left in place, unused, pending an explicit human-confirmed drop (not part of this ticket's scope)

## Blocked by

52 (needs Organization to exist before backfilling `organizationId`)
