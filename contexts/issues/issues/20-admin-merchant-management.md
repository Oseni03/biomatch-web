---
id: 20
title: "Admin: merchant management"
type: AFK
prd: "§9"
---

# 20. Admin: merchant management

**Type:** AFK &nbsp;|&nbsp; **PRD:** §9

## What to build

The admin manages the affiliated marts and malls where vouchers can be redeemed: create, edit and deactivate merchants, and create merchant staff accounts linked to a merchant (the staff member receives an email to set a password). Merchant staff are normal users; the link is what will authorise them in the merchant portal.

## Acceptance criteria

- [x] Admin can create, edit and deactivate merchants
- [x] Admin can create staff accounts linked to a merchant and disable them; staff receive a set-password email
- [x] Deactivated merchants cannot be chosen for new redemptions
- [x] Only the admin can access these actions (tested)
- [x] Empty states for every new screen are designed and implemented (required by the PRD) (no merchants yet)

Implemented 2026-09-22: `servers/merchants.ts` (CRUD, activate/deactivate,
staff link/enable/disable, staff creation via admin `createUser` + password-reset
email, `listActiveMerchants` for the redemption picker, `getMerchantPortalContext`
for slice 22; all admin actions consent+admin gated and audit logged),
`/admin/merchants` list + create + empty state, `/admin/merchants/[id]` detail +
staff management, sidebar Merchants item, `tests/merchant-management.test.ts`
(5 passing against live DB).

## Blocked by

- [09 Admin: hospital approval and management](09-admin-hospital-approval.md)
