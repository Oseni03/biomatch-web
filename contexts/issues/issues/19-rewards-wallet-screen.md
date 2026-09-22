---
id: 19
title: "Rewards wallet screen"
type: AFK
prd: "§4.3, 9"
---

# 19. Rewards wallet screen

**Type:** AFK &nbsp;|&nbsp; **PRD:** §4.3, 9

## What to build

The donor's Rewards screen shows the current wallet balance and the ledger of credits and debits in naira (stored as integer kobo). It is read-only in this slice.

## Acceptance criteria

- [x] Balance and ledger history load from the backend and match stored values
- [x] Credits from completed donations appear with date and description
- [x] Amounts render correctly in naira from kobo with no rounding errors
- [x] Empty states for every new screen are designed and implemented (required by the PRD) (no rewards earned yet)

Implemented 2026-09-22: `servers/wallet.ts` (`getWalletBalance`, `getWalletLedger`,
consent-gated, paginated), `lib/money.ts` (`formatKoboToNaira`, integer arithmetic),
`hooks/use-wallet.ts`, `/donor/rewards` page + client (balance + ledger + empty state,
sidebar Rewards item), `tests/rewards-wallet.test.ts`. DB-backed tests could not run
here (Neon unreachable, `EAI_AGAIN`); formatting test passes, `tsc` clean for new files.
Follow-up: `servers/donations.ts` upserts `donorWallet` directly AND the
`trg_wallet_apply` trigger increments on ledger insert — balance may double-credit;
verify against a live DB and drop one of the two write paths.

## Blocked by

- [18 Donation completion: dual confirmation, cooldown and reward](18-donation-completion-cooldown-and-reward.md)
