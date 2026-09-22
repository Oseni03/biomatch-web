---
id: 22
title: "Merchant portal: verify and redeem codes"
type: AFK
prd: "§9"
---

# 22. Merchant portal: verify and redeem codes

**Type:** AFK &nbsp;|&nbsp; **PRD:** §9

## What to build

Merchant staff sign in and land in a minimal portal, authorised by their active merchant staff link. A cashier enters a voucher code, sees a preview of the amount, and confirms. Confirming marks the voucher redeemed with time and staff member, in one atomic update that only succeeds if the code is issued, unexpired and belongs to that merchant. Failures show one generic message so the cashier cannot probe other merchants' codes. Staff can view their merchant's redemption history.

## Acceptance criteria

- [x] Only active staff of a merchant can access the portal and only for their merchant
- [x] Valid codes redeem exactly once; a second attempt fails (tested with concurrent requests)
- [x] Expired, used, unknown and other-merchant codes all give the same generic failure
- [x] Redeeming records who redeemed and when; audit logged
- [x] Redemption history lists the merchant's redemptions
- [x] Merchant staff pass the same consent gate as other users
- [x] Empty states for every new screen are designed and implemented (required by the PRD) (no redemptions yet)

Implemented 2026-09-22: portal functions in `servers/merchants.ts`
(`previewVoucherCode`, `redeemVoucherCode`, `listMerchantRedemptions`;
`getMerchantPortalContext` from slice 20 reused for the gate), `/merchant`
route with a minimal no-sidebar portal (redeem check-then-confirm + history +
access-denied + empty states), proxy consent-gate + matcher, login redirects
active staff to `/merchant`, `tests/merchant-portal.test.ts` (8 passing:
preview, exactly-once incl. concurrent claim via guarded `updateMany`,
identical generic message across expired/used/unknown/other-merchant for both
preview and redeem, non-staff get the same message, link/merchant toggles,
history with donor code + staff name, consent gate). Fixed while verifying:
`voucher.redeem` audit `entityId` must be the voucher UUID, not the code.

## Blocked by

- [21 Donor redeems a voucher and receives a code](21-donor-redeems-voucher.md)
