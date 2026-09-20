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

- [ ] Permission catalog exists in code and is enforced server-side by a reusable check
- [ ] Owner, Admin and Member built-in roles exist; the last Owner cannot be removed or demoted
- [ ] Authorised staff can create, edit and delete custom roles composed of catalog permissions
- [ ] Staff can invite by email; the invitee accepts through the accept-invitation flow and joins with the chosen role
- [ ] Members list shows roles and allows role change and removal by authorised staff only
- [ ] A user in several hospitals can switch active organisation
- [ ] Users without the relevant permission cannot see or call the management actions (tested)
- [ ] Empty states for every new screen are designed and implemented (required by the PRD) (no team members added yet)

## Blocked by

- [08 Hospital registration and pending-approval state](08-hospital-registration-and-pending-state.md)
