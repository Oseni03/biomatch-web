## Parent

Simplification pass (grilling session, 2026-07-16) — see AGENTS.md / CLAUDE.md.

## What to build

Donor-hospital proximity matching and emergency radius expansion use a 3-level Nigerian location hierarchy (region → state → city) instead of 4, dropping `area`. Emergency radius auto-expansion collapses from 5 tiers (5/10/15/20/25km) to 3 (5/15/25km), with the depth-to-radius threshold mapping in `expandSearchRadius()` updated to match the new 3-level depth scale.

Multi-region matching (the reason the hierarchy exists at all) is unaffected — only the finest, unused "area" granularity and the excess radius tiers go.

### Schema & data

- Remove `area` from `LocationType` enum in `prisma/schema.prisma` (migration required)
- Update `prisma/seed.ts` to stop seeding area-level rows

### Server logic

- `getCommonAncestorDepth()` / `scoreDonorProximity()` in `servers/location.ts` — adjust depth scale to 3 levels (city=3, state=2, region=1)
- `expandSearchRadius()` in `servers/emergency.ts` — update the hardcoded radius↔depth threshold mapping (currently `<=5km→depth 4, <=15km→depth 3, else→depth 1`) to the new 3-level scale
- `lib/radius-expansion.ts` — change `EXPANSION_INCREMENT` from `5` to `10` (yields 5/15/25km tiers instead of 5/10/15/20/25km)

### UI

No direct `"area"` string references were found outside of one historical migration file, so this is mostly a data/server-layer change — no location dropdown currently exposes a 4th level.

## Acceptance criteria

- [ ] `LocationType` enum has 3 values (region/state/city), no `area`
- [ ] Seed data no longer creates area-level location rows
- [ ] `scoreDonorProximity()` / `getCommonAncestorDepth()` return depth values consistent with the 3-level hierarchy
- [ ] `expandSearchRadius()` threshold mapping matches the new depth scale
- [ ] Emergency radius expansion tiers are 5km → 15km → 25km (3 steps, not 5)
- [ ] Cross-region and cross-state donor matching still works correctly (same-city > same-state > same-region ordering preserved)

## Blocked by

None — can start immediately
