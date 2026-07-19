## Parent

Codebase optimization & page-decomposition audit (2026-07-19) — see CLAUDE.md.

## What to build

`matchDonors()` in `servers/emergency.ts` fetches all donors nationwide matching blood group + eligibility with no location bound at the DB query level, then scores each one via `scoreDonorProximity()` / `getCommonAncestorDepth()`, which calls `getAncestors()` in `servers/location.ts` — a `while` loop doing one sequential `findUnique` per hierarchy level, run twice per donor. For a hospital in a populated area this means thousands of donors times up to ~8 sequential DB round trips each, on every `createEmergencyRequest()` and every `expandSearchRadius()` call. This is the single biggest performance risk in the codebase.

### Fix

- Push a location filter into the initial `prisma.user.findMany` in `matchDonors()` (e.g. restrict to donors whose `locationId` falls within the hospital's region/state) so far-away donors never reach the scoring loop.
- Replace the per-level sequential `getAncestors()` walk with either (a) loading the full (small, seeded, static) `Location` table once into memory and resolving ancestors from that map, or (b) a single recursive SQL CTE.
- `expandSearchRadius()` re-runs the same nationwide `matchDonors()` scoring — should benefit automatically once the above is fixed. Also replace its `alreadyAlertedIds.includes(...)` Array scan with a `Set`.

## Acceptance criteria

- [ ] `matchDonors()` no longer fetches every eligible donor nationwide — DB-level location prefilter added
- [ ] `getAncestors()` no longer does N sequential `findUnique` calls per donor — resolved from an in-memory/cached location map or single query
- [ ] `expandSearchRadius()` uses a `Set` for `alreadyAlertedIds` lookups
- [ ] Existing proximity ordering (same-city > same-state > same-region, 3-level scale from issue #19) unchanged
- [ ] Emergency request creation and radius expansion produce the same donor match results as before, just faster

## Blocked by

None — can start immediately
