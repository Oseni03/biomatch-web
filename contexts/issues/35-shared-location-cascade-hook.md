## Parent

Codebase optimization & page-decomposition audit (2026-07-19) — see CLAUDE.md.

## What to build

`app/donor/health-profile/page.tsx` and `app/auth/signup/page.tsx` both implement the identical region→state→city cascading-select logic (4 `useEffect`s each, calling `getLocations(null)` — confirmed via grep this call only appears in these two files) independently. Extract a single `useLocationCascade()` hook under `hooks/` that owns the region/state/city fetch chain and selection state, and use it in both places.

## Acceptance criteria

- [ ] `useLocationCascade()` hook added under `hooks/`
- [ ] Both the health-profile page and the signup page use it instead of their own duplicated `useEffect` chains
- [ ] No behavior change in either form's location cascade UX

## Blocked by

None — can start immediately
