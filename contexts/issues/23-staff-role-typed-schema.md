## Parent

Simplification pass (grilling session, 2026-07-16) — see AGENTS.md / CLAUDE.md.

## What to build

Hospital staff role (`viewer`/`requester`/`admin`) becomes a real, typed, DB-validated column instead of a key (`staffRole`) read out of `User.updatedHealthInfo` — an untyped JSON blob otherwise used for health-profile data.

### Schema

- Add `HospitalStaffRole` enum (`admin` / `requester` / `viewer`)
- Add `User.hospitalStaffRole HospitalStaffRole?` column
- Migration that backfills from any existing `updatedHealthInfo.staffRole` values before the JSON key is abandoned

### Server logic

- `servers/staff.ts` — `getStaffMembers()`, `inviteStaffMember()`, `updateStaffRole()`, `removeStaffMember()`, and the admin-role check all read/write the typed column instead of casting `updatedHealthInfo`

## Acceptance criteria

- [x] `HospitalStaffRole` enum and `User.hospitalStaffRole` column exist
- [x] All staff CRUD server actions read/write the typed column, not `updatedHealthInfo`
- [x] No remaining code casts `updatedHealthInfo` to read `staffRole`
- [x] Existing staff role data (if any) migrated, not silently dropped

## Blocked by

None — can start immediately
