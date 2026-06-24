# BioMatch — Improvement Plan (Summary)

## Phases

### Phase 1 — Foundation (React Query + shared components + cleanup)
*No schema changes. No breaking changes.*

| # | Task | Expected files |
|---|---|---|
| 1 | Create React Query hooks for all data queries | `hooks/use-donor-dashboard.ts`, `hooks/use-wallet.ts`, `hooks/use-inventory.ts`, `hooks/use-eligible-donors.ts` |
| 2 | Add `QueryClientProvider` to root layout | `app/layout.tsx` |
| 3 | Extract shared dashboard components (StatCard, SectionCard, PerkCard) | `components/dashboard/` (3 files) |
| 4 | Extract `getEligibility()` into reusable lib | `lib/eligibility.ts` |
| 5 | Split eligible donors list out of inventory page | `components/donor/eligible-donors-list.tsx` |
| 6 | Add server-side pagination to `listDonors()` | `servers/user.ts` |
| 7 | Clean up middleware public routes | `middleware.ts` |
| 8 | Replace `<style jsx global>` with Tailwind | `app/donor/health-profile/page.tsx` |
| 9 | Wire sonner toast for error feedback | All dashboard pages |
| 10 | Add selective server actions (lean queries) | `servers/user.ts` |

### Phase 2 — Directory (Donor Finder)
*Minor schema addition: `location` field on User.*

| # | Task | Expected files |
|---|---|---|
| 11 | Add `location` string field to User + migration | `prisma/schema.prisma` + migration |
| 12 | Extend `listDonors()` with location search + pagination | `servers/user.ts` |
| 13 | Build full Donor Finder page | `app/hospital/donor-finder/page.tsx` |

### Phase 3 — Real-time Inventory
*No schema changes.*

| # | Task | Expected files |
|---|---|---|
| 14 | Create SSE endpoint for inventory stream | `app/api/inventory/stream/route.ts` |
| 15 | Create `useInventoryStream` hook | `hooks/use-inventory-stream.ts` |
| 16 | Replace polling with SSE subscription | `app/hospital/inventory/page.tsx` |

## Non-goals (decided)
- No `Donation` model (deferred)
- No geospatial coordinates (text `location` field instead)
- No Server Components conversion (keep `"use client"` + React Query)

## Ordering Rationale
Phase 1 fixes the largest surface area of technical debt (data fetching pattern, code duplication, missing components) before adding new features. Phase 2 implements the most requested missing feature. Phase 3 upgrades the real-time mechanism.
