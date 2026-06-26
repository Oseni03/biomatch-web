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
│   │   ├── page.tsx                #   Dashboard — orchestrates 8 extracted components: ActiveMissionTracker, DeferralStatusCard, HmoInsuranceCard, LocationSettingsCard, EmergencyAlertsFeed, BloodSupplyChart, DonationHistoryCard, SuccessModal. React Query + local state for simulation
│   │   ├── health-profile/page.tsx #   Health/medical form — Tailwind classes, React Query initial load
│   │   └── wallet/page.tsx         #   Rewards wallet — React Query, sonner toasts
│   ├── hospital/                   # Hospital section (role=hospital)
│   │   ├── layout.tsx              #   Wraps children in SidebarLayout role="hospital"
│   │   ├── inventory/page.tsx      #   Live inventory grid — React Query auto-refetch
│   │   ├── emergency/page.tsx      #   Emergency request creation form — blood group, units, urgency, radius; shows matched donor count
│   │   ├── donor-finder/page.tsx   #   Donor Finder — search/filter with blood group, location, name, eligibility toggle, pagination
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
│   ├── hospital/                   # Hospital dashboard components (extracted from hospital-dashboard.tsx)
│   │   ├── hospital-dashboard.tsx  #   Orchestrator — tab nav, funnel state, radius expansion, composition
│   │   ├── radius-expansion-card.tsx #   Auto-expanding alert radius widget with countdown + radar animation
│   │   ├── emergency-request-form.tsx #   Toggle form for creating emergency match requests
│   │   ├── broadcast-stream-card.tsx #   Active dispatch stream — funnel metrics, donor en-route card, confirm arrival
│   │   ├── donor-directory.tsx     #   Proactive donor registry search/filter with inline call actions
│   │   ├── analytics-dashboard.tsx #   Stats cards + bar chart timeline with CSV export
│   │   └── staff-accounts.tsx      #   Authorized staff list + "add practitioner" form
│   ├── donor/                      # Donor dashboard components (extracted from page.tsx)
│   │   ├── active-mission-tracker.tsx #   Red tracking card during active emergency response
│   │   ├── blood-supply-chart.tsx  #   Hospital blood supply bar chart by group
│   │   ├── deferral-status-card.tsx #   Circular eligibility countdown + date input
│   │   ├── donation-history-card.tsx #   Donation history table
│   │   ├── emergency-alerts-feed.tsx #   Live emergency request cards with accept/decline
│   │   ├── hmo-insurance-card.tsx  #   Dark HMO insurance card with milestone progress
│   │   ├── location-settings-card.tsx #   Availability, location, radius, SMS settings form
│   │   ├── success-modal.tsx       #   Mission completion modal overlay
│   │   └── eligible-donors-list.tsx #   Donor table — blood group, genotype, location, eligibility badge; reusable by inventory + donor-finder
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
│   │   └── sidebar.tsx             # shadcn SidebarProvider + Sidebar + SidebarInset, role-based nav
│   ├── nav-main.tsx                # Collapsible nav groups with expandable sub-items (shadcn pattern)
│   ├── nav-user.tsx                # Avatar dropdown with sign out via authClient
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
│   │   ├── sidebar.tsx             # shadcn sidebar primitives (SidebarProvider, Sidebar, SidebarInset, etc.)
│   │   ├── sheet.tsx
│   │   ├── skeleton.tsx
│   │   ├── sonner.tsx
│   │   ├── switch.tsx
│   │   ├── textarea.tsx
│   │   └── tooltip.tsx
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
│   ├── use-eligible-donors.ts      # React Query: wraps listDonors() with optional filters (bloodGroup, location, search, eligibleOnly, page)
│   └── use-emergency-requests.ts   # React Query: useActiveEmergencyRequests(), useDonorAlerts() — auto-refetch 15s
│
├── lib/
│   ├── auth.ts                     # BetterAuth server config (email/password, prisma adapter)
│   ├── auth-client.ts              # createAuthClient() for browser
│   ├── blood-compatibility.ts      # Blood group compatibility matrix (universal donor/recipient)
│   ├── donor-types.ts             # UI types + helpers: EmergencyMatchRequest, DonationRecord, DonorStatus, DonorAlertWithRequest, BLOOD_GROUP_MAP, displayBloodGroup(), HOSPITALS_FOR_HISTORY
│   ├── eligibility.ts              # getEligibility() + ELIGIBILITY_DAYS (extracted from donor page)
│   ├── prisma.ts                   # Singleton PrismaClient
│   ├── supabase.ts                 # Legacy — unused, @ts-ignore
│   └── utils.ts                    # cn() clsx+tailwind-merge helper
│
├── servers/                        # Server Actions ("use server")
│   ├── auth.ts                     # signUpWithProfile() (incl. location, availability, isActive), loginWithRole()
│   ├── emergency.ts                # createEmergencyRequest(), getAlertsForDonor(), respondToAlert(), updateAlertStatus()
│   ├── hospital.ts                 # getAllHospitalBanks(), getHospitalBankById(), createHospitalBank(), updateHospitalBankInventory()
│   ├── incentive.ts                # createIncentiveClaim(), getClaimsByUserId(), getPendingClaims(), updateClaimStatus()
│   ├── user.ts                     # getUserById(), getUserBasicById(), getUserByEmail(), updateUserProfile() (incl. location, availability, isActive), updateUserRole(), listDonors() (paginated, location filter)
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
│   ├── schema.prisma               # Data model (User w/ location, availability, isActive, HospitalBank, Wallet, IncentiveClaim, Session, Account, Verification)
│   └── migrations/                 # 3 migration folders (broken intermediate migrations removed)
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

