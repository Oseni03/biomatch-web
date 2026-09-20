---
id: 21
title: "Donor redeems a voucher and receives a code"
type: AFK
prd: "§9"
---

# 21. Donor redeems a voucher and receives a code

**Type:** AFK &nbsp;|&nbsp; **PRD:** §9

## What to build

From the Rewards screen a donor picks an active merchant and an amount up to their balance. In one transaction the backend creates a voucher redemption with a unique code and an expiry (validity from config) and writes a negative ledger entry linked to it. The wallet can never go negative, even under simultaneous requests. The donor sees their issued vouchers with code, merchant, amount and expiry.

## Acceptance criteria

- [ ] Redeeming creates the voucher and the ledger debit atomically
- [ ] Overdraft is impossible; concurrent redemption test passes
- [ ] Codes are unique and hard to guess
- [ ] Donor sees issued vouchers with code, amount, merchant and expiry
- [ ] Balance updates immediately
- [ ] Empty states for every new screen are designed and implemented (required by the PRD) (no vouchers yet)

## Blocked by

- [19 Rewards wallet screen](19-rewards-wallet-screen.md)
- [20 Admin: merchant management](20-admin-merchant-management.md)
