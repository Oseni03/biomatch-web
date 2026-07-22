## Parent

Hospital-as-Organization grilling session (2026-07-22) — see AGENTS.md. Second of 6 tickets (52-57).

## What to build

Replace the current instant-provision staff flow (`inviteStaffMember()` in `servers/staff.ts`) with BetterAuth's real invitation lifecycle. Today, `inviteStaffMember()` immediately upserts a `User` row with no acceptance step — and if the invited email already belongs to an existing user, it silently overwrites that user's `name`/`role`/`hospitalStaffRole` with no confirmation. This is an account-takeover-shaped bug that a real accept flow closes.

New flow: an `admin`/`owner` staff member sends an invitation (email + one of `admin`/`requester`/`viewer`) via BetterAuth's `organization.inviteMember()`. The invitee receives an email (via the existing `lib/email.ts` Resend wrapper — mocks when `RESEND_API_KEY` unset, same pattern as `sendEmergencyAlertEmail`) with a link to an accept-invitation page. If they don't already have an account, they complete signup (set a password) as part of accepting; if they do, they log in and accept. Only on acceptance does BetterAuth create the `Member` row — no membership exists before that.

Update `components/hospital/invite-staff-form.tsx` and `components/hospital/staff-list.tsx` to reflect pending vs. accepted invitations (BetterAuth's `Invitation` model tracks status: pending/accepted/rejected/canceled), and to use organization membership instead of `getStaffMembers()`'s `managedBanks` self-reference hack.

## Acceptance criteria

- [ ] Admin/owner staff can send an invitation by email + role; no `User`/`Member` is created until accepted
- [ ] Invitation email sent via `lib/email.ts`, mocked when `RESEND_API_KEY` is unset
- [ ] Accepting an invitation as a brand-new email creates the account (with the invitee setting their own password) and the `Member` row in one flow
- [ ] Accepting as an existing user's email requires them to be logged in as that user — no silent overwrite of an existing account
- [ ] Staff list UI shows pending vs. accepted invitations and each member's actual role
- [ ] `viewer`-role staff still cannot send invitations (matches existing admin-only staff-management restriction)

## Blocked by

52 (needs the organization/member/invitation tables and custom roles to invite into)
