## Parent

UI/UX + debugging report (grilling session, 2026-07-21) — see CLAUDE.md.

## What to build

Stakeholder feedback: the app "feels too flat/plain white." `DESIGN_SYSTEM.md` already defines an `ink` token (near-black navy, `--ink: 247 47% 7%`) but documents it as reserved for dark marketing sections and the footer only — it isn't used in dashboards today.

Resolved during grilling: broaden `ink` into a structural chrome color used consistently app-wide (both donor and hospital portals, and the marketing site), applied to:
- Sidebar background
- Page headers / top bars
- Card borders and section dividers

Main content areas keep light `paper`/`cream` backgrounds. `brand` (red) stays reserved for accents, buttons, active/status states — not turned into a second background color. This is a real design-system boundary change, not a one-page tweak: update `DESIGN_SYSTEM.md` itself to reflect the new scope for `ink` once implemented, since the doc's current text will otherwise actively mislead the next session.

This is distinct from issue #26 (dark-only theme / removing the light-mode toggle entirely) — that issue is about eliminating light mode; this one is about using the existing `ink` token more broadly while both light and dark modes still exist.

## Acceptance criteria

- [ ] Sidebar uses `ink` background across donor and hospital portals
- [ ] Page headers/top bars use `ink`
- [ ] Card borders / section dividers use `ink`
- [ ] Main content areas remain light (`paper`/`cream`) — no dark content backgrounds
- [ ] `brand` (red) usage unchanged in scope (accents/buttons/status only)
- [ ] `DESIGN_SYSTEM.md`'s description of `ink`'s scope updated to match
- [ ] No new hardcoded hex values introduced — reuse existing tokens per `DESIGN_SYSTEM.md`'s existing guidance

## Blocked by

None
