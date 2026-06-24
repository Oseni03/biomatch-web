# BioMatch — Current File Structure

```
biomatch/
├── app/                            # Next.js App Router
│   ├── admin/                      # Admin section (role=admin)
│   │   ├── layout.tsx              #   Wraps children in SidebarLayout role="admin"
│   │   ├── page.tsx                #   STUB - System Overview
│   │   ├── contracts/page.tsx      #   STUB - Partner agreements
│   │   └── verification/page.tsx   #   STUB - Verification queue
│   ├── api/
│   │   └── auth/[...all]/route.ts  # BetterAuth API catch-all
│   ├── auth/
│   │   ├── login/page.tsx          # Sign-in form
│   │   └── signup/page.tsx         # Registration form (donor/hospital toggle)
│   ├── donor/                      # Donor section (role=donor)
│   │   ├── layout.tsx              #   Wraps children in SidebarLayout role="donor"
│   │   ├── page.tsx                #   Dashboard — React Query, uses useDonorDashboard
│   │   ├── health-profile/page.tsx #   Health/medical form — Tailwind classes, React Query initial load
│   │   └── wallet/page.tsx         #   Rewards wallet — React Query, sonner toasts
│   ├── hospital/                   # Hospital section (role=hospital)
│   │   ├── layout.tsx              #   Wraps children in SidebarLayout role="hospital"
│   │   ├── page.tsx                #   (redirects to /hospital/inventory)
│   │   ├── inventory/page.tsx      #   Live inventory grid — React Query auto-refetch
│   │   ├── donor-finder/page.tsx   #   STUB - Donor search/filter
│   │   └── blood-drive/page.tsx    #   STUB - Blood drive request form
│   ├── favicon.ico
│   ├── globals.css                 # Tailwind directives + theme variables
│   ├── layout.tsx                  # Root layout: Inter font, ThemeProvider, QueryClientProvider, Toaster
│   └── page.tsx                    # Landing page (navbar, hero, stats, mission, services, impact, join, footer)
│
├── components/
│   ├── dashboard/                  # Shared dashboard components (Phase 1)
│   │   ├── stat-card.tsx           #   StatCard — icon, label, value, optional warning tone
│   │   └── section-card.tsx        #   SectionCard — collapsible card with icon header
│   ├── donor/                      # Donor-specific components
│   │   └── eligible-donors-list.tsx #   Eligible donors table — reusable by inventory + donor-finder
│   ├── landing/                    # Landing page sections (8 files)
│   │   ├── navbar.tsx
│   │   ├── hero.tsx
│   │   ├── stats.tsx
│   │   ├── mission.tsx
│   │   ├── services.tsx
│   │   ├── impact.tsx
│   │   ├── join.tsx
│   │   └── footer.tsx
│   ├── layout/
│   │   └── sidebar.tsx             # Shared sidebar — role-based nav, mobile responsive
│   ├── ui/                         # shadcn/ui primitives (17 files)
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── chart.tsx
│   │   ├── checkbox.tsx
│   │   ├── collapsible.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── field.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── menubar.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sonner.tsx
│   │   ├── switch.tsx
│   │   └── textarea.tsx
│   ├── theme-provider.tsx          # next-themes ThemeProvider wrapper
│   └── theme-toggle.tsx            # Light/dark toggle
│
├── contexts/                       # AI context & plans directory
│   ├── architecture.md             # Tech stack, data model, routing, patterns
│   ├── current-structure.md        # This file — full file tree
│   ├── improvement-plan.md         # Summary of all 3 phases
│   ├── phase-1-foundation.md       # React Query, shared components, cleanup ✅
│   ├── phase-2-directory.md        # Donor Finder implementation
│   ├── phase-3-realtime.md         # SSE inventory updates
│   ├── prd-issues.md               # PRD issue tracker (dependency map, HITL registry, coverage)
│   └── issues/                     # PRD-driven vertical-slice issues (11 files)
│       ├── 01-emergency-request-matching.md
│       ├── 02-donor-alert-response.md
│       ├── 03-radius-expansion.md
│       ├── 04-hospital-live-status-panel.md
│       ├── 05-notification-delivery.md
│       ├── 06-donation-confirmation.md
│       ├── 07-hmo-incentive-integration.md
│       ├── 08-donor-registration-enhancements.md
│       ├── 09-donor-history-impact.md
│       ├── 10-hospital-admin-features.md
│       └── 11-institutional-partner-management.md
│
├── hooks/
│   ├── use-scroll-reveal.ts        # IntersectionObserver scroll animation hook
│   ├── use-donor-dashboard.ts      # React Query: wraps getUserById (incl. wallet)
│   ├── use-wallet.ts               # React Query: wraps getWalletByUserId
│   ├── use-inventory.ts            # React Query: wraps getAllHospitalBanks, auto-refetch 10s
│   └── use-eligible-donors.ts      # React Query: wraps listDonors({ eligibleOnly: true })
│
├── lib/
│   ├── auth.ts                     # BetterAuth server config (email/password, prisma adapter)
│   ├── auth-client.ts              # createAuthClient() for browser
│   ├── eligibility.ts              # getEligibility() + ELIGIBILITY_DAYS (extracted from donor page)
│   ├── prisma.ts                   # Singleton PrismaClient
│   ├── supabase.ts                 # Legacy — unused, @ts-ignore
│   └── utils.ts                    # cn() clsx+tailwind-merge helper
│
├── servers/                        # Server Actions ("use server")
│   ├── auth.ts                     # signUpWithProfile(), loginWithRole()
│   ├── hospital.ts                 # getAllHospitalBanks(), getHospitalBankById(), createHospitalBank(), updateHospitalBankInventory()
│   ├── incentive.ts                # createIncentiveClaim(), getClaimsByUserId(), getPendingClaims(), updateClaimStatus()
│   ├── user.ts                     # getUserById(), getUserBasicById(), getUserByEmail(), updateUserProfile(), updateUserRole(), listDonors() (paginated)
│   └── wallet.ts                   # getWalletByUserId(), awardPoints(), deductPoints()
│
├── generated/
│   └── prisma/                     # Prisma 7 client output
│       ├── client.ts
│       ├── enums.ts
│       ├── models.ts
│       ├── commonInputTypes.ts
│       ├── browser.ts
│       └── internal/
│
├── prisma/
│   ├── schema.prisma               # Data model (User, HospitalBank, Wallet, IncentiveClaim, Session, Account, Verification)
│   └── migrations/                 # 5 migration folders
│
├── proxy.ts                       # Edge proxy — session check via auth.api.getSession, RBAC guard
├── package.json                    # Dependencies & scripts
├── tailwind.config.ts
├── tsconfig.json
├── next.config.mjs
├── postcss.config.mjs
├── components.json                 # shadcn/ui config
└── prisma.config.ts
```

