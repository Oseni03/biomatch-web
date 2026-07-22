## Parent

Donor eligibility/verification grilling session (2026-07-22) — see CLAUDE.md. Second of 5 tickets (47-51).

## What to build

The walk-in workflow: a donor physically visits a partner hospital to get tested. Hospital staff need a way to record that visit and its outcome.

On the hospital side, staff with `hospitalStaffRole` of `admin` or `requester` (not `viewer` — recording a screening is a consequential write, matching the existing pattern of restricting mutating actions to non-read-only roles) can:
1. Search for a donor (reuse the existing donor search/lookup already used elsewhere on the hospital side).
2. Open a new screening for that donor — creates a `DonorScreening` row in `pending` status, tied to the current hospital and staff member.
3. Later, resolve that same pending screening to `passed` or `failed` (optionally with a note), once lab results are back.

No donor-initiated request/scheduling flow — this is walk-in only, so there's no queue or booking concept to build.

A `failed` result is not final — a later screening (a new pending → resolved cycle) can supersede it, since a donor's current status is always derived from their *latest resolved* screening (ticket 47).

## Acceptance criteria

- [ ] Staff with `admin`/`requester` role can search a donor and open a `pending` `DonorScreening` for them
- [ ] `viewer`-role staff cannot create or resolve a screening
- [ ] Staff can resolve a `pending` screening to `passed` or `failed`, with an optional note
- [ ] A donor can be screened again after a `failed` result — no permanent lockout
- [ ] No in-app donor-facing request/scheduling UI is introduced

## Blocked by

47 (needs the `DonorScreening` model to write to)
