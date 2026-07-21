## Parent

UI/UX + debugging report (grilling session, 2026-07-21) — see CLAUDE.md.

## What to build

Stakeholder feedback: the "BioMatch" logo/wordmark is "too tiny" and needs to feel "more authoritative." The wordmark is currently plain text (not a shared component — duplicated as inline `<span>BioMatch</span>` in `src/components/layout/sidebar.tsx` and `src/components/landing/navbar.tsx`), styled `font-serif italic font-semibold tracking-tight` (Newsreader, via `next/font/google` in `src/app/layout.tsx`).

Resolved during grilling: this is a deliberate editorial-style serif brand choice, not a default font — keep it serif rather than switching families. Address the "too tiny"/"not authoritative" complaint by increasing size and weight and dropping the italic, not by changing typeface.

Consider extracting the duplicated `<span>BioMatch</span>` markup into a shared `Wordmark`/`Logo` component in `src/components/brand/` while touching both call sites, so future size/weight changes don't require editing two files.

## Acceptance criteria

- [ ] Wordmark stays `font-serif` (Newsreader)
- [ ] Italic removed
- [ ] Font weight increased (e.g. `font-bold`/`font-black` rather than `font-semibold`)
- [ ] Size increased in both sidebar and navbar contexts
- [ ] Wordmark rendered from one shared component, not duplicated inline spans

## Blocked by

None
