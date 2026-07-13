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
│   │   ├── page.tsx                #   Dashboard — orchestrates 8 extracted components: ActiveMissionTracker, DeferralStatusCard, HmoInsuranceCard, LocationSettingsCard (locations loaded from DB via getAllCityLabels), EmergencyAlertsFeed, BloodSupplyChart (all 8 blood groups), DonationHistoryCard, SuccessModal. React Query + local state. donorStatus + lastDonationDate persisted to backend via updateUserProfile
│   │   ├── health-profile/page.tsx #   Health/medical form — Tailwind classes, React Query initial load
│   │   ├── wallet/page.tsx         #   Rewards wallet — React Query, sonner toasts
│   │   └── history/page.tsx        #   Donation history & impact — paginated history table, personal impact stats (donations/points/lives), local monthly demand, eligibility banner
│   ├── hospital/                   # Hospital section (role=hospital)
│   │   ├── layout.tsx              #   Wraps children in SidebarLayout role="hospital"
│   │   ├── page.tsx                #   Dashboard — HospitalDashboard orchestrator, localStorage persistence for broadcast requests, session guard
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
│   ├── prospeo/                    # Prospeo Design System shared components
│   │   ├── index.ts                #   Barrel export
│   │   ├── eyebrow.tsx             #   Section eyebrow label (11px, brand, uppercase)
│   │   ├── stat-block.tsx          #   Stat value + label + optional icon
│   │   ├── section.tsx             #   Section wrapper (light or dark bg, max-w-6xl)
│   │   └── logo-bar.tsx            #   Social proof logo strip
│   ├── dashboard/                  # Shared dashboard components (Phase 1)
│   │   ├── stat-card.tsx           #   StatCard — icon, label, value, optional warning tone
│   │   └── section-card.tsx        #   SectionCard — collapsible card with icon header
│   ├── hospital/                   # Hospital dashboard components (extracted from hospital-dashboard.tsx)
│   │   ├── hospital-dashboard.tsx  #   Orchestrator — tab nav, funnel state, radius expansion, history tab, composition
│   │   ├── radius-expansion-card.tsx #   Auto-expanding alert radius widget with countdown + radar animation
│   │   ├── emergency-request-form.tsx #   Toggle form for creating emergency match requests
│   │   ├── broadcast-stream-card.tsx #   Active dispatch stream — funnel metrics, donor en-route card, confirm arrival
│   │   ├── live-status-panel.tsx   #   Live funnel detail per active request — per-status donor lists with name, blood group, status badge, timestamps; "Confirm Donation" button on arrived rows with window.confirm + toast; auto-refreshes 5s polling
│   │   ├── emergency-history.tsx   #   Past requests list with filtering (date range, blood type, status), expandable rows showing full funnel breakdown, pagination
│   │   ├── donor-directory.tsx     #   Proactive donor registry search/filter with inline call actions
│   │   ├── analytics-dashboard.tsx #   Stats cards + bar chart timeline with CSV export
│   │   └── staff-accounts.tsx      #   Authorized staff list + "add practitioner" form
│   ├── donor/                      # Donor dashboard components (extracted from page.tsx)
│   │   ├── active-mission-tracker.tsx #   Red tracking card during active emergency response
│   │   ├── blood-supply-chart.tsx  #   Hospital blood supply bar chart — all 8 blood groups from bank inventory
│   │   ├── deferral-status-card.tsx #   Circular eligibility countdown + date input (persisted to backend on save)
│   │   ├── donation-history-card.tsx #   Donation history table (legacy — used in dashboard, real data from getDonorHistory)
│   │   ├── emergency-alerts-feed.tsx #   Live emergency request cards with accept/decline
│   │   ├── hmo-insurance-card.tsx  #   Dark HMO insurance card with milestone progress
│   │   ├── location-settings-card.tsx #   Availability, location (loaded from DB via getAllCityLabels), radius, SMS settings form
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
├── emails/                         # React Email templates
│   └── emergency-alert.tsx         #   Emergency alert email — blood type, hospital, distance, accept button
│
├── docs/
│   └── agents/                      # Engineering skill configuration
│       ├── issue-tracker.md
│       ├── triage-labels.md
│       └── domain.md
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
│               ├── 09-donor-history-impact.md
│               ├── 10-hospital-admin-features.md
│               ├── 11-institutional-partner-management.md
│               ├── 12-design-foundation.md
│               ├── 13-landing-hero-navbar.md
│               ├── 14-landing-stats-how-it-works-testimonials.md
│               ├── 15-landing-services-impact-footer.md
│               ├── 16-dashboard-sidebar-topbar.md
│               ├── 17-dashboard-bento-widgets.md
│               └── 18-hospital-blood-search-cards.md
│
├── hooks/
│   ├── use-scroll-reveal.ts        # IntersectionObserver scroll animation hook
│   ├── use-donor-dashboard.ts      # React Query: wraps getUserById (incl. wallet)
│   ├── use-donor-history.ts        # React Query: useDonorHistory(), useLocalDemandStats()
│   ├── use-wallet.ts               # React Query: wraps getWalletByUserId
│   ├── use-inventory.ts            # React Query: wraps getAllHospitalBanks, auto-refetch 10s
│   ├── use-eligible-donors.ts      # React Query: wraps listDonors() with optional filters (bloodGroup, location, search, eligibleOnly, page)
│   └── use-emergency-requests.ts   # React Query: useActiveEmergencyRequests(), useDonorAlerts(), useRespondToAlert(), useUpdateAlertStatus(), usePendingEmergencyRequests(), useExpandSearchRadius(), useEmergencyRequestStatus(), useEmergencyHistory(), useConfirmDonation() — auto-refetch 15s (5s for status panel)
│
├── lib/
│   ├── auth.ts                     # BetterAuth server config (email/password, prisma adapter)
│   ├── auth-client.ts              # createAuthClient() for browser
│   ├── blood-compatibility.ts      # Blood group compatibility matrix (universal donor/recipient)
│   ├── donor-types.ts             # UI types + helpers: EmergencyMatchRequest, DonationRecord, DonorStatus, DonorAlertWithRequest, BLOOD_GROUP_MAP, displayBloodGroup()
│   ├── eligibility.ts              # getEligibility() + ELIGIBILITY_DAYS (extracted from donor page)
│   ├── email.ts                    # Resend client + sendEmail() wrapper — sends React Email templates; mock mode when no RESEND_API_KEY
│   ├── prisma.ts                   # Singleton PrismaClient
│   ├── radius-expansion.ts         # Radius expansion config: INITIAL_RADIUS, EXPANSION_INCREMENT, MAX_RADIUS, EXPANSION_TIMEOUT_MS, MAX_ALERTS_PER_REQUEST, canExpand(), nextRadius(), getRadiusTier()
│   ├── supabase.ts                 # Legacy — unused, @ts-ignore
│   └── utils.ts                    # cn() clsx+tailwind-merge helper
│
├── servers/                        # Server Actions ("use server")
│   ├── auth.ts                     # signUpWithProfile() (incl. locationId, availability, isActive), loginWithRole()
│   ├── emergency.ts                # createEmergencyRequest() — ancestor-based scoring, expandSearchRadius() — radius tier via getCommonAncestorDepth()
│   ├── hospital.ts                 # getAllHospitalBanks(), getHospitalBankById(), createHospitalBank() (incl. locationId), updateHospitalBankInventory()
│   ├── incentive.ts                # createIncentiveClaim(), getClaimsByUserId(), getPendingClaims(), updateClaimStatus()
│   ├── location.ts                 # getLocations(), getAncestors(), getCommonAncestorDepth(), buildLocationLabel(), getAllCityLabels(), getLocationTree()
│   ├── notification.ts             # sendEmergencyAlertEmail() — sends emergency alert via Resend, logs to NotificationLog
│   ├── user.ts                     # getUserById(), getUserBasicById(), getUserByEmail(), updateUserProfile() (incl. locationId), updateUserRole(), listDonors() (paginated, location filter), getDonorHistory() (paginated), getLocalDemandStats()
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
│   ├── schema.prisma               # Data model (User w/ locationId, HospitalBank w/ locationId, Location hierarchy, EmergencyRequest, EmergencyAlert, NotificationLog, Wallet, IncentiveClaim, Session, Account, Verification)
│   ├── seed.ts                     # Seeds Nigerian location hierarchy (6 regions, 37 states, ~120 cities)
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

