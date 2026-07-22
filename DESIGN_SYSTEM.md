# BioMatch — Design System

Digital blood banking for Nigeria. A warm, editorial brand wrapped around a calm,
clinical product. "Classic red + clinical white" is a rule about **where color
lives**, not just a palette:

- **Red surfaces = human & urgent.** Marketing hero, emergency alerts, primary
  CTAs, brand moments (`bg-brand`, `.on-red`).
- **Paper / white surfaces = clinical & clear.** Dashboards, inventory, search,
  donor data, forms (`bg-paper`, `bg-card`).

Red frames and punctuates; it never floods a data-heavy screen.

Everything is driven by CSS custom properties in [`src/app/globals.css`](src/app/globals.css)
and consumed through [`tailwind.config.ts`](tailwind.config.ts). There is no
separate stylesheet or static mockup file — this is the live app.

## 1. Color

Defined as HSL triplets in `:root` / `.dark` in `globals.css`, exposed as Tailwind
colors:

| Token | Tailwind class | Role |
|---|---|---|
| `--red` | `brand` / `text-brand` / `bg-brand` | Primary brand red |
| `--red-deep` | `brand-deep` | Hover, depth, large fills |
| `--red-ink` | `brand-ink` | Deep red text/gradient accent |
| `--red-bg` | `brand-light` | Soft red tint background (chips, highlights) |
| `--emergency` | `emergency` | Critical, live-urgency accents |
| `--cream` | `cream` | Warm off-white, text-on-red |
| `--paper` | `paper` | Clinical working canvas (marketing + dashboard backgrounds) |
| `--ink` | `ink` | Near-black navy — structural chrome (dashboard sidebar/header, marketing dark sections, footer) |
| `--slate` | `slate` | Secondary text accent |

**Semantic status (inventory & alerts)** — use these, not raw Tailwind palette
colors (`green-600`, `orange-100`, etc.), for anything representing urgency or
state:

| Token | Class | Meaning |
|---|---|---|
| `--status-critical` | `status-critical` / `status-critical-bg` | Critical stock, critical urgency |
| `--status-low` | `status-low` / `status-low-bg` | Low stock, high (non-critical) urgency |
| `--status-ok` | `status-ok` / `status-ok-bg` | Healthy stock, fulfilled, eligible |
| `--status-info` | `status-info` / `status-info-bg` | Informational / in-progress state |

The shadcn tokens (`--primary`, `--destructive`, `--ring`, etc.) resolve through
`--red`, so light/dark mode stay in sync automatically — don't hardcode hex
anywhere in components. `--sidebar-background`/`--sidebar-foreground`/
`--sidebar-accent` are the exception: they resolve through `--ink`, not `--red`
(see below).

`.on-red` (in `globals.css`) recolors `--foreground`/`--border`/`--muted-foreground`
for content sitting directly on a red background. Only wrap the minimum region
that needs it — nested clinical-surface content (a white card floating on a red
section) should sit outside `.on-red`, not inside it.

**`ink` as structural chrome.** Beyond the marketing dark-contrast blocks it was
originally scoped to (Impact section, footer, auth split-screen, phone mockup —
all still `bg-ink`, unchanged), `ink` is also the persistent background for the
dashboard sidebar and top bar in both the donor and hospital portals
(`--sidebar-background`/`--sidebar-foreground`/`--sidebar-accent` in
`globals.css`, exposed as `bg-sidebar`/`text-sidebar-foreground`/
`bg-sidebar-accent`). Unlike the marketing blocks, these don't read `ink`
directly — they're pinned to a fixed dark value so the chrome doesn't flip
color if dark mode is ever reintroduced (see issue #26). `.on-ink` (in
`globals.css`) mirrors `.on-red`, recoloring `--foreground`/`--border`/
`--secondary`/`--muted-foreground` for content sitting on that chrome (the
dashboard header uses it). Main dashboard content areas stay on `paper`/`cream`
— `ink` frames the app, it doesn't fill it. `--border`/`--input` are also tinted
toward `ink`'s hue (rather than a neutral gray) so card borders and section
dividers read as part of the same structural-chrome family app-wide.

## 2. Typography

- **Newsreader** (`font-serif`, `--font-serif`) — display serif for editorial
  headlines. Italic is used for the emphasis clause in a headline (see the
  homepage hero: *"blood donation coordinator."*).
- **Hanken Grotesk** (`font-sans`, `--font-sans`) — UI, body, and dashboard
  copy. Loaded in [`src/app/layout.tsx`](src/app/layout.tsx) via `next/font/google`.
- **Geist Mono** (`font-mono`, `--font-mono`) — unchanged, still used for
  tabular/numeric data throughout the dashboards. Use the `.num` utility class
  (`font-variant-numeric: tabular-nums`) alongside `font-mono` for figures.

The serif carries emotion (marketing surfaces); the sans carries function
(dashboards, data). Don't use serif inside dashboard widgets — it's a marketing
voice, not a UI face.

## 3. Signature — the blood system

The blood-drop mark and its component family live in
[`src/components/brand/`](src/components/brand/):

