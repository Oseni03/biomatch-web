# BioMatch — Architecture

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.5 |
| Styling | Tailwind CSS 3.4 + shadcn/ui (Radix Nova) |
| Font | Geist via `next/font/google` (Geist + Geist_Mono) |
| Icons | lucide-react |
| ORM | Prisma 7 + `@prisma/adapter-pg` |
| Database | PostgreSQL |
| Auth | better-auth (email/password) |
| Charts | recharts + @tremor/react (installed, not yet used) |
| Data Fetching | Server actions (`servers/`) + `@tanstack/react-query` (in use across all pages) |
| Toast | sonner |
| Theme | next-themes |

## Data Model (Prisma)

### Enums
- `Role`: `donor | hospital | admin`
- `BloodGroup`: `A_PLUS | A_MINUS | B_PLUS | B_MINUS | AB_PLUS | AB_MINUS | O_PLUS | O_MINUS`
- `LocationType`: `region | state | city` — for Location hierarchy
- `UrgencyLevel`: `standard | critical` — for EmergencyRequest
- `RequestStatus`: `pending | matched | expired | cancelled | fulfilled` — for EmergencyRequest
- `AlertStatus`: `alerted | accepted | declined | en_route | arrived | completed` — for EmergencyAlert
- `EmergencyMatchRequest.status` (UI type in `lib/donor-types.ts`): `pending | matched | completed`
- `HmoTier` (planned): `none | basic | upgraded` — for User
- `NotificationChannel`: `email` — for NotificationLog
- `NotificationStatus`: `sent | delivered | opened | failed` — for NotificationLog
- `PartnerOrgStatus` (planned): `pending | active | suspended` — for PartnerOrganization
- `HospitalStaffRole` (planned): `admin | requester | viewer` — for User.hospitalStaffRole

### Current Models

**User** — Core identity. Stores `name`, `email`, `bloodGroup`, `genotype`, `role`, `updatedHealthInfo` (JSON — health profile data only), `location` (display string), `locationId` (FK to Location), `availability`, `isActive`, `hospitalStaffRole` (typed enum: admin/requester/viewer), `lastDonationDate`. Relations to: Session, Account, Wallet, HospitalBank (managedBanks), Location. *Planned additions: `hmoTier`, `hospitalId`.*

**HospitalBank** — Blood bank record. `hospitalName`, `location` (string), `locationId` (FK to Location), `inventory` (JSON blob of `Record<string, number>`), `managedBy` (optional User FK).

**Location** — Nigerian location hierarchy. `name`, `type` (region/state/city/area), `parentId` (self-referential FK). Relations to: User (users), HospitalBank (hospitalBanks). Seed data in `prisma/seed.ts` covers 6 regions, 37 states, ~120 cities. Helpers in `servers/location.ts`.

**Wallet** — One per donor. `points` (int), `lifetimeDonations` (int).

**Session, Account, Verification** — BetterAuth internal models.

### Shared Domain Constants (in `lib/constants.ts`)
- `ELIGIBILITY_DAYS = 56`, `POINTS_PER_DONATION = 100`, `CRITICAL_THRESHOLD = 5`
- Single source of truth — imported by all consumers

### Radius Expansion Config (in `lib/radius-expansion.ts`)
- `INITIAL_RADIUS = 5`, `EXPANSION_INCREMENT = 5`, `MAX_RADIUS = 25`, `EXPANSION_TIMEOUT_MS = 300000`, `MAX_ALERTS_PER_REQUEST = 50`
- `canExpand()`, `nextRadius()`, `getRadiusTier()` helpers

### Emergency Models (in Schema)

- **EmergencyRequest** — id, hospitalId (FK to User), bloodGroup, unitsNeeded, urgencyLevel, status, searchRadius, createdAt, updatedAt. Server actions: createEmergencyRequest(), getEmergencyRequestStatus(), getEmergencyHistory(), getPendingEmergencyRequestsForHospital(), expandSearchRadius()
- **EmergencyAlert** — id, requestId (FK to EmergencyRequest), donorId (FK to User), status, openedAt, respondedAt, createdAt, updatedAt. Server actions: getAlertsForDonor(), respondToAlert(), updateAlertStatus(), markAlertOpened()
- **NotificationLog** — id, alertId (FK to EmergencyAlert), channel (email), status (sent/failed/delivered/opened), providerMessageId, sentAt, deliveredAt, openedAt, errorMessage. Server actions: sendEmergencyAlertEmail() in servers/notification.ts

### Planned Models (from PRD Issues)
- **HmoEnrollment** — id, userId, tier, providerEnrollmentId, enrolledAt, upgradedAt
- **PartnerOrganization** — id, name, contactEmail, contactPhone, logo, status, memberCount, createdAt, updatedAt
- **PartnerMember** — id, organizationId (FK to PartnerOrganization), userId (FK to User), invitedAt, joinedAt, isActive

## Routing Structure

### Public Routes
| Path | Page | Description |
|---|---|---|
| `/` | `app/page.tsx` | Landing page (Hero, Mission, Services, Impact, Join, Footer) |
| `/auth/login` | `app/auth/login/page.tsx` | Sign-in |
| `/auth/signup` | `app/auth/signup/page.tsx` | Register (donor/hospital toggle) |

### Protected — Donor (`middleware.ts` guards role=donor)
| Path | Page | Description |
|---|---|---|
| `/donor` | `app/donor/page.tsx` | Dashboard — eligibility, stats, critical needs |
| `/donor/health-profile` | `app/donor/health-profile/page.tsx` | Full health/medical form |
| `/donor/wallet` | `app/donor/wallet/page.tsx` | Rewards & perk redemption |

