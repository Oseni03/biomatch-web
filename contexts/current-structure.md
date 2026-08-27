# BioMatch — Current File Structure

> Last updated: 2026-08-27 — File tree rebuilt to match actual `src/` layout. Issues 67–72 are live on branch `refactor/prd-prototype`.

```
src/
├── app/                            # Next.js App Router
│   ├── api/
│   │   └── auth/[...all]/route.ts  # BetterAuth API catch-all
│   ├── auth/
│   │   ├── accept-invitation/page.tsx # Accept org staff invite
│   │   ├── forgot-password/page.tsx   # Request password reset
│   │   ├── login/page.tsx             # Sign-in + verification/resend states
│   │   ├── reset-password/page.tsx    # Set new password from reset token
│   │   └── signup/page.tsx            # Registration (donor/hospital toggle)
│   ├── donor/                          # Donor section (role=donor)
│   │   ├── layout.tsx                  #   Wraps children in SidebarLayout role="donor"
│   │   ├── page.tsx                    #   Dashboard — server data loader, delegates to client
│   │   ├── donor-dashboard-client.tsx  #   Client orchestrator — state-driven primary action
│   │   ├── loading.tsx                 #   Route-level skeleton
│   │   ├── error.tsx                   #   Route-level error boundary
│   │   ├── health-profile/
│   │   │   ├── page.tsx                #   Health/medical form page
│   │   │   ├── health-profile-client.tsx # Client form with sections
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   ├── history/
│   │   │   ├── page.tsx                #   Donation history & impact
│   │   │   ├── donor-history-client.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   └── wallet/
│   │       ├── page.tsx                #   Rewards wallet
│   │       ├── donor-wallet-client.tsx
│   │       ├── loading.tsx
│   │       └── error.tsx
│   ├── hospital/                       # Hospital section (role=hospital)
│   │   ├── layout.tsx                  #   Wraps children in SidebarLayout role="hospital"
│   │   ├── (dashboard)/                #   Route group — hospital dashboard tabs
│   │   │   ├── layout.tsx              #     Dashboard layout with tab nav
│   │   │   ├── page.tsx                #     Dashboard overview
│   │   │   ├── dashboard-shell.tsx     #     Tab shell + composition
│   │   │   ├── hospital-broadcasts-client.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── error.tsx
│   │   │   ├── analytics/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── error.tsx
│   │   │   ├── directory/
│   │   │   │   ├── page.tsx            #     Donor directory / finder
│   │   │   │   ├── loading.tsx
│   │   │   │   └── error.tsx
│   │   │   ├── history/
│   │   │   │   ├── page.tsx            #     Emergency request history
│   │   │   │   ├── loading.tsx
│   │   │   │   └── error.tsx
│   │   │   ├── screening/
│   │   │   │   ├── page.tsx            #     Donor screening management
│   │   │   │   ├── loading.tsx
│   │   │   │   └── error.tsx
│   │   │   └── staff/
│   │   │       ├── page.tsx            #     Staff account management
│   │   │       ├── loading.tsx
│   │   │       └── error.tsx
│   │   ├── emergency/
│   │   │   ├── page.tsx                #   Emergency request creation form
│   │   │   ├── emergency-request-client.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   └── inventory/
│   │       ├── page.tsx                #   Blood search — bento cards + eligible donors
│   │       ├── inventory-client.tsx
│   │       ├── loading.tsx
│   │       └── error.tsx
│   ├── globals.css                     # Tailwind directives + theme variables
│   ├── layout.tsx                      # Root layout: Geist font, ThemeProvider, QueryClientProvider, Toaster
│   └── page.tsx                        # Landing page (navbar, hero, stats, how-it-works, testimonials, services, impact, join, footer)
│
├── components/
│   ├── auth/
│   │   ├── accept-invitation-client.tsx # Accept org staff invitation form
│   │   └── auth-shell.tsx              # Shared auth page shell (card + branding)
│   ├── brand/                          # Brand design-system components
│   │   ├── blood-drop-icon.tsx         #   SVG blood-drop icon
│   │   ├── blood-type-badge.tsx        #   Blood group badge (colored per type)
│   │   ├── dashboard-greeting.tsx      #   "Good morning, Name" greeting
│   │   ├── emergency-alert.tsx         #   Emergency alert brand component
│   │   ├── inventory-gauge.tsx         #   Circular inventory level gauge
│   │   ├── status-tag.tsx              #   Status tag (eligible/deferred/blacklisted)
│   │   └── wordmark.tsx                #   BioMatch wordmark logo
│   ├── dashboard/                      # Shared dashboard components
│   │   ├── stat-card.tsx               #   StatCard — icon, label, value, optional warning tone
│   │   └── section-card.tsx            #   SectionCard — collapsible card with icon header
│   ├── donor/                          # Donor dashboard components
│   │   ├── active-mission-tracker.tsx  #   Red tracking card during active emergency response
│   │   ├── alert-card.tsx              #   Single emergency alert card
│   │   ├── blacklisted-banner.tsx      #   Blacklisted donor warning banner
│   │   ├── blood-supply-chart.tsx      #   Hospital blood supply bar chart — all 8 blood groups
│   │   ├── declined-alert-row.tsx      #   Collapsed declined alert row
│   │   ├── deferral-status-card.tsx    #   Circular eligibility countdown + date input
│   │   ├── donation-history-card.tsx   #   Donation history table (dashboard)
│   │   ├── donation-history-table.tsx  #   Reusable donation history table
│   │   ├── donation-stats-grid.tsx     #   Donation impact stats grid
│   │   ├── eligibility-banner.tsx      #   Re-eligibility notification banner
│   │   ├── eligible-donors-list.tsx    #   Donor table — blood group, genotype, location, eligibility
│   │   ├── emergency-alerts-feed.tsx   #   Live emergency request cards with accept/decline
│   │   ├── health-profile/
│   │   │   ├── eligibility-screening-section.tsx
│   │   │   ├── emergency-preferences-section.tsx
│   │   │   ├── form-fields.tsx
│   │   │   ├── identity-section.tsx
│   │   │   ├── last-screening-section.tsx
│   │   │   ├── medical-history-section.tsx
│   │   │   ├── types.ts
│   │   │   └── vitals-section.tsx
│   │   ├── local-demand-card.tsx       #   Monthly local demand stats
│   │   ├── location-settings-card.tsx  #   Availability, location, radius, SMS settings
│   │   ├── success-modal.tsx           #   Mission completion modal overlay
│   │   └── verification-status-banner.tsx # Email verification status banner
│   ├── hospital/                       # Hospital dashboard components
│   │   ├── analytics-dashboard.tsx     #   Stats cards + bar chart timeline with CSV export
│   │   ├── blood-search-cards.tsx      #   Search/filter bar + bento card grid for blood inventory
│   │   ├── blood-usage-chart.tsx       #   Blood usage trend chart
│   │   ├── broadcast-stream-card.tsx   #   Active dispatch stream — funnel metrics
│   │   ├── coverage-gaps-card.tsx      #   Coverage gaps visualization
│   │   ├── date-range-picker.tsx       #   Date range picker for analytics/history
│   │   ├── deferral-badge.tsx          #   Deferral status badge
│   │   ├── donor-cards.tsx             #   Card-style eligible donor list
│   │   ├── donor-directory.tsx         #   Proactive donor registry search/filter
│   │   ├── donor-screening-panel.tsx   #   Donor screening management panel
│   │   ├── donor-stage-list.tsx        #   Donor stage progression list
│   │   ├── emergency-history.tsx       #   Past requests list with filtering
│   │   ├── emergency-request-form.tsx  #   Toggle form for creating emergency match requests
│   │   ├── history-filter-bar.tsx      #   History filter controls
│   │   ├── invite-staff-form.tsx       #   Staff invitation form
│   │   ├── live-status-panel.tsx       #   Live funnel detail per active request
│   │   ├── pending-donation-confirmations.tsx # Pending mutual confirmations
│   │   ├── radius-expansion-card.tsx   #   Auto-expanding alert radius widget
│   │   ├── request-funnel-card.tsx     #   Request funnel visualization
│   │   ├── request-volume-chart.tsx    #   Request volume chart
│   │   ├── screening-failure-prompt.tsx # Screening failure action prompt
│   │   ├── staff-accounts.tsx          #   Authorized staff list + add form
│   │   └── staff-list.tsx             #   Staff list component
│   ├── landing/                        # Landing page sections
│   │   ├── cta-band.tsx                #   Call-to-action band
│   │   ├── feature-rows.tsx            #   Feature rows section
│   │   ├── footer.tsx
│   │   ├── hero.tsx
│   │   ├── impact.tsx
│   │   ├── navbar.tsx
│   │   ├── partners.tsx               #   Partners section
│   │   ├── phone-mockup.tsx           #   Phone mockup component
│   │   └── testimonial.tsx            #   Testimonials section
│   ├── layout/
│   │   ├── route-error.tsx            #   Shared route error boundary
│   │   ├── route-loading.tsx          #   Shared route loading skeleton
│   │   └── sidebar.tsx                #   shadcn SidebarProvider + Sidebar + SidebarInset, role-based nav
│   ├── nav-main.tsx                   # Collapsible nav groups with expandable sub-items
│   ├── nav-user.tsx                   # Avatar dropdown with sign out via authClient
│   ├── providers.tsx                  # Client-side providers (QueryClient, Theme, etc.)
│   └── ui/                            # shadcn/ui primitives (18 files)
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── checkbox.tsx
│       ├── collapsible.tsx
│       ├── dropdown-menu.tsx
│       ├── field.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── menubar.tsx
│       ├── pagination-controls.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── sonner.tsx
│       ├── switch.tsx
│       ├── textarea.tsx
│       └── tooltip.tsx
│
├── emails/                             # React Email templates
│   ├── emergency-alert.tsx             #   Emergency alert email
│   ├── reset-password-email.tsx        #   Password reset email
│   ├── screening-result.tsx            #   Screening result notification
│   ├── staff-invitation.tsx            #   Staff invitation email
│   └── verification-email.tsx          #   Email verification template
│
├── hooks/                              # React Query hooks
│   ├── use-analytics.ts               #   useHospitalAnalytics()
│   ├── use-blood-group-usage.ts       #   Blood group usage stats
│   ├── use-city-labels.ts             #   City labels from location hierarchy
│   ├── use-donations.ts              #   Donation records
│   ├── use-donor-dashboard.ts        #   getUserById (incl. wallet)
│   ├── use-donor-history.ts          #   useDonorHistory(), useLocalDemandStats()
│   ├── use-donor-settings-form.ts    #   Donor settings form state
│   ├── use-eligible-donors.ts        #   listDonors() with filters + pagination
│   ├── use-emergency-mission-tracker.ts # Active emergency mission state
│   ├── use-emergency-requests.ts     #   Emergency request CRUD + alerts
│   ├── use-hospital-bank.ts          #   Hospital bank data
│   ├── use-inventory.ts              #   getAllHospitalBanks, auto-refetch 10s
│   ├── use-location-cascade.ts       #   Cascading region/state/city dropdown
│   ├── use-mobile.ts                 #   Mobile viewport detection
│   ├── use-screening.ts             #   Donor screening CRUD
│   ├── use-staff.ts                  #   Staff member CRUD
│   └── use-wallet.ts                 #   getWalletByUserId
│
├── lib/                                # Shared utilities and configuration
│   ├── animations.ts                  #   Framer-motion animation variants
│   ├── auth.ts                        #   BetterAuth server config (email/password, prisma adapter)
│   ├── auth-client.ts                 #   createAuthClient() for browser
│   ├── availability.ts                #   Availability type helpers
│   ├── blood-compatibility.ts         #   Blood group compatibility matrix
│   ├── constants.ts                   #   ELIGIBILITY_DAYS, POINTS_PER_DONATION, CRITICAL_THRESHOLD
│   ├── donor-types.ts                 #   UI types + helpers: EmergencyMatchRequest, BLOOD_GROUP_MAP
│   ├── eligibility.ts                 #   getEligibility()
│   ├── email.ts                       #   Resend client + sendEmail() wrapper
│   ├── geocoding.ts                   #   Server-side geocoding (env-keyed, private)
│   ├── get-query-client.ts            #   SSR-safe QueryClient factory
│   ├── get-session.ts                 #   Server-side session getter
│   ├── hospital-code.ts               #   Sequential hospital code generator (BIOMATCH-NNN)
│   ├── inventory-schema.ts            #   Zod validation for inventory writes
│   ├── organization-access.ts         #   Organization role/access helpers
│   ├── prisma.ts                      #   Singleton PrismaClient
│   ├── radius-expansion.ts            #   INITIAL_RADIUS, EXPANSION_INCREMENT, MAX_RADIUS, etc.
│   └── utils.ts                       #   cn() clsx+tailwind-merge helper
│
├── proxy.ts                            # Next.js 16 route guard — session + RBAC + email verification
│
├── servers/                            # Server Actions ("use server")
│   ├── analytics.ts                   #   getHospitalAnalytics(), exportDonationRecords()
│   ├── auth.ts                        #   signUpWithProfile(), loginWithRole()
│   ├── donation.ts                    #   Donation confirmation, mutual confirm, finalize
│   ├── emergency.ts                   #   Deep module — create, expand, respond, confirm, history
│   ├── hospital.ts                    #   HospitalBank CRUD
│   ├── location.ts                    #   Location hierarchy, scoring, proximity
│   ├── notification.ts               #   sendEmergencyAlertEmail() via Resend
│   ├── organization.ts               #   Organization CRUD, member/invitation management
│   ├── screening.ts                   #   Donor screening CRUD + eligibility checks
│   ├── staff.ts                       #   getStaffMembers(), inviteStaffMember(), etc.
│   └── user.ts                        #   User CRUD, listDonors(), wallet query
│
├── generated/
│   └── prisma/                        # Prisma 7 client output
│       ├── client.ts
│       ├── enums.ts
│       ├── models.ts
│       ├── commonInputTypes.ts
│       ├── browser.ts
│       └── internal/
│
├── prisma/
│   ├── schema.prisma                  # Full data model
│   ├── seed.ts                        # Seeds Nigerian location hierarchy
│   └── migrations/                    # 23 migration folders
│
├── components.json                    # shadcn/ui config
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── prisma.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json
```

