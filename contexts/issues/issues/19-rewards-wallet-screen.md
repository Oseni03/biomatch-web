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

- [ ] Balance and ledger history load from the backend and match stored values
- [ ] Credits from completed donations appear with date and description
- [ ] Amounts render correctly in naira from kobo with no rounding errors
- [ ] Empty states for every new screen are designed and implemented (required by the PRD) (no rewards earned yet)

## Blocked by

- [18 Donation completion: dual confirmation, cooldown and reward](18-donation-completion-cooldown-and-reward.md)
