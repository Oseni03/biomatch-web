---
id: 28
title: "NDPR erasure: account deletion"
type: AFK
prd: "§8"
---

# 28. NDPR erasure: account deletion

**Type:** AFK &nbsp;|&nbsp; **PRD:** §8

## What to build

A user can request deletion of their account. After confirmation the account is anonymised: name, contact details, credentials, location and health-adjacent profile data are wiped, sessions and memberships are removed, consent rows are marked revoked, and the user can no longer sign in. Donation and request history remain as de-identified records so hospital records and platform metrics stay intact. Hospital owners must transfer ownership first.

## Acceptance criteria

- [ ] Deletion requires confirmation and current credentials
- [ ] After deletion no personal data remains on the user, donor profile or screening notes (tested)
- [ ] Donation, request and ledger history remain, de-identified
- [ ] The user's sessions end and sign-in is impossible
- [ ] Sole owners of a hospital are blocked with guidance to transfer ownership
- [ ] Erasure is audit logged

## Blocked by

- [04 NDPR consent gate](04-ndpr-consent-gate.md)
- [18 Donation completion: dual confirmation, cooldown and reward](18-donation-completion-cooldown-and-reward.md)