## Current Data Fetching Pattern

All dashboard pages use React Query hooks instead of manual useState/useEffect/useCallback:

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

## Resolved in Issue 10 — Hospital Admin Features

| Issue | Severity | Status |
|---|---|---|
| Analytics not filterable by date range | Medium | ✅ Added startDate/endDate filters to getHospitalAnalytics + exportDonationRecords + date picker UI in AnalyticsDashboard |
| No access control on staff management | High | ✅ requireAdminRole() check in inviteStaffMember/updateStaffRole/removeStaffMember; StaffAccounts hides admin UI for non-admin roles |
| CSV export had no hospital name (just UUID) | Low | ✅ Export now includes hospital name with proper CSV quoting |
| Export didn't respect date range | Medium | ✅ exportDonationRecords now accepts optional dateRange parameter |
| `proxy.ts` not wired as middleware (wrong filename) | High | ✅ Renamed export to `middleware` — Next.js runs RBAC on every request via `src/proxy.ts` |

## Resolved in Issue 04

| Issue | Severity | Status |
|---|---|---|
| No live funnel status view with per-status donor lists | High | ✅ LiveStatusPanel shows alerted/accepted/declined/en_route/arrived/completed with donor names, blood groups, timestamps; 5s polling via useEmergencyRequestStatus |
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

