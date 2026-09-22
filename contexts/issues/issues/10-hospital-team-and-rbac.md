---
id: 10
title: "Hospital team and role-based access control"
type: AFK
prd: "§3.1, 4.2"
---

# 10. Hospital team and role-based access control

**Type:** AFK &nbsp;|&nbsp; **PRD:** §3.1, 4.2

## What to build

Hospitals manage their own team. The permission catalog is defined in code (blood requests: create, read, update, close; donors: read, confirm donation, record screening; history: read; plus the organisation defaults). Built-in Owner, Admin and Member roles exist, and hospital admins can create custom roles from that catalog using dynamic access control. The Team and Members screen lets authorised staff invite members by email, assign roles, change roles, and suspend or remove members. The existing accept-invitation page is wired up, closing today's gap where an accept flow exists but nothing creates invitations.

A reusable server-side permission check is introduced and used by all later hospital slices.

## Acceptance criteria

- [x] Permission catalog exists in code and is enforced server-side by a reusable check
- [x] Owner, Admin and Member built-in roles exist; the last Owner cannot be removed or demoted
- [x] Authorised staff can create, edit and delete custom roles composed of catalog permissions
- [x] Staff can invite by email; the invitee accepts through the accept-invitation flow and joins with the chosen role
- [x] Members list shows roles and allows role change and removal by authorised staff only
- [x] A user in several hospitals can switch active organisation
- [x] Users without the relevant permission cannot see or call the management actions (tested)
- [x] Empty states for every new screen are designed and implemented (required by the PRD) (no team members added yet)

## Implementation (2026-09-22)

- `src/servers/organization.ts`: new `requireOrgPermission()` — resolves every
  role on the membership (built-ins via `orgRoles`, custom roles from
  `organizationRole` validated through `ac.newRole().authorize()`,
  `suspended`/unknown denied); `authorizeOrgAction()` now delegates to it.
  `getActiveOrganizationId()` prefers the session's `activeOrganizationId`.
- `src/servers/team.ts`: `requireOrgManager` (owner/admin only — org
  administration stays with built-ins, custom roles cover domain permissions),
  member list/invite/role-change/remove/suspend/reinstate, custom-role CRUD
  (reserved names, catalog-subset validation, delete blocked while assigned),
  `listMyOrganizations` + `switchActiveOrganization`. All mutations audit
  logged; suspend stores the previous role for faithful reinstatement;
  last-owner demote/suspend/remove blocked.
- Invitations are real rows + `StaffInvitationEmail`; both accept paths
  (logged-in plugin accept, new-user `acceptInvitationSignUp`) work with them.
- UI: `/hospital/team` (members, invite + pending-invitation empty state,
  custom roles + no-roles empty state, management hidden without permission),
  `Team & Roles` sidebar nav, `OrganizationSwitcher` in the hospital sidebar
  for multi-hospital users.
- `tests/hospital-team.test.ts` (7 passing): invite→signup→join, member
  blocked from management, custom-role enforcement, last-owner protection,
  suspend/reinstate permission loss, org switching.

## Blocked by

- [08 Hospital registration and pending-approval state](08-hospital-registration-and-pending-state.md)