| Issue                                                    | Severity | Status                                    |
| -------------------------------------------------------- | -------- | ----------------------------------------- |
| React Query unused — manual fetch boilerplate everywhere | High     | ✅ Replaced with hooks                    |
| Inventory + donor list conflated in one page             | Medium   | ✅ Extracted into `EligibleDonorsList`    |
| `getUserById` fetches everything every time              | Medium   | ✅ Added `getUserBasicById` lean query    |
| `listDonors()` has no pagination                         | Medium   | ✅ Added skip/take pagination + filters   |
| `<style jsx global>` in health profile                   | Low      | ✅ Replaced with Tailwind classes         |
| Dead public routes in middleware                         | Low      | ✅ Removed `/sign-in`, `/sign-up`         |
| Hardcoded 10s polling — no pause on background tab       | Medium   | ✅ Now uses React Query `refetchInterval` |
| No shared dashboard components                           | Low      | ✅ Extracted StatCard, SectionCard        |
| No error boundaries or toast on action failures          | Low      | ✅ Sonner `toast` wired in all pages      |

## Resolved in Phase 2

| Issue                                                 | Severity | Status                                       |
| ----------------------------------------------------- | -------- | -------------------------------------------- |
| Donor Finder is a stub                                | High     | ✅ Full page with filters, table, pagination |
| No donor location field → can't search by location    | Medium   | ✅ Added `location` to User schema           |
| Broken Prisma migrations (type mismatch in shadow DB) | Medium   | ✅ Removed unapplied broken migrations       |

## Resolved in Issue 08

| Issue                                         | Severity | Status                                                                           |
| --------------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| No availability or alert opt-in for donors    | High     | ✅ Added `availability`, `isActive` to User schema, signup form, health profile  |
| Signup lacks location field                   | Medium   | ✅ Location field added to signup form (required for donors)                     |
| Health profile can't manage alert preferences | Low      | ✅ Added emergency preferences section with location, availability, pause toggle |

## Remaining Issues

| Issue                                               | Severity | File(s)                                           |
| --------------------------------------------------- | -------- | ------------------------------------------------- |
| `inventory` JSON blob — no type safety, can't query | Medium   | `prisma/schema.prisma`                            |
| Sidebar `userName` prop never passed by layouts     | Low      | `app/donor/layout.tsx`, `app/hospital/layout.tsx` |
| Donor page is 1189-line monolith                    | Medium   | ✅ Extracted into 8 components in `components/donor/` |
| Sidebar rewritten as shadcn primitives              | Low      | ✅ Uses SidebarProvider, Sidebar, NavMain, NavUser |
