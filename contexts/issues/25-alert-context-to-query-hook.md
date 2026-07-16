## Parent

Simplification pass (grilling session, 2026-07-16) — see AGENTS.md / CLAUDE.md.

## What to build

The donor dashboard (`app/donor/page.tsx`) and sidebar (`components/layout/sidebar.tsx`) both need the current alert badge count. Today that's threaded through a React Context (`AlertCountProvider` / `useAlertCount` in `lib/alert-context.tsx`) with the count computed once in the page and passed down as a prop into the provider. Replace it: the sidebar calls the same React Query-backed alerts hook directly (sharing the existing query cache, so no duplicate fetch), and `lib/alert-context.tsx` is deleted.

## Acceptance criteria

- [ ] `lib/alert-context.tsx` deleted
- [ ] Sidebar badge count reads from a React Query hook, not a context value
- [ ] No duplicate network fetch introduced — confirm the sidebar's hook call shares a query key/cache with whatever the donor dashboard already uses for alerts
- [ ] Badge count still updates correctly when alerts change

## Blocked by

None — can start immediately
