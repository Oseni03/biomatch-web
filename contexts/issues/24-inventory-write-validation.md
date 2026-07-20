## Parent

Simplification pass (grilling session, 2026-07-16) — see AGENTS.md / CLAUDE.md.

## What to build

`updateHospitalBankInventory` validates the incoming inventory payload against a schema (exactly the 8 blood-group keys, non-negative integers) before writing to the `HospitalBank.inventory` JSON column, instead of trusting the caller's shape. The JSON column itself stays — this is boundary validation, not a relational migration (the blob is a fixed-shape struct, not a naturally relational table).

### Dependencies

- Add `zod` as a new dependency (not currently installed)

## Acceptance criteria

- [x] `zod` added to `package.json` dependencies
- [x] `updateHospitalBankInventory` rejects payloads with unexpected keys, negative counts, or non-integer values
- [x] Existing valid inventory updates continue to work unchanged
- [x] Validation error surfaces as a clear error message, not a silent failure or raw Prisma error

## Blocked by

None — can start immediately
