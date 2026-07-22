## Parent

Simplification pass (grilling session, 2026-07-16), split off from issue #22.

Status: ✅ done (2026-07-22) — see AGENTS.md Simplification Issues table.

## What to build

Not for immediate implementation — logged for future scoping. Make dark mode the only theme (drop the light palette currently tuned for a `#FAFAF8` warm-white background) rather than letting users toggle between light and dark.

Requires a full contrast/accessibility audit of the existing brand redesign (issues #12-18): the `#C1121F` brand red, `shadow-card`/`shadow-brand` values, and every landing/dashboard component restyled during the redesign were validated against a light background and need re-validation against dark.

## Why this was not ready-for-agent (resolved 2026-07-22)

This was new design work requiring a human decision (target dark palette, contrast targets), not a cut of unnecessary complexity. The user made that decision directly: refine the existing (unused) `.dark` tokens in `globals.css` rather than invent a new brand palette, remove light mode and the toggle entirely, and apply it app-wide in one pass.

## What was implemented

- `globals.css` `:root` now holds a single refined dark palette (previously light-mode values); the old `.dark` class block was folded in and removed as a separate selector. `ink` was redefined as the darkest structural-chrome tier (was flipped to near-white in the old unused `.dark` block, which broke the sidebar/footer contrast hierarchy) — the hierarchy is now `ink` (4% L, chrome) < `paper`/background (7%) < `card` (11%) < `popover` (13%) < `secondary`/`muted` (15-16%).
- `next-themes` `ThemeProvider` and the `theme-provider.tsx` wrapper were removed (no toggle existed in the UI already — issue #22 had removed the visible switch, but the provider/storageKey scaffolding remained); `<html>` now hardcodes the `dark` class permanently so shadcn's baked-in `dark:` utility variants (badge, switch, select, avatar, input, etc.) resolve correctly instead of silently going dead.
- Hardcoded light-mode-only classes found via full-repo grep were fixed: `button.tsx`'s `secondary` variant (`bg-white` → `bg-card`), a marketing feature-row mockup chip (`bg-white` → `bg-card`), plus a dead `dark:divide-zinc-800` on the donation-history table now activates correctly.
- `tailwind.config.ts`: removed an unused, hardcoded-hex `dark: { bg, surface, border }` color block; re-tuned `boxShadow.card`/`card-hover`/`brand` from light-background rgba values to dark-appropriate depth shadows + a red brand glow, and added a `glow` shadow token.
- Added global premium polish: theme-colored `::selection`, a thin custom scrollbar (`scrollbar-color`/`-webkit-scrollbar-*`) matching the dark palette.

## Acceptance criteria

- [x] Dark palette decided and documented (owner: human, 2026-07-22 — refine-existing-tokens direction)
- [x] Contrast/accessibility spot-check of brand red + shadows against the new dark background (foreground kept at 96% L off-white, not stark white; status colors bumped in lightness for AA-ish contrast on dark bg-tints)
- [x] All redesigned components (issues #12-18) re-validated against the dark palette (token-driven, verified via repo-wide grep for non-token color classes; no dev-server visual QA was run this session)
- [x] Light theme and toggle fully removed — single `:root` palette, no `.dark` block, no theme switch

## Blocked by

None technically, but should not be picked up until a design decision is made — see "Why this is not ready-for-agent" above.
