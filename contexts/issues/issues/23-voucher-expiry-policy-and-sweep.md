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

- [x] Decision recorded (refund vs forfeit) and reflected in the Rewards screen copy
- [x] Sweep marks issued vouchers past expiry as expired and is idempotent
- [x] If refunding, exactly one reversal credit per expired voucher is written (tested)
- [x] Donor sees expired status in their voucher list

Decision (2026-09-22, user): FORFEIT. Unused vouchers past expiry lose their
value; no refund is written, so the "exactly one reversal" criterion is
vacuously satisfied — the forfeit test asserts balance and ledger are
untouched by the sweep.

Implemented 2026-09-22: `sweepExpiredVouchers()` in `servers/vouchers.ts`
(issued + past-expiry -> expired; re-runs match nothing), `GET
/api/cron/expire-vouchers` (bearer `CRON_SECRET`, same pattern as the other
crons), daily 02:00 schedule in `vercel.json`, forfeit explainer on the Rewards
screen (validity days from config), `tests/voucher-expiry.test.ts` (4 passing:
selective expiry + idempotent re-run, forfeit leaves balance/ledger untouched,
cron auth 401/401/200).

## Blocked by

- [21 Donor redeems a voucher and receives a code](21-donor-redeems-voucher.md)
