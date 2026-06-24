## What to build

Donors can view their full donation history, monthly local emergency statistics, and an eligibility countdown showing when they can next donate. Re-eligibility notifications are triggered after the 56-day deferral period ends.

### Donor UI — History & Impact Page

- Donation history list: date, hospital, blood group, points earned
- Monthly stats: "X emergencies near you this month", "Y donors needed"
- Eligibility countdown: "You can donate again in 34 days" or "You are eligible to donate now"
- Personal impact: total donations, total points, estimated lives impacted

### Server actions

- `getDonorHistory(userId)` — returns paginated list of completed alerts/donations with metadata
- `getLocalDemandStats(userId)` — returns monthly emergency counts for donor's location area

### Re-eligibility notification

- Scheduled check (or on login): if lastDonationDate is exactly 56 days ago or more, show in-app banner: "You're eligible to donate again!"
- Push notification (if S5 is complete) sent when donor becomes re-eligible

## Acceptance criteria

- [ ] Donor can view full donation history with date, hospital, blood group, points
- [ ] Donor can see monthly emergency counts near their location
- [ ] Eligibility countdown shows days until next eligible date
- [ ] When eligible, banner/notification informs donor they can donate again
- [ ] Re-eligibility check runs on login and via scheduled task
- [ ] Personal impact stats (total donations, points, lives) are displayed
- [ ] History is paginated

## Blocked by

- Issue 06 — Donation Confirmation
- Issue 08 — Donor Registration Enhancements (for location-based demand stats)
