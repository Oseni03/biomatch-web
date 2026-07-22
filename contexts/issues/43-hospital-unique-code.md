## Parent

UI/UX + debugging report (grilling session, 2026-07-21) — see CLAUDE.md.

## What to build

Stakeholder feedback: hospitals need a human-readable unique ID (e.g. `BIOMATCH-001`) so staff can identify which hospital they're dealing with. No such field exists today — `HospitalBank` (`prisma/schema.prisma` lines 113-128) has only a UUID `id`.

Resolved during grilling: a real unique identifier, not cosmetic — sequential, global (not per-region), assigned in onboarding order, zero-padded to 3 digits, never reused even if a hospital is deactivated.

Add an `Int @default(autoincrement())` column (e.g. `sequenceNumber`) to `HospitalBank`, format it as `BIOMATCH-{String(sequenceNumber).padStart(3, "0")}` wherever displayed (don't store the formatted string — derive it, so padding width can change later without a migration). Display it in the hospital dashboard header/sidebar alongside the hospital name.

Requires `npx prisma migrate dev` (schema change) — run `npm run prisma:generate` after.

## Acceptance criteria

- [ ] `HospitalBank` has an autoincrementing sequence column
- [ ] Existing hospitals backfilled with sequential values in creation order (`createdAt` or equivalent) via the migration
- [ ] Code displayed as `BIOMATCH-NNN` in hospital dashboard header/sidebar
- [ ] Format derived at render time, not stored as a formatted string

## Blocked by

None
