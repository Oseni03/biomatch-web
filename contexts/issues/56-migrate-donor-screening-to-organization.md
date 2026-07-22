## Parent

Hospital-as-Organization grilling session (2026-07-22) — see AGENTS.md. Fifth of 6 tickets (52-57). Depends on the donor verification feature (issues 47-51) already being merged, since this repoints a field that work introduces.

## What to build

Repoint `DonorScreening.hospitalId` (a `User` id, added in ticket 47) to `organizationId`, same expand-then-contract shape as tickets 54-55:

1. **Expand**: add a nullable `organizationId` column to `DonorScreening` additively.
2. **Backfill**: set `organizationId` from the Organization owned by the existing `hospitalId` user.
3. **Migrate call sites**: `servers/screening.ts`'s `createScreening()` and any place that constructs a `DonorScreening` row (including the re-screening opened inside `confirmDonation()`, ticket 51) needs to pass `organizationId` instead of a raw hospital user id.
4. **Switch role-gating**: `requireScreeningRole()` in `servers/screening.ts` currently checks `User.hospitalStaffRole` directly. Replace this with a check against the caller's org membership/role (from ticket 52's custom `admin`/`requester`/`viewer` roles) for the specific organization the screening belongs to — not a bare field on `User`.
5. **Contract**: leave `hospitalId` in place until a human explicitly confirms the drop.

`DonorScreening.staffUserId` does **not** change — per the grilling decision, "who performed this action" fields keep referencing `User` directly (not `Member`) for a durable audit trail that survives someone leaving the org.

## Acceptance criteria

- [ ] `DonorScreening.organizationId` added additively and backfilled
- [ ] `createScreening()` and the ticket-51 re-screening path use `organizationId`
- [ ] `requireScreeningRole()` checks org-scoped role via the ticket-52 access-control system, not `User.hospitalStaffRole`
- [ ] `staffUserId` continues to reference `User` unchanged
- [ ] `hospitalId` column left in place pending explicit human-confirmed drop

## Blocked by

52 (org foundation), 47-51 (donor verification feature must exist first, since this repoints its schema)
