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

- [x] Redeeming creates the voucher and the ledger debit atomically
- [x] Overdraft is impossible; concurrent redemption test passes
- [x] Codes are unique and hard to guess
- [x] Donor sees issued vouchers with code, amount, merchant and expiry
- [x] Balance updates immediately
- [x] Empty states for every new screen are designed and implemented (required by the PRD) (no vouchers yet)

Implemented 2026-09-22: `servers/vouchers.ts` (`issueVoucher` with
idempotency-key replay, `listVouchersForDonor`, `listVouchersForAdmin`),
`hooks/use-vouchers.ts` + `hooks/use-merchants.ts`, redeem flow + voucher list
with empty states on the Rewards screen, `tests/voucher-issue.test.ts` (7
passing: issue + debit, overspend writes nothing, sequential + concurrent
double-submit yields one voucher/one debit, concurrent overdrafts leave exactly
one winner with balance 0, inactive merchant refused, donor + admin lists).
Codes are 12 chars from an unambiguous alphabet (`XXXX-XXXX-XXXX`),
`expiresAt` from `VOUCHER_VALIDITY_DAYS`, amounts stored kobo / displayed Naira.
Schema: `VoucherRedemption.idempotencyKey` (nullable, `@@unique([donorId,
idempotencyKey])`, migration `20260922083100_voucher_idempotency`).

Trigger rewrite (same session): the first voucher test run proved the old
`apply_wallet_entry()` (INSERT ... ON CONFLICT DO UPDATE) rejects EVERY debit —
Postgres validates CHECKs on the proposed row before conflict detection, so a
negative delta dies on `donor_wallets_balance_chk` even when the balance covers
it. Credits always worked, which hid the bug. Rewrote to UPDATE-first with an
INSERT + unique_violation fallback (migration
`20260922120000_wallet_trigger_update_first`, `biomatch_constraints.sql`
updated); the CHECK now evaluates the final balance, which is the intended
overdraft protection. Verified live: debit 100001 -> 50001, overdraft still
rejected, full slice-21 suite green after the change.

## Blocked by

- [19 Rewards wallet screen](19-rewards-wallet-screen.md)
- [20 Admin: merchant management](20-admin-merchant-management.md)
