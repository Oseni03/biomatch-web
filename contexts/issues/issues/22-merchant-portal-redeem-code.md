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

- [ ] Only active staff of a merchant can access the portal and only for their merchant
- [ ] Valid codes redeem exactly once; a second attempt fails (tested with concurrent requests)
- [ ] Expired, used, unknown and other-merchant codes all give the same generic failure
- [ ] Redeeming records who redeemed and when; audit logged
- [ ] Redemption history lists the merchant's redemptions
- [ ] Merchant staff pass the same consent gate as other users
- [ ] Empty states for every new screen are designed and implemented (required by the PRD) (no redemptions yet)

## Blocked by

- [21 Donor redeems a voucher and receives a code](21-donor-redeems-voucher.md)
