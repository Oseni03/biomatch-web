---
id: 18
title: "Donation completion: dual confirmation, cooldown and reward"
type: AFK
prd: "§5.3, 5.4, 9"
---

# 18. Donation completion: dual confirmation, cooldown and reward

**Type:** AFK &nbsp;|&nbsp; **PRD:** §5.3, 5.4, 9

## What to build

After the donation happens, the donor and the hospital each confirm completion in the app (the hospital needs the confirm-donation permission; this closes today's gap of no hospital-side confirm UI). When both have confirmed, one transaction completes the donation, records the last donation date, starts the donor's cooldown (90 days, from backend config), credits the donor's wallet with the reward through the ledger, and completes the match. The reward can only ever be granted once per donation. During cooldown the donor can log in and view everything, but receives no alerts and cannot accept new requests.

## Acceptance criteria

- [ ] Donor and hospital confirm independently; completion happens only when both have confirmed
- [ ] Completion sets cooldown until 90 days later and the last donation date
- [ ] A single reward ledger credit is created per donation; retries or concurrent calls never double-credit (tested)
- [ ] Donors in cooldown are excluded from matching and cannot accept (tested); they can still browse history and rewards
- [ ] Both parties are notified of completion
- [ ] Donation History screen for donors lists all donations (kept indefinitely); hospital History reflects the outcome
- [ ] Empty states for every new screen are designed and implemented (required by the PRD) (no donations yet)

## Blocked by

- [13 Donor accepts with acceptances capped at units needed, plus hospital Donor View](13-donor-accept-with-unit-cap-and-donor-view.md)
