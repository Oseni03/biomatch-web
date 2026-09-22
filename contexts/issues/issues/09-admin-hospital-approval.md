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

- [x] Seed script creates the founder admin; only that role can access admin endpoints and screens
- [x] Admin can approve or reject pending applications; rejection requires a reason
- [x] Status change, application update and audit log entry happen atomically
- [x] Hospital receives an email on approval and on rejection
- [x] A rejected hospital can reapply from its portal, creating a new pending application; a second open application cannot exist
- [x] Approved hospitals can create requests; pending, rejected and suspended hospitals cannot (server enforced)
- [x] Admin can suspend and reinstate an approved hospital
- [x] Empty states for every new screen are designed and implemented (required by the PRD)

## Implementation (2026-09-22)

- `prisma/seed.ts` (`npm run prisma:seed` / `prisma db seed`): creates the
  founder admin from `FOUNDER_ADMIN_EMAIL`/`FOUNDER_ADMIN_PASSWORD` (idempotent,
  promotes existing users, records NDPR consents so the proxy gate passes).
  `requireAdmin()` gates every admin server action; `/admin` routes are
  additionally gated by the proxy (`getSessionRole`) and the admin layout.
- `src/servers/admin.ts`: `listHospitals` (status/search/pagination),
  `getVerificationQueue`, `getHospitalDetail`, `approveHospital` /
  `rejectHospital` (single Prisma transaction: application + organization
  status + `audit_logs` row, then approval/rejection email), `suspendHospital`
  / `reinstateHospital` (approved-only / suspended-only, audit logged),
  `reapplyForVerification` (owner/admin of a rejected hospital; the partial
  unique index blocks a second open application).
- `src/servers/audit.ts`: reusable `writeAuditLog()` for later slices.
- UI: `/admin` overview (counts + queue state), `/admin/hospitals` (review
  queue + searchable/filtered/paginated list), `/admin/hospitals/[id]`
  (registration details, team, application history, approve/reject/suspend/
  reinstate actions) with loading/error boundaries and empty states;
  rejected hospitals get a `ReapplyButton` in `AwaitingApproval`.
- `tests/admin-approval.test.ts` (7 passing): non-admin blocked, queue/list,
  reason required, atomic approve + audit, suspend/reinstate gating, reject →
  reapply-once → stays restricted.

## Blocked by

- [08 Hospital registration and pending-approval state](08-hospital-registration-and-pending-state.md)