## Current Data Fetching Pattern

All dashboard pages now use React Query hooks instead of manual useState/useEffect/useCallback:

```typescript
// 1. Session
const { data: session } = authClient.useSession();

// 2. React Query hook — handles loading, caching, refetch
const { data, isLoading, error } = useDonorDashboard();
```

Shared patterns:
- `useQuery` with server action as `queryFn`
- `staleTime: 60s`, `gcTime: 5min` (from root layout defaults)
- `QueryClientProvider` wraps root layout with SSR-safe `makeQueryClient()`
- Sonner `Toaster` in root layout for error/success toasts

## Resolved Issues

| Issue | Severity | Status |
|---|---|---|
| React Query unused — manual fetch boilerplate everywhere | High | ✅ Replaced with hooks |
| Inventory + donor list conflated in one page | Medium | ✅ Extracted into `EligibleDonorsList` |
| `getUserById` fetches everything every time | Medium | ✅ Added `getUserBasicById` lean query |
| `listDonors()` has no pagination | Medium | ✅ Added skip/take pagination + filters |
| `<style jsx global>` in health profile | Low | ✅ Replaced with Tailwind classes |
| Dead public routes in middleware | Low | ✅ Removed `/sign-in`, `/sign-up` |
| Hardcoded 10s polling — no pause on background tab | Medium | ✅ Now uses React Query `refetchInterval` |
| No shared dashboard components | Low | ✅ Extracted StatCard, SectionCard |
| No error boundaries or toast on action failures | Low | ✅ Sonner `toast` wired in all pages |

## Remaining Issues

| Issue | Severity | File(s) |
|---|---|---|
| Donor Finder is a stub | High | `app/hospital/donor-finder/page.tsx` |
| No donor location field → can't search by location | Medium | `prisma/schema.prisma` |
| `inventory` JSON blob — no type safety, can't query | Medium | `prisma/schema.prisma` |
| Sidebar `userName` prop never passed by layouts | Low | `app/donor/layout.tsx`, `app/hospital/layout.tsx` |
| Static nav links — no badge counts | Low | `components/layout/sidebar.tsx` |
