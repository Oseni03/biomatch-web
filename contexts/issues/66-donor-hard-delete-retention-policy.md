## Parent

Database schema audit (2026-07-26) — see AGENTS.md "Schema Hardening Issues" section.

## What to build

`Donation.donorId` is a required (non-nullable) foreign key with `onDelete: Cascade` — if a donor `User` row is ever hard-deleted, their entire donation history is deleted with them. Unlike the staff-screening cascade fixed in issue 65 (where `Restrict` is an uncontroversial correctness fix), this one hinges on a product/legal decision this repo doesn't currently have an answer for: can a donor with donation history ever be hard-deleted, and if so, should their donation records be deleted with them (current behavior), kept but anonymized, or should deletion be blocked entirely while donation history exists?

This matters for a blood-bank system specifically because donation records may carry traceability/compliance value independent of the donor's continued presence in the system (e.g. "which donations came from which underlying donor" may need to survive a GDPR-style erasure request in anonymized form, per whatever data-retention policy applies).

There is no current code path that hard-deletes a `User` row, so this is not an active bug — it's a decision to make before any user-deletion feature (self-service account deletion, admin removal, GDPR erasure endpoint) gets built on top of the current schema.

## Acceptance criteria

- [ ] A decision is recorded (in this ticket's comments, or as an ADR if the project's `contexts/architecture.md` tracks those) on one of: (a) block donor deletion while `Donation` rows exist (`onDelete: Restrict`), (b) anonymize `Donation` rows on donor deletion (requires making `donorId` nullable + `SetNull`, plus a decision on what "anonymized" means for a donation record), or (c) keep current cascade behavior deliberately
- [ ] Once decided, the schema change (if any) is implemented via migration
- [ ] If a future user-deletion feature is already planned, this ticket's decision is cross-referenced from that feature's spec

## Blocked by

None, but requires a human decision before implementation — filed as `needs-triage`, not `ready-for-agent`.
