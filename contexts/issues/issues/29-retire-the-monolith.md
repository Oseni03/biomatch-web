---
id: 29
title: "Retire the monolith's server actions and old schema"
type: AFK
prd: "§2"
---

# 29. Retire the monolith's server actions and old schema

**Type:** AFK &nbsp;|&nbsp; **PRD:** §2

## What to build

Remove everything the rebuild replaces so the frontend is genuinely frontend-only: the Prisma client and server actions that talk to the database, the old prototype models and concepts (hospital bank inventory, point-based wallet, urgency tiers, en-route/arrived alert states), and any dead code. Rewrite the architecture and current-structure documents to describe the new system.

## Acceptance criteria

- [ ] The frontend has no database dependency and no server actions with database access
- [ ] Old models and unused code are removed; nothing references them
- [ ] Architecture and structure docs describe the new system
- [ ] An end-to-end test of the core loop passes: register and approve a hospital, screen a donor, create a request, accept, confirm both sides, reward credited

## Blocked by

- [18 Donation completion: dual confirmation, cooldown and reward](18-donation-completion-cooldown-and-reward.md)
- [24 Admin: donor management](24-admin-donor-management.md)
- [26 Hospital dashboard and account settings](26-hospital-dashboard-and-account-settings.md)
