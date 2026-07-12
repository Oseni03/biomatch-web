## Parent

Redesign plan (from grilling session Q7, Q14).

## What to build

Redesign the landing page top section — Navbar and Hero — with the new design tokens, new CTA labels, and a bento icon-card illustration in the hero.

### Navbar changes

- Remove the existing gradient-heavy style (red/gradient logo, glassmorphism backgrounds)
- Use the new clean white/dark palette with `#C1121F` accent
- Update desktop nav links, mobile menu, and right-side CTA buttons to reflect the new CTA flow:
  - Primary CTA: "Find Blood" → links to `/auth/login`
  - Secondary CTA: "Become a Donor" → links to `/auth/signup`
- Keep the ThemeToggle, session-aware state (Console link when logged in, Sign Out)
- Add framer-motion entrance animation on mount (fade-in-down)

### Hero changes

- Replace the current gradient text, blur blobs, and pulse animation with clean flat design using the new palette
- Headline: "Digital Blood Banking for Everyone" (or equivalent bold statement)
- Supporting subtext explaining the platform's mission
- Primary CTA: "Find Blood" → `/auth/login` (large button)
- Secondary CTA: "Become a Donor" → `/auth/signup` (outline button)
- Replace the current 3-stat bar at the bottom with a bento grid of 4 icon-cards on the right side (desktop) showing: Blood Drop icon + count, Hospital Building icon + count, Donors icon + count, Ambulance icon + count. Each card has a micro-stat value and label
- On mobile, the bento grid stacks below the text
- Framer Motion fade/slide animations on mount

### Stats bar (embedded in hero)

- The current "8.7s / 14K+ / 92" stats stay but move into the bento icon-cards as micro-stats, not as a separate row

## Acceptance criteria

- [ ] Navbar shows "Find Blood" linking to `/auth/login` and "Become a Donor" linking to `/auth/signup`
- [ ] Hero shows a bento grid of 4 icon-cards with micro-stats on desktop, stacked on mobile
- [ ] No remaining gradient backgrounds, blur blobs, or glassmorphism in hero/navbar
- [ ] Framer Motion entrance animations play on page load
- [ ] Responsive: navbar collapses to hamburger menu on mobile

## Blocked by

- 12-design-foundation
