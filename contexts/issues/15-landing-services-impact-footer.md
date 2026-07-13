## Parent

Redesign plan (from grilling session Q8, Q10).

## What to build

Restyle the remaining landing page sections — Services (features grid), Impact (dark stats section), Join CTA, and Footer — with the new design tokens. No functional changes, only visual restyling.

### Services section

- Rebuild feature cards with the new palette: clean white cards, `#C1121F` accent, soft borders, `rounded-xl`
- Replace gradient icon backgrounds with flat lucide icons in brand color
- Keep all 6 existing feature items and descriptions
- Framer-motion staggered scroll reveal
- Remove all glassmorphism and gradient backgrounds

### Impact section

- Redesign the dark section with the new dark mode palette (neutral dark charcoal, not gradient)
- Keep the 3 impact metric cards (2.3x Faster Response, 94% Donor Activation, 99.2% Match Accuracy)
- Restyle cards: clean flat design with subtle border, muted backgrounds, brand accent
- Restyle the CTA sub-section ("Ready to save lives?" card) with new tokens
- Framer-motion scroll reveal
- Remove animated grid background and pulsing blurs

### Join section

- Uncomment the `<Join />` component in `app/page.tsx` and restyle it with the new palette
- Clean flat dark design with clear CTAs

### Footer section

- Restyle with the new palette: clean dark background, brand accent for hover states
- Keep all existing link groups (Product, Company, Legal, Social)
- Keep copyright and social icons
- Remove decorative blur background

## Acceptance criteria

- [x] Services section shows 6 feature cards with flat design, brand-colored icons, no gradients
- [x] Impact section shows 3 metric cards with clean dark styling
- [x] Join CTA section is uncommented and visible on page
- [x] Footer uses the new palette, all links functional
- [x] No remaining gradient backgrounds, glassmorphism, or blurs in any of these sections
- [x] Framer-motion scroll-reveal animations work on all sections

## Blocked by

- 12-design-foundation
