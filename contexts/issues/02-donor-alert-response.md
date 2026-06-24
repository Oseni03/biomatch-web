## What to build

Donors receive in-app alerts for emergency requests matching their blood type and location. Donors can accept or decline in one tap. After accepting, donors can mark themselves as "en route" and later "arrived" at the hospital. Status changes propagate to the hospital dashboard in real time.

### Donor UI

- Alert notification panel on donor dashboard (persistent, not a toast — requires action)
- Each alert shows: blood type needed, hospital name, distance, accept/decline buttons
- After accepting: "Mark en route" and "Mark arrived" buttons
- Declined alerts collapse with a "declined" label
- Badge count of active alerts on sidebar

### Status state machine

alerted → (accepted → en_route → arrived) / declined

### Server actions

- `getDonorAlerts(donorId)` — returns active and recent alerts for the donor
- `respondToAlert(alertId, action: accept|decline)` — updates alert status, sets respondedAt
- `updateDonorStatus(alertId, status: en_route|arrived)` — transitions status forward

## Acceptance criteria

- [ ] Donor dashboard shows incoming alert with blood type, hospital name, distance
- [ ] Donor can accept or decline in one tap
- [ ] Accepting transitions status to "accepted"
- [ ] Declining collapses the alert with "declined" label
- [ ] After accepting, donor can mark "en route" then "arrived"
- [ ] Status cannot transition backward or skip steps
- [ ] Duplicate response (accept after decline) is rejected
- [ ] Badge count shows number of active (alerted/accepted/en route) alerts

## Blocked by

- Issue 01 — Emergency Request + Matching Engine
