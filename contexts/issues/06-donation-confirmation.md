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

## ✅ Completed

| Deliverable | Files |
|---|---|
| `confirmDonation` server action (atomic Prisma transaction) | `servers/emergency.ts` |
| `useConfirmDonation` hook (toast + query invalidation) | `hooks/use-emergency-requests.ts` |
| "Confirm Donation" button on arrived donor rows in LiveStatusPanel | `components/hospital/live-status-panel.tsx` |
| Confirmation dialog via `window.confirm` | `components/hospital/live-status-panel.tsx` |

## Acceptance criteria

- [x] Hospital staff can mark an arrived donor's donation as confirmed
- [x] Confirmation updates lastDonationDate to current timestamp
- [x] Confirmation increments donor's lifetimeDonations
- [x] Donor receives points for the donation (100 points)
- [x] Request status transitions to "fulfilled" when all units are met
- [x] Duplicate confirmation on the same alert is rejected (status must be "arrived")
- [x] Confirmation is not possible unless donor status is "arrived"
- [x] Confirmation shows success toast / error toast as appropriate
- [x] All state changes are atomic (wrapped in `prisma.$transaction`)

## Blocked by

- Issue 02 — Donor Alert & Response (In-App)