## Resolved in Issue 13 — Landing Hero + Navbar

| Change | Status |
|---|---|
| Navbar redesigned: clean palette (`bg-background/95`), brand logo (solid `#C1121F`), removed gradient/glassmorphism | Done |
| Navbar CTAs: "Find Blood" → `/auth/login` (brand button), "Become a Donor" → `/auth/signup` (outline button) | Done |
| Navbar desktop links: Why Us, How It Works, Impact (scroll-to-section) | Done |
| Navbar session-aware: Console link + Sign Out when logged in | Done |
| Navbar mobile: hamburger menu with framer-motion AnimatePresence slide-down | Done |
| Navbar framer-motion fade-in-down entrance animation on mount | Done |
| Hero redesigned: flat design, no gradients/blurs/glassmorphism, `bg-background` solid | Done |
| Hero headline: "Digital Blood Banking for Everyone" | Done |
| Hero CTAs: "Find Blood" (large brand + arrow) and "Become a Donor" (large outline) | Done |
| Hero bento grid (2x2): 4 icon-cards with micro-stats (Droplets/Building2/Users/HeartPulse) | Done |
| Hero layout: text left + bento right on desktop, stacked on mobile | Done |
| Hero framer-motion: staggered card entrance (x-slide text, staggerChildren cards) | Done |

