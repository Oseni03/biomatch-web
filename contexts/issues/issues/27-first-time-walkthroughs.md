---
id: 27
title: "First-time walkthroughs for donors and hospitals"
type: AFK
prd: "§4.2, 4.3"
---

# 27. First-time walkthroughs for donors and hospitals

**Type:** AFK &nbsp;|&nbsp; **PRD:** §4.2, 4.3

## What to build

Show a first-time tutorial explaining how the platform works to new donors and to newly registered hospital users. It appears once, can be skipped, and can be replayed from settings. Completion is stored on the user.

## Acceptance criteria

- [x] Walkthrough shows on first sign-in only and stores completion
- [x] Can be skipped and replayed later
- [x] Separate content for donors and hospitals
- [x] Works on mobile and desktop widths

## Implementation notes

- Completion stored on the existing `User.onboardedAt` column (no schema change): `servers/walkthrough.ts` (`getWalkthroughState` with donor/hospital/admin audience via `getSessionRole`, `completeWalkthrough`, `resetWalkthrough`).
- `WalkthroughGate` mounted on `/donor` and the hospital dashboard; donor (4 steps) and hospital (5 steps) content in `WalkthroughDialog` (responsive `Dialog`, progress dots, Skip/Back/Next).
- Replay via `ReplayWalkthroughButton` on `/donor/profile` and `/hospital/settings`.
- Live verification pending: `tests/walkthrough.test.ts` (3 tests) is type-clean but 0/3 pass — every DB call fails with Neon `EAI_AGAIN` DNS during the outage window. Re-run when the network recovers.

## Blocked by

- [06 Donor profile: blood group, home pin, availability and donor code](06-donor-profile-and-donor-code.md)
- [08 Hospital registration and pending-approval state](08-hospital-registration-and-pending-state.md)
