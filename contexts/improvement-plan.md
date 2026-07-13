# BioMatch — Improvement Plan (Summary)

## Phases

### Phase 1 — Foundation (React Query + shared components + cleanup) ✅
*No schema changes. No breaking changes. **Complete**.*

| # | Task | Status |
|---|---|---|
| 1 | Create React Query hooks for all data queries | ✅ |
| 2 | Add `QueryClientProvider` to root layout | ✅ |
| 3 | Extract shared dashboard components (StatCard, SectionCard) | ✅ |
| 4 | Extract `getEligibility()` into reusable lib | ✅ |
| 5 | Split eligible donors list out of inventory page | ✅ |
| 6 | Add server-side pagination to `listDonors()` | ✅ |
| 7 | Clean up middleware public routes | ✅ |
| 8 | Replace `<style jsx global>` with Tailwind | ✅ |
| 9 | Wire sonner toast for error feedback | ✅ |
| 10 | Add selective server actions (lean queries) | ✅ |

### Phase 2 — Directory (Donor Finder) ✅
*Minor schema addition: `location` field on User. **Complete**.*

| # | Task | Status |
|---|---|---|
| 11 | Add `location` string field to User + migration | ✅ |
| 12 | Extend `listDonors()` with location search + pagination | ✅ |
| 13 | Build full Donor Finder page | ✅ |

### Phase 3 — Real-time Inventory
*No schema changes.*

| # | Task | Expected files |
|---|---|---|
| 14 | Create SSE endpoint for inventory stream | `app/api/inventory/stream/route.ts` |
| 15 | Create `useInventoryStream` hook | `hooks/use-inventory-stream.ts` |
| 16 | Replace polling with SSE subscription | `app/hospital/inventory/page.tsx` |

### Redesign — Issue 12 (Design Foundation) ✅
| # | Task | Status |
|---|---|---|
| 12a | Install Geist + framer-motion | ✅ (already present) |
| 12b | Replace Inter with Geist in layout.tsx | ✅ |
| 12c | Update globals.css with #C1121F palette (light + dark) | ✅ |
| 12d | Update tailwind.config.ts brand colors + fontFamily | ✅ |
| 12e | Remove BlobDecoration.tsx and barrel export | ✅ |
| 12f | Remove @tremor/react if unused | ✅ (not installed) |

### Redesign — Issue 13 (Landing Hero + Navbar) ✅
| # | Task | Status |
|---|---|---|
| 13a | Redesign Navbar: clean palette, new CTAs, framer-motion entrance | ✅ |
| 13b | Redesign Hero: flat design, new headline, bento icon-card grid | ✅ |

### Redesign — Issue 14 (Landing Stats + How It Works + Testimonials) ✅
| # | Task | Status |
|---|---|---|
| 14a | Redesign Stats: animated scroll counters, 5 bento cards, `useInView` | ✅ |
| 14b | Create How It Works: 3-step card layout, icons, scroll reveal | ✅ |
| 14c | Create Testimonials: 3 persona cards with quotes and avatars | ✅ |
| 14d | Delete Mission section, update composition and anchors | ✅ |

### Redesign — Issue 15 (Landing Services + Impact + Join + Footer) ✅
| # | Task | Status |
|---|---|---|
| 15a | Redesign Services: flat feature cards, brand icons, framer-motion, no gradients | ✅ |
| 15b | Redesign Impact: neutral dark bg, flat metric cards, clean CTA | ✅ |
| 15c | Redesign Join: clean dark design, new palette, uncommented in page | ✅ |
| 15d | Redesign Footer: flat dark bg, brand logo/hover, no decorative blurs | ✅ |

## Non-goals (decided)
- No `Donation` model (deferred)
- No geospatial coordinates (text `location` field instead)
- No Server Components conversion (keep `"use client"` + React Query)

## Ordering Rationale
Phase 1 fixes the largest surface area of technical debt (data fetching pattern, code duplication, missing components) before adding new features. Phase 2 implements the most requested missing feature. Phase 3 upgrades the real-time mechanism.