## Resolved in Issue 14 — Landing Stats + How It Works + Testimonials

| Change | Status |
|---|---|
| Stats section rewritten: 5 bento cards (Active Donors, Partner Hospitals, Blood Requests, Lives Saved, Available Blood Units) with `useInView` animated number counters | Done |
| How It Works section created: 3-step cards (Register, Find or Donate Blood, Save Lives) with lucide icons and scroll reveal | Done |
| Testimonials section created: 3 persona cards (hospital admin, donor, patient family) with avatar initials and quotes | Done |
| `mission.tsx` deleted — all references purged from `app/page.tsx`, `navbar.tsx`, `footer.tsx` | Done |
| Section anchors updated: `#mission` → `#stats`, `#services` → `#how-it-works` | Done |
| Page composition: Navbar → Hero → Stats → How It Works → Testimonials → Services → Impact → Footer | Done |
| All sections have framer-motion `whileInView` scroll-triggered animations with stagger | Done |
| Responsive: grid stacks to single column on mobile for all three sections | Done |

## Resolved in Issue 15 — Landing Services + Impact + Join + Footer

| Change | Status |
|---|---|
| Services section rewritten: 6 flat feature cards with brand-colored lucide icons, framer-motion stagger scroll reveal, no gradient backgrounds or decorative blurs | Done |
| Impact section rewritten: neutral dark bg (`bg-neutral-950`), 3 flat metric cards (2.3x / 94% / 99.2%), clean CTA card with brand buttons, no animated grid or pulsing blurs | Done |
| Join section rewritten: clean dark design with framer-motion entrance, updated palette tokens, uncommented in `page.tsx` | Done |
| Footer rewritten: flat dark bg, brand-colored logo, brand hover states on all links and social icons, no decorative blur background | Done |
| All gradient backgrounds, glassmorphism, and blur elements removed from all four sections | Done |
| Footer link "How It Works" updated to point to `#how-it-works` | Done |
| Footer framer-motion scroll reveal added | Done |

