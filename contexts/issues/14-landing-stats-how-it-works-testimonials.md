## Parent

Redesign plan (from grilling session Q8, Q12, Q13).

## What to build

Redesign the middle section of the landing page: replace the Stats section with animated scroll counters, add a new How It Works 3-step section, add a Testimonials section with static hardcoded personas, and remove the old Mission section.

### Stats section

- Scroll-triggered animated number counters using framer-motion `useInView`
- Numbers: Active Donors, Partner Hospitals, Blood Requests, Lives Saved, Available Blood Units
- Displayed in bento cards using the new design tokens
- Staggered animation on scroll

### How It Works (new section)

- 3-step process replacing the old Mission 4-step timeline
- Steps: (1) Register — Create your account as donor or hospital, (2) Find or Donate Blood — Search inventory or respond to alerts, (3) Save Lives — Complete donations and track impact
- Each step shown in a card with lucide icon, title, short description
- Bento card layout with framer-motion scroll reveal

### Testimonials (new section)

- 3-4 static hardcoded testimonial personas:
  - A hospital administrator (e.g., Dr. Adebayo O., Lagos University Teaching Hospital)
  - A blood donor (e.g., Chioma E., regular donor)
  - A patient family member (e.g., Mr. Ibrahim D., whose child received blood)
- Each shows: name, title/role, quote, avatar placeholder (initials or generic icon)
- Modern card design with the new palette
- Framer-motion scroll reveal

### Remove Mission section

- Delete `components/landing/mission.tsx`
- Remove its import from `app/page.tsx`

### Page composition update

- Update `app/page.tsx` to compose the sections in the new order: Navbar → Hero → Stats → How It Works → Testimonials → (Services → Impact → Footer from other slices)

## Acceptance criteria

- [x] Stats counters animate from zero to final value on scroll
- [x] How It Works section shows exactly 3 steps with icons, titles, descriptions
- [x] Testimonials section shows 3-4 cards with names, roles, quotes
- [x] Old Mission component is removed — no references remain
- [x] All sections have framer-motion scroll-reveal animations
- [x] Responsive layout at mobile breakpoints

## Blocked by

- 12-design-foundation
