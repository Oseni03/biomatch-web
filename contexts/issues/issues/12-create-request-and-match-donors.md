---
id: 12
title: "Create blood request and match donors (in-app)"
type: AFK
prd: "§5.3, 7, 4.3"
---

# 12. Create blood request and match donors (in-app)

**Type:** AFK &nbsp;|&nbsp; **PRD:** §5.3, 7, 4.3

## What to build

An authorised member of an approved hospital creates a blood request: blood group needed, units required and location (defaulting to the hospital's location). All requests are urgent; there is no urgency tiering. Patient identity is never collected for donors; an optional private internal reference stays hospital-side.

On creation the backend finds every eligible donor and notifies them all at once: blood group compatible, verified, not restricted, available, out of cooldown, not banned, within the starting radius. Distance uses the last-known location if recent, otherwise the home pin. Phone verification does NOT affect matching. Each match is recorded and an in-app notification is created. Donors get a Requests Nearby list and a Notification Inbox; both show only blood type needed and hospital name and location.

## Acceptance criteria

- [ ] Only approved hospitals and members with the create-request permission can create requests (tested)
- [ ] Matching honours compatibility, verification, restriction, availability, cooldown and radius, and prefers fresh last-known location over the home pin
- [ ] Donors without a verified phone are matched and receive the in-app notification
- [ ] One match record per donor per request; all matched donors are notified simultaneously
- [ ] Requests Nearby list and Notification Inbox screens work with read/unread state
- [ ] API payloads to donors never contain patient or internal hospital fields (tested)
- [ ] Unit tests cover compatibility, distance, freshness, cooldown and exclusion rules
- [ ] The hospital sees the created request with the number of donors notified
- [ ] Empty states for every new screen are designed and implemented (required by the PRD) (no requests nearby, empty inbox)

## Blocked by

- [06 Donor profile: blood group, home pin, availability and donor code](06-donor-profile-and-donor-code.md)
- [09 Admin: hospital approval and management](09-admin-hospital-approval.md)
- [11 Donor screening recorded by partner hospital staff](11-donor-screening-by-donor-code.md)