## Resolved in Issue 16 — Dashboard Sidebar + Top Bar

| Change | Status |
|---|---|
| Sidebar nav items: `rounded-xl`, brand-colored active state (`bg-brand/10 text-brand`), soft hover transitions | Done |
| Sidebar BioMatch logo/header: brand bg (`bg-brand`), `rounded-xl`, Geist `font-semibold tracking-tight`, cleaner subtitle | Done |
| `NavUser` moved from sidebar footer to top-right of top bar with avatar-only trigger (`rounded-full`) | Done |
| Notifications bell icon added to top bar with unread badge count via `BadgeCount` helper | Done |
| Emergency Alert Button (red SOS `AlertTriangle`) with `animate-pulse` when alerts active — links to `/hospital/emergency` or `/donor` | Done |
| Sidebar skeleton loader on initial mount using `SidebarMenuSkeleton` with `showIcon` | Done |
| Role-specific nav items preserved (donor/hospital/admin) | Done |
| `nav-main.tsx`: `cn()` for `rounded-xl` + brand active state classes | Done |
| `nav-user.tsx`: `variant` prop (`"sidebar" | "topbar"`), topbar mode uses `Button` trigger with `rounded-full` avatar | Done |
| `nav-user.tsx`: `ChevronsUpDown` restored in sidebar variant for dropdown affordance | Done |
| Top bar restyled: `bg-background`, clean border-b, consistent gap/padding | Done |

## Resolved in Issue 17 — Dashboard Bento Widget Restyle

