## Parent

Codebase optimization & page-decomposition audit (2026-07-19) — see CLAUDE.md.

## What to build

`app/donor/page.tsx` inlines two ad-hoc `useQuery` calls that duplicate or bypass existing hook conventions:

- A query under key `["hospital-banks"]` calling `getAllHospitalBanks()` that duplicates `hooks/use-inventory.ts`'s `["inventory"]` query of the exact same function — two independent cache entries for identical data.
- A query for `getAllCityLabels()` with no dedicated hook and no extended `staleTime`, despite being effectively-static seeded reference data (Nigerian location hierarchy, seeded once).

### Fix

- Replace the inline hospital-banks query in `donor/page.tsx` with the existing `useInventory()` hook.
- Add a `use-location.ts` hook wrapping `getAllCityLabels()` with a long `staleTime` (e.g. `Infinity` or 24h).
- Audit `donor/page.tsx` for other direct server-action calls that should go through `hooks/` instead (per CLAUDE.md's "prefer adding a hook here over calling a server action with manual state" convention) and move them.

## Acceptance criteria

- [ ] `donor/page.tsx` no longer has a duplicate `["hospital-banks"]` query — uses `useInventory()`
- [ ] `getAllCityLabels()` has a dedicated hook with `staleTime` tuned for static data
- [ ] No functional regression in donor dashboard location/inventory display
- [ ] Direct server-action calls in `donor/page.tsx` routed through `hooks/` where a hook makes sense

## Blocked by

None — can start immediately
