# Plan: Replace Donor Dashboard Redirect with Profile-Incomplete Notification Bar

## Goal

Instead of automatically redirecting unauthenticated-profile donors from `/donor` to `/donor/health-profile?required=1`, show a notification bar at the top of the donor dashboard directing them to complete their profile. The dashboard should remain accessible.

## Current Behavior

- `src/app/donor/page.tsx` (server component) calls `isDonorProfileComplete(user)` and, if false, performs a hard server-side `redirect("/donor/health-profile?required=1")` before any client code runs.
- `src/app/donor/health-profile/health-profile-client.tsx` reads the `?required=1` query param and renders an informational banner.

## Proposed Changes

### 1. Remove server-side redirect in `src/app/donor/page.tsx`

- Delete the `if (!(await isDonorProfileComplete(user))) { redirect(...) }` block (lines 18-21).
- Compute `const profileComplete = await isDonorProfileComplete(user)` instead.
- Pass `profileComplete` as a prop to `<DonorDashboardClient profileComplete={profileComplete} />`.

### 2. Update `src/app/donor/donor-dashboard-client.tsx`

- Accept a new prop: `profileComplete: boolean`.
- When `!profileComplete`, render a notification banner near the top of the dashboard (before the greeting or as the first banner item) with:
  - A clear directive message: "Complete your donor profile to unlock emergency match requests."
  - A `Link` to `/donor/health-profile` styled as a button or inline action.
- Use the existing banner visual pattern (rounded-2xl border, icon, text) consistent with `VerificationStatusBanner` and `EligibilityBanner`.

### 3. Clean up `src/app/donor/health-profile/health-profile-client.tsx`

- Remove the `useSearchParams` import and `profileRequired` logic (lines 4, 41-42, 206-210).
- Remove the conditional banner that was only shown when `?required=1` was present.
- The health profile page no longer needs to handle the redirect param.

## Styling Reference

Follow the existing banner component conventions in `src/components/donor/`:
- `VerificationStatusBanner` — `bg-card border border-border rounded-2xl p-4 flex items-start gap-3`
- `EligibilityBanner` — `bg-status-ok-bg border border-status-ok/20 rounded-2xl p-4 flex items-center gap-3`

For the profile-incomplete banner, use a brand/warning palette (e.g., `bg-status-low-bg border-status-low/20`) to signal action needed without blocking access.

## Validation

- Run `npx tsc --noEmit` to verify types.
- Run `npm run lint` to verify formatting.
- Manual check: visit `/donor` with an incomplete profile — dashboard loads and banner appears; click through to `/donor/health-profile` and confirm the form works.
- Manual check: visit `/donor/health-profile` directly — no `?required=1` banner renders.

## Out of Scope

- No changes to `isDonorProfileComplete` logic or the completeness criteria.
- No changes to the health profile form or validation.
- No changes to sidebar navigation or auth guards.
