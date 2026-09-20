---
id: 23
title: "Voucher expiry policy and sweep"
type: HITL
prd: "§9"
---

# 23. Voucher expiry policy and sweep

**Type:** HITL &nbsp;|&nbsp; **PRD:** §9

## What to build

Decide what happens to vouchers that expire unused (refund the donor to their wallet, or forfeit), record the decision, then implement a scheduled sweep that marks expired vouchers. If the decision is to refund, a reversal credit is written through the ledger.

## Acceptance criteria

- [ ] Decision recorded (refund vs forfeit) and reflected in the Rewards screen copy
- [ ] Sweep marks issued vouchers past expiry as expired and is idempotent
- [ ] If refunding, exactly one reversal credit per expired voucher is written (tested)
- [ ] Donor sees expired status in their voucher list

## Blocked by

- [21 Donor redeems a voucher and receives a code](21-donor-redeems-voucher.md)
