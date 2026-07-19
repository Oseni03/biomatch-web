## Parent

Codebase optimization & page-decomposition audit (2026-07-19) — see CLAUDE.md.

## What to build

The literal status array `["accepted", "en_route", "arrived", "completed"]` is duplicated three times across `servers/emergency.ts` (`expandSearchRadius`, `respondToAlert`) and `servers/analytics.ts` (`getHospitalAnalytics`). Extract to an `ACTIVE_ALERT_STATUSES` constant in `lib/constants.ts` and use it in all three places.

Separately, `components/hospital/donor-directory.tsx` hardcodes eligibility math (`56 * 86400000`) instead of using `ELIGIBILITY_DAYS` from `lib/constants.ts` or `getEligibility()` from `lib/eligibility.ts`, both already used elsewhere (`servers/user.ts`, `donor/page.tsx`). Fix the drift risk.

## Acceptance criteria

- [ ] `ACTIVE_ALERT_STATUSES` constant added to `lib/constants.ts` and used in all 3 duplicated locations
- [ ] `donor-directory.tsx` uses `ELIGIBILITY_DAYS`/`getEligibility()` instead of the hardcoded 56-day literal
- [ ] No behavior change

## Blocked by

None — can start immediately