## Resolved in Issue 02

| Issue                                                 | Severity | Status                                       |
| ----------------------------------------------------- | -------- | -------------------------------------------- |
| Donor alerts UI not implemented                       | High     | ✅ Full donor alert feed with accept/decline/en-route/arrived flow, status badges, collapse declined |
| No server actions for donor response                  | High     | ✅ respondToAlert(), updateAlertStatus(), getAlertsForDonor()        |

## Resolved in Issue 03

| Issue                                                 | Severity | Status                                       |
| ----------------------------------------------------- | -------- | -------------------------------------------- |
| No radius expansion when zero acceptances             | High     | ✅ expandSearchRadius() server action with tiered matching by radius |
| No expansion configuration constants                  | Medium   | ✅ INITIAL_RADIUS, EXPANSION_INCREMENT, MAX_RADIUS, EXPANSION_TIMEOUT_MS, MAX_ALERTS_PER_REQUEST |
| Hospital UI shows no expansion indicator              | High     | ✅ RadiusExpansionCard shows current radius, countdown, total donors alerted, animation |
| Auto-expansion not wired to real server data          | High     | ✅ usePendingEmergencyRequests + useExpandSearchRadius hooks, 5-min countdown polling |

## Resolved in Issue 08

| Issue                                         | Severity | Status                                                                           |
| --------------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| No availability or alert opt-in for donors    | High     | ✅ Added `availability`, `isActive` to User schema, signup form, health profile  |
| Signup lacks location field                   | Medium   | ✅ Location field added to signup form (required for donors)                     |
| Health profile can't manage alert preferences | Low      | ✅ Added emergency preferences section with location, availability, pause toggle |

