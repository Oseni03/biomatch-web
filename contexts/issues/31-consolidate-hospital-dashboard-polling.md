## Parent

Codebase optimization & page-decomposition audit (2026-07-19) — see CLAUDE.md.

## What to build

Hospital-side hooks poll independently: `use-inventory.ts` (10s `refetchInterval`), plus three separate 15s polls and one 5s poll across `use-emergency-requests.ts`. When multiple of these mount simultaneously on one hospital dashboard view, that's up to 4 independent poll loops hitting the DB every 5-15s per open tab.

Consolidate onto a shared, coarser interval where the UX tolerates it, rather than each hook picking its own cadence independently.

## Acceptance criteria

- [ ] Number of independent poll loops active on a single hospital dashboard view reduced (target: 1-2 instead of 4)
- [ ] Each remaining interval reviewed and set no faster than the UX it serves actually needs
- [ ] A note is left pointing to `contexts/phase-3-realtime.md` (SSE inventory updates) as the longer-term replacement for polling, so that larger effort isn't duplicated by this ticket

## Blocked by

None — can start immediately
