## Parent

Hospital-as-Organization grilling session (2026-07-22) — see AGENTS.md. Sixth and last of 6 tickets (52-57). This is the "contract" half of the expand-then-contract migrations done in tickets 54-56.

## What to build

Once `organizationId` is live everywhere and nothing reads the old `User`-based tenant columns anymore, drop the legacy columns:

- `HospitalBank.managedById`
- `EmergencyRequest.hospitalId`
- `DonorScreening.hospitalId`
- `User.hospitalStaffRole` (superseded by org membership roles from ticket 52)

This is a genuinely destructive, data-loss-risking change (dropping columns) per AGENTS.md's Database Safety rules. **Do not run this automatically as a continuation of 54-56.** Before touching anything:

- Grep the full codebase for every remaining reference to each column name and confirm zero live call sites remain (not just the ones tickets 54-56 explicitly called out — a full re-check, since new code may have been added to any of these fields in the interim).
- Confirm with a human that it's safe to proceed — this ticket is explicitly **not ready-for-agent** without that sign-off, matching how issue 46 was flagged in this same tracker.

## Acceptance criteria

- [ ] Full-codebase grep confirms zero remaining references to `managedById`, the old `EmergencyRequest.hospitalId`, the old `DonorScreening.hospitalId`, and `User.hospitalStaffRole`
- [ ] Human has explicitly confirmed the drop before the migration is written
- [ ] Migration drops exactly these four columns, nothing else
- [ ] App still builds and all hospital-side flows (staff, inventory, emergency requests, screening) work end-to-end post-drop

## Blocked by

54, 55, 56 (every read/write path must be migrated off these columns first). **Needs-triage / HITL** — do not implement without explicit human confirmation, per the note above.