## Resolved in Issue 09

| Issue | Severity | Status |
|---|---|---|
| Donor has no real donation history view | High | ✅ `/donor/history` page with paginated real data from completed EmergencyAlerts |
| No local demand stats | High | ✅ `getLocalDemandStats` shows monthly emergency counts for donor's location |
| No re-eligibility notification on login | Medium | ✅ Green banner on donor dashboard when deferral period ends |
| No personal impact stats | Medium | ✅ Impact cards showing total donations, points, lives impacted (2x donations) |

## Resolved in Issue 06

| Issue | Severity | Status |
|---|---|---|
| No donation confirmation flow | High | ✅ confirmDonation server action with atomic Prisma transaction — validates "arrived" status, updates lastDonationDate, awards 100 points, increments lifetimeDonations, marks request fulfilled when all units met |
| No confirm button in live panel | High | ✅ "Confirm Donation" button on each arrived donor row in LiveStatusPanel with window.confirm dialog, toast on success/failure |

## Resolved in Issue 05

| Issue | Severity | Status |
|---|---|---|
| No email notification when emergency request created | High | ✅ Email sent via Resend to each matched donor immediately after alert creation; includes blood type, hospital name, distance, accept link |
| No delivery tracking | Medium | ✅ NotificationLog model records channel, status (sent/failed), providerMessageId, errorMessage per alert |
| No email infrastructure | High | ✅ Resend SDK + React Email template (emails/emergency-alert.tsx) + lib/email.ts wrapper |

## Resolved in Issue 04

| Issue | Severity | Status |
|---|---|---|
| No live funnel status view with per-status donor lists | High | ✅ LiveStatusPanel shows alerted/opened/accepted/declined/en_route/arrived/completed with donor names, blood groups, timestamps; 5s polling via useEmergencyRequestStatus |
| No past request history view | High | ✅ EmergencyHistory tab with date/type/status filters, expandable funnel breakdown, pagination |
| No getEmergencyRequestStatus server action | Medium | ✅ Returns single request with alert aggregates + donor details |
| No getEmergencyHistory server action | Medium | ✅ Paginated history with filters, returns funnel aggregates per request |

## Resolved — Location Hierarchy & Scoring

| Issue | Severity | Status |
|---|---|---|
| String-based location matching is fragile (free-text "Ikeja" vs "Ikeja, Lagos") | Medium | ✅ Replaced with Nigerian location hierarchy (6 regions, 37 states, ~120 cities) |
| No structured location data | Medium | ✅ `Location` model with self-referential parent/children, seeded via `prisma/seed.ts` |
| Signup uses free-text location input | Medium | ✅ Cascading dropdowns (Region → State → City) on signup form and health profile |
| No geocoded fallback — locationId is source of truth | Low | ✅ Pure hierarchy-based scoring via `getCommonAncestorDepth()` — same area = 4, same city = 3, same state = 2, same region = 1 |
| `expandSearchRadius` uses string matching for radius tiers | Medium | ✅ Now uses ancestor depth with radius-tier thresholds (depth >= 4 within 5km, >= 3 within 15km, >= 1 within 25km) |
| `getLocalDemandStats` uses `contains` filter | Medium | ✅ Now filters by state-level ancestor chain from `locationId` |

## Design System Integration

