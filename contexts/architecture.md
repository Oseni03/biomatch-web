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
| Auth | better-auth (email/password) + organization plugin |
| Charts | recharts + @tremor/react (installed, minimal use) |
| Data Fetching | Server actions (`servers/`) + `@tanstack/react-query` |
| Toast | sonner |
| Theme | next-themes (dark-only) |

## Data Model (Prisma)

### Enums
- `Role`: `donor | hospital | admin`
- `BloodGroup`: `A_PLUS | A_MINUS | B_PLUS | B_MINUS | AB_PLUS | AB_MINUS | O_PLUS | O_MINUS`
- `UrgencyLevel`: `standard | critical` — for EmergencyRequest
- `RequestStatus`: `pending | matched | expired | cancelled | fulfilled` — for EmergencyRequest
- `AlertStatus`: `alerted | accepted | declined | withdrawn | en_route | arrived | completed` — for EmergencyAlert
- `Availability`: `weekdays | weekends | mornings | afternoons | evenings | anytime` — for User availability

### Current Models

**User** — Core identity. `name`, `email`, `emailVerified`, `bloodGroup`, `genotype`, `role`, `updatedHealthInfo` (JSON), `location` (string), `address`, `latitude`, `longitude`, `availability`, `isActive`, `lastDonationDate`, `deferredUntil`, `blacklistedAt`, `createdAt`, `updatedAt`. Relations: Session, Account, Wallet, EmergencyAlert (DonorAlerts), Donation, Member, Invitation.

**Organization** — BetterAuth org model. `name`, `slug` (unique), `logo`, `metadata`, `createdAt`, `updatedAt`. Relations: Member, Invitation, HospitalBank, EmergencyRequest.

**Member** — Organization membership. `organizationId`, `userId`, `role`, `createdAt`. Unique constraint on (organizationId, userId).

**Invitation** — Org staff invitations. `organizationId`, `email`, `role`, `status`, `expiresAt`, `createdAt`, `inviterId`.

**HospitalBank** — Blood bank record. `hospitalName`, `location`, `address`, `latitude`, `longitude`, `inventory` (JSON `Record<string, number>`), `organizationId`, `createdAt`, `updatedAt`. Relations: Organization, Donation.

**Wallet** — One per donor. `points`, `lifetimeDonations`, `createdAt`, `updatedAt`.

**EmergencyRequest** — Blood request from hospital. `organizationId`, `bloodGroup`, `unitsNeeded`, `urgencyLevel`, `status`, `searchRadius`, `createdAt`, `updatedAt`. Relations: Organization, EmergencyAlert, Donation.

**EmergencyAlert** — Donor alert for a request. `requestId`, `donorId`, `status`, `openedAt`, `respondedAt`, `donorConfirmedAt`, `hospitalConfirmedAt`, `responseReason`, `createdAt`, `updatedAt`.

**Donation** — Completed donation record. `donorId`, `hospitalBankId`, `emergencyRequestId`, `bloodGroup`, `donatedAt`, `createdAt`.

**Session, Account, Verification** — BetterAuth internal models.

### Removed Models (simplified out)
- `Location` — Nigerian location hierarchy (replaced with lat/long + free text)
- `DonorScreening` — per-visit screening (not in prototype spec)
- `InventoryTransaction` — inventory ledger (replaced with simple JSON column)
- `NotificationLog` — delivery tracking (not in prototype spec)

### Shared Domain Constants (`lib/constants.ts`)
- `ELIGIBILITY_DAYS = 56`, `POINTS_PER_DONATION = 100`, `CRITICAL_THRESHOLD = 5`

## Routing Structure

### Public Routes
| Path | Page | Description |
|---|---|---|
| `/` | `app/page.tsx` | Landing page |
| `/auth/login` | `app/auth/login/page.tsx` | Sign-in |
| `/auth/signup` | `app/auth/signup/page.tsx` | Register (donor/hospital toggle) |
| `/auth/onboarding` | `app/auth/onboarding/page.tsx` | Post-signup profile setup |
| `/auth/forgot-password` | `app/auth/forgot-password/page.tsx` | Request password reset |
| `/auth/reset-password` | `app/auth/reset-password/page.tsx` | Set a new password |
| `/auth/accept-invitation` | `app/auth/accept-invitation/page.tsx` | Accept org staff invite |

### Protected — Donor (`proxy.ts` guards role=donor)
| Path | Page | Description |
|---|---|---|
| `/donor` | `app/donor/page.tsx` | Dashboard — eligibility, alerts, critical needs |
| `/donor/history` | `app/donor/history/page.tsx` | Donation history & impact |

### Protected — Hospital
| Path | Page | Description |
|---|---|---|
| `/hospital` | `app/hospital/(dashboard)/page.tsx` | Dashboard — create & manage emergency requests |
| `/hospital/history` | `app/hospital/history/page.tsx` | Emergency request history |

### API
| Path | File | Description |
|---|---|---|
| `/api/auth/[...all]` | `app/api/auth/[...all]/route.ts` | BetterAuth catch-all |

## Core Loop (Prototype Spec)

1. **Hospital creates emergency request** → `createEmergencyRequest()` in `servers/emergency.ts`
2. **System matches eligible donors** → `matchDonors()` uses blood compatibility + eligibility + proximity scoring
3. **Donors alerted** → EmergencyAlert rows created with status `alerted`
4. **Donor responds** → `respondToAlert()` updates status to `accepted`
5. **Donor confirms donation** → `donorConfirmDonation()` sets `donorConfirmedAt`
6. **Hospital confirms** → `confirmDonation()` sets `hospitalConfirmedAt`
7. **Donation recorded** → `finalizeDonation()` creates Donation row + awards points + sets cooldown

## Auth Flow

1. **Signup** → `signUpWithProfile()` creates user via BetterAuth, creates Wallet for donors, creates Organization for hospitals
2. **Onboarding** → `/auth/onboarding` collects donor blood group / phone OR confirms hospital org name
3. **Login** → `loginWithRole()` authenticates and redirects to role dashboard
4. **Client** → `authClient.useSession()` provides session to client components

## Location & Proximity

- Simplified to lat/long coordinates + free text location string
- `scoreDonorProximity()` in `servers/location.ts` uses haversine distance
- Score tiers: ≤10km = 4, ≤25km = 3, ≤50km = 2, >50km = 0
- `proximityPassesThreshold()` applies radius-tiered threshold

## Key Patterns

- **Layout**: Each role section wraps children in `<SidebarLayout role="...">`
- **Server Actions**: All DB logic in `servers/*.ts` with `"use server"`
- **Data Fetching**: React Query hooks in `hooks/` wrap server actions
- **Styling**: Tailwind utility classes with brand color `#C1121F`
- **Sidebar**: `components/layout/sidebar.tsx` with role-based nav
- **Email**: Resend SDK via `lib/email.ts` for emergency alert emails
- **Toast**: Sonner `<Toaster>` in root layout
