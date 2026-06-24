## What to build

Hospital staff can mark a donation as confirmed when the donor arrives and donates. This updates the donor's lastDonationDate (preventing re-alerting for 56 days), increments lifetimeDonations, and records the donation event. The emergency request transitions to "fulfilled" status if all needed units are met.

### Server action — `confirmDonation(alertId)`

- Validates alert is in "arrived" status
- Updates User.lastDonationDate to now
- Increments Wallet.lifetimeDonations
- Awards points to donor wallet (via awardPoints)
- Updates EmergencyAlert status to "completed"
- If all units for the request are fulfilled, marks EmergencyRequest as "fulfilled"

### Hospital UI

- "Mark donation complete" button in request status panel on each arrived donor row
- Confirmation dialog before action
- Toast on success/failure

### Tests

- Confirmation updates lastDonationDate correctly
- Confirmation increments lifetimeDonations
- Points are awarded to wallet
- Request is marked fulfilled when all units met
- Duplicate confirmation is rejected

## Acceptance criteria

- [ ] Hospital staff can mark an arrived donor's donation as confirmed
- [ ] Confirmation updates lastDonationDate to current timestamp
- [ ] Confirmation increments donor's lifetimeDonations
- [ ] Donor receives points for the donation
- [ ] Request status transitions to "fulfilled" when all units are met
- [ ] Duplicate confirmation on the same alert is rejected
- [ ] Confirmation is not possible unless donor status is "arrived"
- [ ] Confirmation shows success toast / error toast as appropriate
- [ ] All state changes are atomic (all-or-nothing)

## Blocked by

- Issue 02 — Donor Alert & Response (In-App)