| Change | Status |
|---|---|
| CSS variables switched from oklch to Prospeo HSL tokens in `globals.css` | Done |
| `tailwind.config.ts` extended with brand colors, display/stat font sizes, 2xl/3xl/4xl radii, card/brand shadows | Done |
| `button.tsx` overridden with Prospeo variants (brand default, shadow-brand, hover scale) | Done |
| `card.tsx` simplified to Prospeo card (rounded-2xl, border-border, shadow-card, hover shadow) | Done |
| `components/prospeo/` — shared Eyebrow, StatBlock, Section, LogoBar | Done |
| Landing page (hero, navbar, stats, mission, services, impact, join, footer) fully migrated | Done |
| Fixed pre-existing `Tooltip must be used within TooltipProvider` runtime error in sidebar | Done |
| Fixed sidebar overlap/transparency — replaced Tailwind v4 `w-(--sidebar-width)` syntax with v3 `w-[var(--sidebar-width)]` in `components/ui/sidebar.tsx` | Done |
| Login uses client-side `authClient.signIn.email()` instead of server action — fixes session cookie not being set through redirect | Done |
| Donor dashboard: removed fake `generateHistory()`, uses real `getDonorHistory()` from server | Done |
| Donor dashboard: removed `completedCountLocal` state, HMO tier computed from real wallet `lifetimeDonations` | Done |
| Donor dashboard: removed simulated mission timer, status progression is manual via server actions | Done |
| Donor dashboard: removed `"Ikeja, Lagos"` fallback, uses user's real location from DB | Done |
| DonationRecord type updated to match `getDonorHistory()` response shape; DonationHistoryCard updated accordingly | Done |
| ActiveMissionTracker simplified: removed fake progress bar/ETA, shows real status with manual action buttons | Done |

## Resolved — Full Backend Integration

| Issue | Severity | Status |
|---|---|---|
| LocationSettingsCard hardcodes 6 Lagos locations | High | ✅ Replaced with `getAllCityLabels()` server action — loads real city+state labels from Location table |
| Location dropdown shows stale/limited options | Medium | ✅ Now dynamically loads from DB, shows all cities with state names |
| donorStatus not persisted to backend | Medium | ✅ `handleSaveSettings` now saves `isActive` map from donorStatus to backend |
| Manual date input not persisted | Medium | ✅ `lastDonationDate` now saved alongside location and status via `updateUserProfile` |
| BloodSupplyChart only shows 5 of 8 blood groups | Low | ✅ Now shows all 8 blood groups (O+, O-, A+, A-, B+, B-, AB+, AB-) |
| Hardcoded 100 points in history page | Low | ✅ Replaced with `POINTS_PER_DONATION` constant matching `confirmDonation` (100) |

## Resolved in Issue 12 — Design Foundation

| Change | Status |
|---|---|
| Geist font installed and configured in `app/layout.tsx` (replaces Inter) | Done |
| Geist Mono configured as `--font-mono` with `font-mono` Tailwind utility | Done |
| `framer-motion` added to dependencies | Done (already present) |
| `globals.css` updated: all HSL variables changed from `3 79% 54%` to `356 83% 41%` (new brand red `#C1121F`) | Done |
| `--background`/`--foreground` hue shifted from `60` to `40` (warmer neutral) | Done |
| `tailwind.config.ts` — brand colors updated to `#C1121F` / `#9C0E19` / `#FDF2F3` / `#F97171` | Done |
| `tailwind.config.ts` — `shadow-brand` updated to `rgba(193,18,31,0.25)` | Done |
| `tailwind.config.ts` — fontFamily uses CSS variables (`var(--font-sans)`, `var(--font-mono)`) | Done |
| `BlobDecoration.tsx` removed (dead component, unused) | Done |
| Old brand color `#E8342A` and `#C9281F` purged from codebase | Done |
| `@tremor/react` verified as not imported anywhere | Done |

## Remaining Issues

| Issue                                               | Severity | File(s)                                           |
| --------------------------------------------------- | -------- | ------------------------------------------------- |
| `inventory` JSON blob — no type safety, can't query | Medium   | `prisma/schema.prisma`                            |
| Sidebar `userName` prop never passed by layouts     | Low      | `app/donor/layout.tsx`, `app/hospital/layout.tsx` |
| Hospital phone not in User schema — contactPhone always "N/A" in emergency feed | Low | `prisma/schema.prisma` |
| maxRadius and smsFallbackEnabled not persisted (no DB fields) | Low | `app/donor/page.tsx`, `components/donor/location-settings-card.tsx` |
