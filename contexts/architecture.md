# BioMatch — Architecture

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.5 |
| Styling | Tailwind CSS 3.4 + shadcn/ui (Radix Nova) |
| Font | Inter via `next/font` |
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
- `IncentiveType`: `hmo_voucher | gym_discount`
- `ClaimStatus`: `pending | approved | redeemed`
- `UrgencyLevel` (planned): `standard | critical` — for EmergencyRequest
- `RequestStatus` (planned): `pending | matched | expired | cancelled | fulfilled` — for EmergencyRequest
- `AlertStatus` (planned): `alerted | opened | accepted | declined | en_route | arrived | completed` — for EmergencyAlert
- `EmergencyMatchRequest.status` (UI type in `lib/donor-types.ts`): `pending | matched | completed`
- `HmoTier` (planned): `none | basic | upgraded` — for User
- `NotificationChannel`: `email` — for NotificationLog
- `NotificationStatus`: `sent | delivered | opened | failed` — for NotificationLog
- `PartnerOrgStatus` (planned): `pending | active | suspended` — for PartnerOrganization
- `HospitalStaffRole` (planned): `admin | requester | viewer` — for User.hospitalStaffRole

### Current Models

**User** — Core identity. Stores `name`, `email`, `bloodGroup`, `genotype`, `role`, `updatedHealthInfo` (JSON), `location`, `availability`, `isActive`, `lastDonationDate`. Relations to: Session, Account, Wallet, HospitalBank (managedBanks), IncentiveClaim. *Planned additions: `hmoTier`, `hospitalStaffRole`, `hospitalId`.*

**HospitalBank** — Blood bank record. `hospitalName`, `location` (string), `inventory` (JSON blob of `Record<string, number>`), `managedBy` (optional User FK).

**Wallet** — One per donor. `points` (int), `lifetimeDonations` (int).

**IncentiveClaim** — Perk redemption request. `type`, `status`, `metadata` (JSON).

**Session, Account, Verification** — BetterAuth internal models.

### Radius Expansion Config (in `lib/radius-expansion.ts`)
- `INITIAL_RADIUS = 5`, `EXPANSION_INCREMENT = 5`, `MAX_RADIUS = 25`, `EXPANSION_TIMEOUT_MS = 300000`, `MAX_ALERTS_PER_REQUEST = 50`
- `canExpand()`, `nextRadius()`, `getRadiusTier()` helpers

### Emergency Models (in Schema)

- **EmergencyRequest** — id, hospitalId (FK to User), bloodGroup, unitsNeeded, urgencyLevel, status, searchRadius, createdAt, updatedAt. Server actions: createEmergencyRequest(), getEmergencyRequestStatus(), getEmergencyHistory(), getPendingEmergencyRequestsForHospital(), expandSearchRadius()
- **EmergencyAlert** — id, requestId (FK to EmergencyRequest), donorId (FK to User), status, respondedAt, createdAt, updatedAt. Server actions: getAlertsForDonor(), respondToAlert(), updateAlertStatus()
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
| `/hospital/blood-drive` | `app/hospital/blood-drive/page.tsx` | **STUB** — blood drive request |
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
2. **Login** → `servers/auth.ts:loginWithRole()` calls `better-auth` API, redirects to role dashboard
3. **Proxy** → `proxy.ts` checks session via `auth.api.getSession(request.headers)`, enforces role-based access, redirects unauthenticated users to `/auth/login`
4. **Client** → `authClient.useSession()` from `@/lib/auth-client` provides session to client components

## Key Patterns

- **Layout**: Each role section (`/donor`, `/hospital`, `/admin`) has a `layout.tsx` that wraps children in `<SidebarLayout role="...">`
- **Server Actions**: All DB logic in `servers/*.ts` with `"use server"` directive. Pages import and call directly.
- **Data Fetching**: React Query hooks in `hooks/` wrap server actions. Pages use `useQuery`/`useMutation` directly. `QueryClientProvider` in root layout with SSR-safe `makeQueryClient()`.
- **Styling**: Tailwind utility classes throughout. All global style blocks removed.
- **Sidebar**: `components/layout/sidebar.tsx` uses shadcn `SidebarProvider` + `Sidebar` + `SidebarInset` with `variant="inset"`. Nav items per role with pathname-based active highlighting. Uses `NavMain` (collapsible groups) and `NavUser` (avatar dropdown with `authClient.signOut()`). Extracted into `components/nav-main.tsx` and `components/nav-user.tsx`.
- **Email**: Resend SDK via `lib/email.ts` — sends React Email templates. Set `RESEND_API_KEY` env var for production; logs warning + returns mock ID when absent.
- **Toast**: Sonner `<Toaster>` in root layout. `toast.error()` / `toast.success()` in page try/catch blocks.
- **Component Architecture**: Pages own data fetching, state, and callbacks; delegate rendering to extracted presentational components via props.
- **Hospital Dashboard**: `components/hospital/hospital-dashboard.tsx` owns tab state, funnel seed data, radius expansion countdown, and donor-response simulation; delegates rendering to 8 extracted sub-components in `components/hospital/` including LiveStatusPanel (per-request funnel with donor lists, 5s polling) and EmergencyHistory (filterable/paginated past requests).
- **Live Status Panel**: `components/hospital/live-status-panel.tsx` shows funnel metrics (alerted/opened/accepted/declined/en_route/arrived/completed) with expandable donor lists per status; uses `useEmergencyRequestStatus` hook polling every 5s.
- **Request History**: `components/hospital/emergency-history.tsx` shows past requests with date range, blood type, and status filters; expandable rows show full funnel breakdown with shortfall indicators; paginated via `useEmergencyHistory` hook.
- **Reusable Components**: `components/dashboard/` for shared UI patterns, `components/donor/` for donor-specific components.
