## Parent

Donor eligibility/verification grilling session (2026-07-22) — see CLAUDE.md. Fourth of 5 tickets (47-51).

## What to build

Donor-facing visibility into their own verification state, plus a notification when it changes.

- Donor dashboard shows current verification status (`unverified` / `pending` / `verified` / `failed`), with a banner or equivalent surfaced treatment when the donor is not currently `verified` — this app has no separate `admin` role to lean on for this messaging, so the banner should point the donor at what to do next (visit a partner hospital) rather than referencing any admin review step.
- When hospital staff resolve a `pending` screening (ticket 48) to `passed` or `failed`, send the donor an email via the existing Resend wrapper (`lib/email.ts`, mocks when `RESEND_API_KEY` is unset — same pattern as other transactional email in this app).

## Acceptance criteria

- [ ] Donor dashboard displays their current verification status
- [ ] A donor who is not `verified` sees a clear next step (get screened at a partner hospital), not a dead-end message
- [ ] Resolving a screening to `passed` or `failed` sends the donor an email via `lib/email.ts`
- [ ] No email is sent for the `pending` (sample-taken) transition — only on resolution

## Blocked by

47 (status field), 48 (the staff action that produces a resolution to notify on and to display)
