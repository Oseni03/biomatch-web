## Parent

Codebase optimization & page-decomposition audit (2026-07-19) — see CLAUDE.md.

## What to build

`app/hospital/donor-finder/page.tsx`, `components/hospital/emergency-history.tsx`, and `app/donor/history/page.tsx` each hand-roll their own prev/next pagination controls (donor-finder additionally has windowed page-number logic). Extract one `components/ui/pagination-controls.tsx` (wrapping shadcn's `Pagination` primitives if suitable) taking `page`/`totalPages`/`onPageChange`, and use it in all three.

## Acceptance criteria

- [ ] Single shared pagination component added
- [ ] All 3 call sites use it instead of hand-rolled controls
- [ ] Windowed page-number behavior (from donor-finder) preserved where wanted, or documented as an opt-in variant

## Blocked by

None — can start immediately