### Protected — Hospital
| Path | Page | Description |
|---|---|---|
| `/hospital/inventory` | `app/hospital/inventory/page.tsx` | Live inventory grid + eligible donors |
| `/hospital/donor-finder` | `app/hospital/donor-finder/page.tsx` | **STUB** — donor search |
| `/hospital/emergency` | `app/hospital/emergency/page.tsx` | Emergency request creation |

### Protected — Admin
| Path | Page | Description |
|---|---|---|
| `/admin` | `app/admin/page.tsx` | **STUB** — system overview |
| `/admin/verification` | `app/admin/verification/page.tsx` | **STUB** — verification queue |
| `/admin/contracts` | `app/admin/contracts/page.tsx` | **STUB** — partner contracts |

### API
| Path | File | Description |
|---|---|---|
| `/api/auth/[...all]` | `app/api/auth/[...all]/route.ts` | BetterAuth catch-all |

## Auth Flow

1. **Signup** → `servers/auth.ts:signUpWithProfile()` calls `better-auth` API, creates Wallet for donors
2. **Login** → `app/auth/login/page.tsx` calls `authClient.signIn.email()` directly, redirects client-side to role dashboard
3. **Client** → `authClient.useSession()` from `@/lib/auth-client` provides session to client components

## Design System (BioMatch)

The app uses a custom design system built on shadcn/ui CSS variables with the brand color `#C1121F` (`hsl(356, 83%, 41%)`).

### Color System
- **Brand**: `#C1121F` (--color-brand) for CTAs, accent, icons
- **Background**: `#FAFAF8` (warm white) page bg, `#FFFFFF` card bg
- **Text**: `#111110` primary, `#555550` secondary, `#888882` muted
- **Dark Section**: `#0F0F0E` bg, `#1C1C1A` surface, `#2A2A28` border
- CSS variables use HSL format in `:root` / `.dark` blocks in `globals.css`

### Typography
- Font: Geist (via next/font/google, configured in `app/layout.tsx`)
- Monospace: Geist Mono (via next/font/google, `--font-mono`)
- Custom sizes in tailwind config: `display-xl` (3.25rem), `display-lg` (2.5rem), `stat` (2.75rem)
- Eyebrow labels: 11px bold uppercase, `tracking-widest`, brand color

### Component Architecture
- **shadcn/ui primitives** (`components/ui/`) — Button, Card, etc. with custom variants
- **Landing sections** (`components/landing/`) — all use brand tokens

### Spacing
- 8px base grid. Common: 16px (standard), 24px (card), 64px (section mobile), 80px+ (section desktop)

### Shadows
- `shadow-card`: `0 2px 8px rgba(0,0,0,0.07)`
- `shadow-card-hover`: `0 8px 32px rgba(0,0,0,0.12)`
- `shadow-brand`: `0 4px 20px rgba(193,18,31,0.25)`

### Border Radius
- `rounded-[10px]` buttons/inputs, `rounded-2xl` (14px) cards, `rounded-3xl` (20px) feature cards, `rounded-full` badges

## Key Patterns

- **Layout**: Each role section (`/donor`, `/hospital`, `/admin`) has a `layout.tsx` that wraps children in `<SidebarLayout role="...">`
- **Server Actions**: All DB logic in `servers/*.ts` with `"use server"` directive. Pages import and call directly.
- **Data Fetching**: React Query hooks in `hooks/` wrap server actions. Pages use `useQuery`/`useMutation` directly. `QueryClientProvider` in root layout with SSR-safe `makeQueryClient()`.
- **Styling**: Tailwind utility classes throughout. Custom design system (brand color `#C1121F`) drives all color, typography, spacing.
- **Sidebar**: `components/layout/sidebar.tsx` uses shadcn `SidebarProvider` + `Sidebar` + `SidebarInset` with `variant="inset"`. Nav items per role with pathname-based active highlighting. Uses `NavMain` (collapsible groups) and `NavUser` (avatar dropdown with `authClient.signOut()`). Extracted into `components/nav-main.tsx` and `components/nav-user.tsx`.
- **Location Scoring**: Nigerian location hierarchy via `Location` model self-referential FK. Signup/health profile use cascading dropdowns (Region → State → City). Emergency scoring uses `getCommonAncestorDepth()` — same city = 3, state = 2, region = 1. Fallback string matching for users without `locationId`.
- **Email**: Resend SDK via `lib/email.ts` — sends React Email templates. Set `RESEND_API_KEY` env var for production; logs warning + returns mock ID when absent.
- **Toast**: Sonner `<Toaster>` in root layout. `toast.error()` / `toast.success()` in page try/catch blocks.
- **Component Architecture**: Pages own data fetching, state, and callbacks; delegate rendering to extracted presentational components via props.
- **Hospital Dashboard**: `components/hospital/hospital-dashboard.tsx` owns tab state and radius expansion countdown; delegates to LiveStatusPanel, EmergencyHistory, DonorDirectory (wired to listDonors), AnalyticsDashboard (wired to getHospitalAnalytics), and StaffAccounts (wired to CRUD server actions). No localStorage — all state in React Query cache.
- **Live Status Panel**: `components/hospital/live-status-panel.tsx` shows funnel metrics (alerted/accepted/declined/en_route/arrived/completed) with expandable donor lists per status; uses `useEmergencyRequestStatus` hook polling every 5s.
- **Request History**: `components/hospital/emergency-history.tsx` shows past requests with date range, blood type, and status filters; expandable rows show full funnel breakdown with shortfall indicators; paginated via `useEmergencyHistory` hook.
- **Reusable Components**: `components/dashboard/` for shared UI patterns, `components/donor/` for donor-specific components.
