## What to build

Donors receive HMO coverage as a reward for confirmed donations. Basic HMO plan is unlocked after the first confirmed donation. The plan upgrades after every 3 cumulative confirmed donations (3rd, 6th, 9th, etc.). The system integrates with an external HMO provider API to enroll or upgrade donors.

### HITL Decisions Required

1. **HMO partner**: Which HMO provider is the launch partner? API contract details (auth, endpoints, enrollment payloads)
2. **Coverage tiers**: Exact benefit details for basic vs upgraded plans
3. **Enrollment flow**: Does the donor need to provide additional info (NIN, etc.) for HMO enrollment?

### Schema additions

- `User.hmoTier` (enum: none/basic/upgraded, default: none)
- `HmoEnrollment` — id, userId, tier (hmoTier), providerEnrollmentId (String?), enrolledAt, upgradedAt?

### Server actions

- `checkAndUnlockHmoCoverage(userId)` — called after donation confirmation
  - Calculates milestone: lifetimeDonations === 1 → basic, lifetimeDonations % 3 === 0 → upgrade
  - If milestone reached, calls external HMO provider API to enroll/upgrade
  - Records HmoEnrollment record
  - Updates User.hmoTier
  - Returns updated tier info
- `getDonorHmoStatus(userId)` — returns current tier and next milestone

### Donor UI

- Wallet/perks page shows current HMO tier with clear next milestone
- "Tier 1 — Basic HMO" or "Tier 2 — Upgraded HMO"
- Progress indicator: "X donations until next upgrade"
- Link to HMO provider portal (if available)

### Tests

- 1st donation → basic enrollment event emitted
- 3rd donation → upgrade event emitted
- 6th donation → upgrade event emitted
- Milestone check is idempotent (doesn't re-enroll if already at that tier)

## Acceptance criteria

- [ ] After 1st confirmed donation, donor's HMO tier is set to "basic"
- [ ] After 3rd confirmed donation, donor's HMO tier upgrades to "upgraded"
- [ ] After 6th, 9th, etc., tier stays at "upgraded" (no further upgrade tiers in V1)
- [ ] External HMO provider API is called on milestone reach
- [ ] API call failure does not block the donation confirmation flow (graceful degradation)
- [ ] Donor can view current HMO tier and next milestone in wallet/perks page
- [ ] Enrollment is idempotent — re-checking same milestone doesn't re-enroll

## Blocked by

- Issue 06 — Donation Confirmation
