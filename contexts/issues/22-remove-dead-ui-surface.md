## Parent

Simplification pass (grilling session, 2026-07-16) — see AGENTS.md / CLAUDE.md.

## What to build

Three small, independent removals bundled together since none touch shared code:

1. **Blood-drive stub** — `/hospital/blood-drive` route, its stub page, and its sidebar nav link are removed. No scheduled issue currently builds this feature; re-add the route when one does.
2. **Dead scroll-reveal hook** — `src/hooks/use-scroll-reveal.ts` deleted. Confirmed zero imports anywhere in `src/` (superseded by framer-motion `whileInView`, used across the landing redesign, issues #13-15).
3. **Dark-mode toggle** — manual light/dark toggle control removed from `navbar.tsx` and `sidebar.tsx` (`theme-toggle.tsx` deleted or unused). `next-themes` stays wired and continues to follow the user's OS preference automatically. This is **not** a dark-only redesign — see issue #26 (backlog) for that.

## Acceptance criteria

- [x] `/hospital/blood-drive` route, page, and nav link removed
- [x] `use-scroll-reveal.ts` deleted
- [x] No visible theme toggle control in navbar or sidebar
- [x] App still renders correctly following OS light/dark preference (no manual toggle, but `next-themes` still functions)

## Blocked by

None — can start immediately
