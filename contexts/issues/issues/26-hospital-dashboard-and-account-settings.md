---
id: 26
title: "Hospital dashboard and account settings"
type: AFK
prd: "§4.2"
---

# 26. Hospital dashboard and account settings

**Type:** AFK &nbsp;|&nbsp; **PRD:** §4.2

## What to build

Port the hospital dashboard to the new backend: overview of active requests, recent donations and key metrics, consistent with the enterprise-grade feel the PRD requires. Add Account Settings: organisation profile (editable by authorised staff), per-user notification preferences by channel, and account management such as changing password.

## Acceptance criteria

- [ ] Dashboard shows active requests, recent donations and key metrics from backend data
- [ ] Organisation profile edits require the organisation-update permission
- [ ] Notification preferences by channel are saved and respected by delivery (slice 17)
- [ ] User can change their password and sign out of other sessions
- [ ] Empty states for every new screen are designed and implemented (required by the PRD)

## Blocked by

- [18 Donation completion: dual confirmation, cooldown and reward](18-donation-completion-cooldown-and-reward.md)
