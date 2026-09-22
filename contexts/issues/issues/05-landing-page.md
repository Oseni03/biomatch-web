---
id: 05
title: "Landing page carried over with donor and hospital CTAs"
type: AFK
prd: "§4.1"
---

# 05. Landing page carried over with donor and hospital CTAs

**Type:** AFK &nbsp;|&nbsp; **PRD:** §4.1

## What to build

Carry the existing marketing page into the new frontend and make sure it communicates the value proposition for both hospitals and donors, with a distinct call to action for each sign-up flow (donor sign-up and hospital registration). It is reachable before login, dark mode only, black and red palette.

## Acceptance criteria

- [x] Landing page is served by the new frontend and works without authentication
- [x] Separate, clearly labelled CTAs lead to donor sign-up and hospital registration
- [x] Copy reflects the PRD problem statement and the enterprise-grade feel required for the hospital audience
- [x] Page is responsive and dark-mode only
- [x] Signed-in users see a sensible route into their portal instead of sign-up CTAs

## Implementation (recorded 2026-09-22)

Landing sections already existed. Added the missing hospital-registration
target as a hospital mode on `/auth/signup?role=hospital` (contact + hospital
+ address/state/LGA fields, server-side geocode, org create via the Better
Auth organization plugin: creator becomes owner, status stays pending,
exactly one `HospitalVerification` opened — verified in
`tests/hospital-registration.test.ts`, including a client-cannot-self-approve
assert). `page.tsx` derives `portalHref` via `getSessionRole` and passes it
to Navbar/Hero/FinalCTA/Pricing, which render portal buttons for signed-in
users (this also fixed Navbar's `/${role}` link, which resolved to `/user`
for non-admins). Full verification form, pending-approval screen and
request-creation enforcement stay in issue 08.

## Blocked by

- [03 Walking skeleton: standalone backend, baseline schema, donor sign-up and sign-in](03-walking-skeleton.md)