| Component | File | Notes |
|---|---|---|
| `BloodDropIcon` | `blood-drop-icon.tsx` | The one mark — logo, decorative motif, button glyph |
| `BloodTypeBadge` | `blood-type-badge.tsx` | Droplet chip for a blood group (O−, A+, …). `variant`: `default` \| `deep` \| `onRed`. `size`: `sm` \| `md` \| `lg` |
| `StatusTag` | `status-tag.tsx` | Dot + label, `status`: `critical` \| `low` \| `ok` \| `info`, optional `pulse` |
| `InventoryGauge` | `inventory-gauge.tsx` | Stock-level bar for a blood group, colored by `CRITICAL_THRESHOLD` |
| `EmergencyAlert` | `emergency-alert.tsx` | Bright emergency-red, one-line alert card |
| `DashboardGreeting` | `dashboard-greeting.tsx` | Page-level header banner (serif title + subtitle + optional action slot) |

`formatBloodGroup()` in [`src/lib/blood-compatibility.ts`](src/lib/blood-compatibility.ts)
converts the DB enum form (`A_PLUS`) to display form (`A+`) — pass either form
into `BloodTypeBadge`/`InventoryGauge`, they call it internally.

## 4. Motion

Shared variants live in [`src/lib/animations.ts`](src/lib/animations.ts):
`containerVariants`/`cardVariants` (existing, compact stagger) and
`fadeUp`/`fadeUpStagger`/`scaleIn` (marketing-site scale, using the shared
`EASE_SMOOTH` cubic-bezier `[0.22, 1, 0.36, 1]`). Prefer these over inventing a
new easing curve per component — the "smooth" feel of the marketing site comes
from using one curve consistently, not from heavier animation per se.

Framer Motion is already a dependency; `whileInView` + `viewport={{ once: true }}`
is the standard pattern for scroll-triggered reveals on the homepage.

## 5. Marketing site structure

[`src/app/page.tsx`](src/app/page.tsx) composes, in order:

1. **Navbar** — sticky, blur-on-scroll, serif italic wordmark + drop mark.
2. **Hero** — centered on `bg-paper`, pill eyebrow, serif headline with italic
   emphasis clause, single CTA, centered `PhoneMockup` product visual below
   (a chat-style rendering of the emergency-alert flow — the marketing site's
   answer to a literal product screenshot).
3. **Testimonial** — centered quote, no fabricated photo/avatar (initials only).
4. **Stats** — animated counters, unchanged structurally, retokenized.
5. **FeatureRows** — five alternating text/mockup rows with dot pagination,
   each mockup built from the `brand/` component family (not static images).
6. **Impact** — three dark (`bg-ink`) metric cards.
7. **CtaBand** — full-bleed closing `brand`→`brand-ink` gradient CTA.
8. **Footer** — `bg-ink`, drop mark, four link columns.

This structure (centered hero → product mockup → testimonial → alternating
feature rows with dot pagination → full-bleed closing CTA → minimal footer)
mirrors the reference site's rhythm; the palette, type, and content are
BioMatch's, not copied verbatim.

## 6. Dashboard surfaces (`/donor`, `/hospital`)

Dashboards stay clinical: `bg-paper`/`bg-card`, Hanken Grotesk throughout, no
serif. Current adoption:

- **Shell** ([`src/components/layout/sidebar.tsx`](src/components/layout/sidebar.tsx)) —
  drop-mark logo lockup, serif italic wordmark in the sidebar header only
  (the one deliberate marketing-voice touch inside the clinical shell).
- **Page headers** — `/donor` and `/hospital` (both the inventory grid and the
  emergency-broadcasts page) open with `DashboardGreeting`.
- **Retokenized widgets** — all `src/components/donor/*` and
  `src/components/hospital/*` dashboard widgets now use `BloodTypeBadge` /
  `StatusTag` and the `status-*` tokens instead of ad-hoc `green-600` /
  `orange-100` / `blue-600` Tailwind palette classes. Interactive controls
  (`<button>` CTAs) were unified onto `components/ui/button.tsx`'s `Button`
  and `components/ui/switch.tsx`'s `Switch` where they represent a primary
  action or toggle; whole-row/whole-card click targets (expand/collapse rows
  in `request-funnel-card.tsx`, `donor-stage-list.tsx` close affordance) were
  intentionally left as native `<button>` since `Button`'s fixed
  height/padding don't fit a full-width row target.

When adding a **new** dashboard widget, follow this pattern rather than
reaching for raw Tailwind palette colors or native form controls — grep the
component you're closest to (e.g. `alert-card.tsx`, `blood-search-cards.tsx`,
`live-status-panel.tsx`) for the current convention before inventing a new
one.

## 7. Conventions when extending this system

- New semantic UI (blood type, inventory level, alert urgency) → use the
  `brand/` components and `status-*` tokens, not raw Tailwind palette colors
  or a new one-off component.
- Never hardcode hex colors in `className` or inline styles — extend
  `globals.css` tokens + `tailwind.config.ts` instead, so dark mode stays
  correct for free.
- Marketing pages may use `font-serif` and italic emphasis; dashboard/product
  UI should not — keep the emotional/clinical split intentional.
- Reuse `EASE_SMOOTH`/`fadeUp`/`fadeUpStagger` from `lib/animations.ts` for new
  scroll-triggered motion rather than inventing new easing per section.
