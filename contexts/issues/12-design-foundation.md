## Parent

Redesign plan (from grilling session Q1-Q15).

## What to build

Install and configure the foundational design dependencies — Geist font, framer-motion — and update the global design tokens to the new `#C1121F` palette. This slice touches no page logic or components; it's the base every other redesign slice builds on.

### Changes

- Install `geist` npm package and `framer-motion`
- Replace `Inter` with `Geist` in `app/layout.tsx` (via `next/font`)
- Update `globals.css`: replace all Prospeo HSL variables (`--background`, `--primary`, etc.) with the new palette centered on `#C1121F` (`hsl(356, 83%, 41%)`). Update both `:root` and `.dark` blocks
- Update `tailwind.config.ts`: replace `brand`, `dark` color tokens with new palette values; keep `fontFamily` pointing at Geist via CSS variable
- Remove `components/prospeo/BlobDecoration.tsx` and its barrel export
- Remove obsolete Prospeo utility classes if any exist in globals or tailwind config
- Remove `@tremor/react` if unused (optional — check for imports first)

## Acceptance criteria

- [ ] `npm run dev` starts without errors
- [ ] `globals.css` has no remaining references to old Prospeo HSL values
- [ ] Geist loads as the primary font (visible in browser DevTools → computed font-family)
- [ ] `framer-motion` is importable from any component
- [ ] Old brand color `#E8342A` no longer appears in globals.css or tailwind.config.ts

## Blocked by

None — can start immediately.