| Change | Status |
|---|---|
| `stat-card.tsx`: added `hover:shadow-card-hover` transition + `StatCardSkeleton` export | Done |
| `section-card.tsx`: added `hover:shadow-card-hover` transition + `SectionCardSkeleton` export | Done |
| Donor dashboard `app/donor/page.tsx`: framer-motion `containerVariants`/`itemVariants` staggered entrance (staggerChildren: 0.08, y: 16, duration: 0.4) wrapping eligibility banner, ActiveMissionTracker, main bento grid | Done |
| Hospital dashboard `hospital-dashboard.tsx`: added summary stat cards bento grid row (Total Requests, Active Alerts, Donors Responding, Fulfilled) using StatCard + framer-motion staggered entrance on all tab content | Done |
| All 7 donor dashboard components restyled: outer cards changed from `rounded-3xl` to `rounded-xl` with `transition-shadow hover:shadow-card-hover` | Done |
| All 9 hospital dashboard components restyled: outer cards changed from `rounded-3xl` to `rounded-xl` with `transition-shadow hover:shadow-card-hover` | Done |
| Responsive bento grid: donor grid collapses to single column on mobile (`lg:grid-cols-3` → `grid-cols-1`) | Done (pre-existing) |
| Hospital stat cards: 2-col on mobile, 4-col on desktop (`grid-cols-2 lg:grid-cols-4`) | Done |

## Resolved in Issue 18 — Hospital Blood Search Cards

| Change | Status |
|---|---|
| **`blood-search-cards.tsx`**: New component — search/filter bar (blood group dropdown, location search, available-only toggle), bento card grid per hospital bank | Done |
| **`donor-cards.tsx`**: New component — card-style eligible donor list with staggered entrance animation, replaces table | Done |
| **`animations.ts`**: Shared framer-motion container/card variants extracted | Done |
| **`app/hospital/inventory/page.tsx`**: Replaced aggregate inventory grid with BloodSearchCards + DonorCards; updated title to "Blood Search"; improved loading skeleton | Done |
| Each bank card shows: hospital name (bold), location with MapPin icon, mini 4x2 grid of all 8 blood groups with unit counts and critical-state coloring, contact email, Reserve button (mailto:) | Done |
| Empty state with contextual message and "Clear filters" action | Done |
| Available-only toggle disabled when "All Blood Types" selected to prevent no-op | Done |
| `cn()` from `lib/utils` used for conditional class merging | Done |

## Resolved in Architecture Review (All 5 Candidates)

| Issue | Severity | Status |
|---|---|---|
| Donor scoring duplicated across createEmergencyRequest and expandSearchRadius | High | ✅ Extracted `scoreDonorProximity()` into location.ts |
| Alert aggregates computed twice (getEmergencyRequestStatus + getEmergencyHistory) | Medium | ✅ Extracted `computeAlertAggregates()` private helper |
| Wallet mutation inlined in confirmDonation while awardPoints sat dead in wallet.ts | Medium | ✅ Deleted wallet.ts, moved getWalletByUserId to user.ts |
| getDonorHistory + getLocalDemandStats lived in user.ts despite querying only emergency models | Medium | ✅ Moved to emergency.ts |
| ELIGIBILITY_DAYS duplicated in user.ts | Medium | ✅ Removed duplicate, imports from lib/constants.ts |
| POINTS_PER_DONATION redefined in history page | Low | ✅ Imports from lib/constants.ts |
| CRITICAL_THRESHOLD hardcoded in inventory page | Low | ✅ Imports from lib/constants.ts |
| createEmergencyRequest default radius 15 vs INITIAL_RADIUS 5 (bug) | Medium | ✅ Changed to INITIAL_RADIUS |
| Hospital dashboard localStorage race condition | High | ✅ Removed localStorage, uses React Query exclusively |
| DonorDirectory hardcoded mock data | Medium | ✅ Integrated to listDonors() via useEligibleDonors hook |
| AnalyticsDashboard static hardcoded stats | Medium | ✅ Real server action + hook computes from EmergencyAlert/EmergencyRequest |
| StaffAccounts in-memory CRUD with no persistence | Medium | ✅ Real server actions: getStaffMembers, inviteStaffMember, updateStaffRole, removeStaffMember |

## Remaining Issues

| Issue                                               | Severity | File(s)                                           |
| --------------------------------------------------- | -------- | ------------------------------------------------- |
| Inventory `updatedHealthInfo` still written as JSON even though all 5 fields now have typed columns | Low | `prisma/schema.prisma` |
| Hospital phone not in User schema — contactPhone always "N/A" in emergency feed | Low | `prisma/schema.prisma` |
| maxRadius and smsFallbackEnabled not persisted (no DB fields) | Low | `app/donor/page.tsx`, `components/donor/location-settings-card.tsx` |
| Hospital staff hospitalId not in schema (stored in updatedHealthInfo JSON) | Low | `prisma/schema.prisma`, `servers/staff.ts` |
