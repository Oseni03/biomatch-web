## Parent

Database schema audit (2026-07-26) — see AGENTS.md "Schema Hardening Issues" section.

## What to build

Three independent, schema-only hardening changes, bundled into one ticket because none has any application-code impact today (there is currently no code path that deletes a `User` or a `Location` row — confirmed via search for `user.delete`/`deleteUser` and reviewing `removeStaffMember()`, which only unlinks org membership via better-auth's `removeMember`, never touches the underlying `User` row):

1. **`DonorScreening.staffUserId` cascade.** Currently `onDelete: Cascade` — if a staff `User` row is ever hard-deleted, every screening record they performed (including resolved pass/fail outcomes) is deleted with them. Since donation eligibility gating (issues 58-61) depends on screening history persisting, this is a landmine for whenever a user-deletion feature (e.g. better-auth account deletion, GDPR erasure) gets added later. Change to `onDelete: Restrict` so deleting a staff account with screening history fails loudly instead of silently erasing the audit trail.

2. **`Location.parent` cascade.** Currently defaults to `onDelete: SetNull` (implicit, since `parentId` is optional). Deleting a mid-tier location (e.g. a city) would silently orphan its children (areas) by nulling their `parentId`, which would quietly corrupt `getCommonAncestorDepth()`-based donor/hospital proximity matching for every user under that node. Change to `onDelete: Restrict` so deleting a location with children fails loudly instead of silently breaking the hierarchy.

3. **Matching hot-path index.** `matchDonors()` in `servers/emergency.ts` filters `User` on `role`, `isActive`, `bloodGroup`, `blacklistedAt`, and `deferredUntil` together, and runs on every emergency request creation and every radius expansion. `blacklistedAt`/`deferredUntil` (added in the eligibility rework, issues 58-61) currently have no index at all — only single-column indexes exist on `role`, `bloodGroup`, `locationId`, `lastDonationDate`. Add a composite index covering the common filter combination.

## Acceptance criteria

- [ ] `DonorScreening.staffUserId` relation is `onDelete: Restrict` in `schema.prisma`, applied via migration
- [ ] `Location.parent` relation is explicitly `onDelete: Restrict` in `schema.prisma`, applied via migration
- [ ] `User` has a new composite index `@@index([role, isActive, bloodGroup, blacklistedAt])` (or equivalent covering the `matchDonors` filter set), applied via migration
- [ ] `npx prisma migrate dev` runs cleanly against the current dev database with no data-loss warnings (per the Database Safety rules in AGENTS.md)
- [ ] `EXPLAIN ANALYZE` on the `matchDonors` query shows the new index being used
- [ ] No application code changes needed or made — confirm via a full `npm run build` that nothing broke

## Blocked by

None — can start immediately.
