---
id: 09
title: "Admin: hospital approval and management"
type: AFK
prd: "§4.4, 5.1"
---

# 09. Admin: hospital approval and management

**Type:** AFK &nbsp;|&nbsp; **PRD:** §4.4, 5.1

## What to build

The single founder admin account is created by a seed script. The Admin dashboard gains Hospital Management: a list of hospitals with status, a review queue of pending applications, and hospital detail. The admin can approve, or reject with a required reason. Approval or rejection updates the application and the hospital's status in one transaction, writes an audit log entry, and emails the hospital. A rejected hospital can reapply, which opens a new pending application; it stays restricted until approved. The admin can also suspend and reinstate a hospital.

## Acceptance criteria

- [ ] Seed script creates the founder admin; only that role can access admin endpoints and screens
- [ ] Admin can approve or reject pending applications; rejection requires a reason
- [ ] Status change, application update and audit log entry happen atomically
- [ ] Hospital receives an email on approval and on rejection
- [ ] A rejected hospital can reapply from its portal, creating a new pending application; a second open application cannot exist
- [ ] Approved hospitals can create requests; pending, rejected and suspended hospitals cannot (server enforced)
- [ ] Admin can suspend and reinstate an approved hospital
- [ ] Empty states for every new screen are designed and implemented (required by the PRD)

## Blocked by

- [08 Hospital registration and pending-approval state](08-hospital-registration-and-pending-state.md)
