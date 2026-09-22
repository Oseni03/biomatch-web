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

**User** — Core identity. `name`, `email`, `emailVerified`, `phoneNumber` (unique, E.164), `phoneNumberVerified`, `bloodGroup`, `genotype`, `role`, `updatedHealthInfo` (JSON), `location` (string), `address`, `latitude`, `longitude`, `availability`, `isActive`, `lastDonationDate`, `deferredUntil`, `blacklistedAt`, `createdAt`, `updatedAt`. Relations: Session, Account, Wallet, EmergencyAlert (DonorAlerts), Donation, Member, Invitation.

**Organization** — BetterAuth org model. `name`, `slug` (unique), `logo`, `metadata`, `createdAt`, `updatedAt`. Relations: Member, Invitation, HospitalBank, EmergencyRequest.

**Member** — Organization membership. `organizationId`, `userId`, `role`, `createdAt`. Unique constraint on (organizationId, userId).

**Invitation** — Org staff invitations. `organizationId`, `email`, `role`, `status`, `expiresAt`, `createdAt`, `inviterId`.

**HospitalBank** — Blood bank record. `hospitalName`, `location`, `address`, `latitude`, `longitude`, `inventory` (JSON `Record<string, number>`), `organizationId`, `createdAt`, `updatedAt`. Relations: Organization, Donation.

**Wallet** — One per donor. `points`, `lifetimeDonations`, `createdAt`, `updatedAt`.

**EmergencyRequest** — Blood request from hospital. `organizationId`, `bloodGroup`, `unitsNeeded`, `urgencyLevel`, `status`, `searchRadius`, `createdAt`, `updatedAt`. Relations: Organization, EmergencyAlert, Donation.

**EmergencyAlert** — Donor alert for a request. `requestId`, `donorId`, `status`, `openedAt`, `respondedAt`, `donorConfirmedAt`, `hospitalConfirmedAt`, `responseReason`, `createdAt`, `updatedAt`.

**ConsentRecord** — NDPR consent log (issue 04, append-only). `userId`, `consentType` (`terms | privacy_policy | data_processing | marketing`), `policyVersion` (always the server's `CONSENT_POLICY_VERSION`, never client input), `grantedAt`, `revokedAt` (marketing opt-out keeps the row), `ipAddress`.

**Donation** — Completed donation record. `donorId`, `hospitalBankId`, `emergencyRequestId`, `bloodGroup`, `donatedAt`, `createdAt`.

**Session, Account, Verification** — BetterAuth internal models.

### Removed Models (simplified out)
- `Location` — Nigerian location hierarchy (replaced with lat/long + free text)
- `DonorScreening` — per-visit screening (not in prototype spec)
- `InventoryTransaction` — inventory ledger (replaced with simple JSON column)
- `NotificationLog` — delivery tracking (not in prototype spec)

### Shared Domain Constants (`lib/constants.ts`)
- `ELIGIBILITY_MONTHS = 3`, `POINTS_PER_DONATION = 100`, `CRITICAL_THRESHOLD = 5`

### Donor Profile (issue 06)
- Donor code: `lib/donor-code.ts` — `BM-` + 6 chars from `0123456789ABCDEFGHJKMNPQRSTVWXYZ` (no I, L, O, U), regex `^BM-[0-9A-HJKMNP-TV-Z]{6}$` mirrors the `dp_donor_code_chk` CHECK; collision retry on the unique constraint
- Validation: `lib/donor-profile-validation.ts` (zod) — blood-group enum, past DOB, paired lat/lng range-checked
- Server actions (`servers/user.ts`): `getDonorProfile`, `updateDonorProfile`, `saveDonorProfile` (name + profile upsert, code generated once at creation), `updateLastKnownLocation` — all behind the consent gate
- Last-known location: `useLastKnownLocation` + `LastKnownLocationUpdater` (mounted in the donor layout; only pushes when geolocation permission is already granted)

### Phone Verification (issue 07)
- SMS layer: `lib/sms.ts` — Termii sender per ADR 009, `fake` provider with in-memory outbox for tests/dev; env `SMS_PROVIDER`, `TERMII_API_KEY`, `TERMII_SENDER_ID`, `TERMII_CHANNEL`
- Validation: `lib/phone-validation.ts` — E.164 regex (shared with the plugin validator), Nigerian local-format normalization, zod schema
- Plugin: better-auth `phoneNumber` in `lib/auth.ts` (6-digit OTP, 5-minute expiry, 3 attempts; no phone sign-in; verification optional for app use and matching) + `phoneNumberClient()` in `lib/auth-client.ts`; `/phone-number/*` rate-limit customRules
- Server actions (`servers/user.ts`, consent-gated): `getPhoneVerificationState`, `setPhoneNumber` (normalized save with `phoneNumberVerified: false`, uniqueness pre-check + P2002 mapping), `requestPhoneOtp` (60s resend cooldown + 5/hour cap per number)
- UI: `components/profile/phone-verification.tsx` mounted on `/donor/profile` and `/hospital/profile`

## Routing Structure

### Public Routes
| Path | Page | Description |
|---|---|---|
| `/` | `app/page.tsx` | Landing page — renders Navbar → Hero → BloodShortage (`#why-it-matters`) → HowItWorks → ForDonors → ForHospitals → Safety → Pricing → FinalCTA → Footer; computes `portalHref` via `getSessionRole` so signed-in users get portal CTAs instead of sign-up CTAs |
| `/auth/login` | `app/auth/login/page.tsx` | Sign-in |
| `/auth/signup` | `app/auth/signup/page.tsx` | Register (donor/hospital toggle; accepts `?role=donor\|hospital` to preselect the toggle) |
| `/auth/onboarding` | `app/auth/onboarding/page.tsx` | Post-signup profile setup |
| `/auth/forgot-password` | `app/auth/forgot-password/page.tsx` | Request password reset |
| `/auth/reset-password` | `app/auth/reset-password/page.tsx` | Set a new password |
| `/auth/consent` | `app/auth/consent/page.tsx` | NDPR re-consent screen — the proxy gate sends users missing required consents here with `?next=` |
| `/auth/accept-invitation` | `app/auth/accept-invitation/page.tsx` | Accept org staff invite |

### Protected — Donor (`proxy.ts` guards role=donor)
| Path | Page | Description |
|---|---|---|
| `/donor` | `app/donor/page.tsx` | Dashboard — eligibility, alerts, critical needs |
| `/donor/profile` | `app/donor/profile/page.tsx` | Donor profile — blood group, DOB, home pin (address/state/LGA + lat/lng), availability toggle, donor code with copy, verification badge, screening explainer (issue 06), phone/OTP verification (issue 07) |
| `/donor/notifications` | `app/donor/notifications/page.tsx` | Notifications — alert-derived + eligibility/profile items, filters, mark-read |
| `/donor/history` | `app/donor/history/page.tsx` | Donation history & impact |
| `/donor/rewards` | `app/donor/rewards/page.tsx` | Rewards wallet (issues 19/21) — balance from `DonorWallet`, ledger from `WalletTransaction`, voucher redeem flow + voucher list (`servers/vouchers.ts`), kobo→naira via `lib/money.ts` |
| `/donor/responses` | `app/donor/responses/page.tsx` | My Emergency Responses — active/accepted alerts |

### Protected — Hospital
| Path | Page | Description |
|---|---|---|
| `/hospital` | `app/hospital/(dashboard)/page.tsx` | Dashboard — time-aware greeting, summary strip, expandable active requests, recent-activity preview, create-request dialog; renders `AwaitingApproval` until the hospital is approved (issue 08) |
| `/hospital/history` | `app/hospital/history/page.tsx` | Emergency request history |
| `/hospital/emergency` | `app/hospital/emergency/page.tsx` | Full-page emergency request form (blood group, units, urgency, radius); renders `AwaitingApproval` until the hospital is approved (issue 08) |
| `/hospital/notifications` | `app/hospital/notifications/page.tsx` | Dispatch notifications derived from live pending requests + alert transitions |
| `/hospital/profile` | `app/hospital/profile/page.tsx` | Workspace profile from bank context (name, location, blood-bank status, role) + phone/OTP verification (issue 07) |

### API
| Path | File | Description |
|---|---|---|
| `/api/auth/[...all]` | `app/api/auth/[...all]/route.ts` | BetterAuth catch-all |

### Protected — Admin (`role=admin`)
- `/admin` — Platform overview (counts + review-queue state; full metrics arrive in issue 25)
- `/admin/hospitals` — Hospital list (status/search/pagination) + pending review queue
- `/admin/hospitals/[id]` — Hospital detail (registration, team, application history) + approve/reject/suspend/reinstate (issue 09)
- `/admin/merchants` — Merchant list (active/deactivated filter, pagination) + create (issue 20)
- `/admin/merchants/[id]` — Merchant detail (edit, activate/deactivate) + staff linking, enable/disable, set-password email for new accounts (issue 20)

### Admin & audit (issue 09)
- Founder admin is created by `prisma/seed.ts` (`FOUNDER_ADMIN_EMAIL`/`FOUNDER_ADMIN_PASSWORD`); every admin server action starts with `requireAdmin()`, and `/admin` routes are gated by the proxy plus the admin layout.
- Approval/rejection is one Prisma transaction (application row + `organization.verificationStatus` + `audit_logs` row) followed by an approval/rejection email; rejection requires a reason. Suspend/reinstate are approved-only/suspended-only transitions, audit logged.
- Rejected hospitals reapply from the portal (`reapplyForVerification`, owner/admin only); the `hv_one_pending_key` partial unique index guarantees a single open application.
- `servers/audit.ts` exposes `writeAuditLog()` reused by all later slices.

### Hospital team & RBAC (issue 10)

- Permission catalog (`bloodRequest: create/read/update/close`,
  `donor: read/confirmDonation/recordScreening`, `history: read`) lives in
  `lib/organization-access.ts` (`domainPermissions`); built-in
  Owner/Admin/Member roles plus per-hospital custom roles (`organizationRole`).
- `requireOrgPermission()` (`servers/organization.ts`) is the reusable
  server-side check for all later slices — union over the caller's roles,
  custom roles validated through Better Auth access control, suspended denied.
- Org administration (invites, role changes, removals, custom roles) requires
  built-in owner/admin (`requireOrgManager`); last-owner demote/suspend/remove
  blocked; suspend stores the previous role for reinstatement.
- `/hospital/team` manages members, pending invitations and custom roles;
  multi-hospital users switch via the sidebar `OrganizationSwitcher`
  (session `activeOrganizationId`, honoured by `getActiveOrganizationId`).

### Donor screening (issue 11)

- Admin toggles `isScreeningPartner` on approved hospitals only
  (`setScreeningPartner`, audit logged; `PartnerToggle` on the hospital detail).
- Partner staff with `donor:recordScreening` look donors up by code
  (rate-limited, generic not-found) and record passed/failed + notes
  (`servers/screening.ts`); the `sync_donor_verification` trigger syncs
  latest-wins status and rejects non-partner writes at the database level.
- `/hospital/screening` is the staff screening screen; the donor profile shows
  the live verification status.

### Blood requests & matching (issue 12)

- Tunables live in `lib/config.ts` (radii, escalation window, location
  freshness, cooldown, reward, voucher validity).
- `createBloodRequest()` (`servers/requests.ts`): consent + approval +
  `bloodRequest:create`; blood group, units, hospital-defaulted location;
  optional hospital-private internal reference (never sent to donors); all
  requests urgent, no tiers. Hospital emergency form + dashboard dialog call it.
- `findEligibleDonors()` (`servers/matching.ts`): compatibility, verified,
  active, available, cooldown, ban, radius; fresh last-known location else home
  pin; phone verification ignored. Re-runs only add newly eligible donors.
- `matchDonorsForRequest()` writes one match row per donor plus a simultaneous
  in-app notification (blood type, hospital name/location only).
- Donors: Requests Nearby (`/donor/responses`) and Notification Inbox with
  read/unread (`/donor/notifications`); sidebar badge counts live nearby
  requests. Donor payloads are key-tested to exclude internal fields.

### Accept, withdraw & Donor View (issue 13)

- `acceptMatch()` (`servers/responses.ts`) re-checks eligibility, then runs
  the atomic counter UPDATE — simultaneous accepts never overfill; winners
  become accepted with a pending `Donation` + hospital notification, losers
  become filled with a donor-facing message. Repeat/late accepts return the
  outcome instead of throwing.
- `withdrawMatch()` decrements, removes the pending donation, reopens to
  active and flips filled matches back to notified without re-notifying.
- Hospital Donor View (`/hospital/requests/[id]`, `getRequestDonorView`):
  response statuses for all matches, contact (name, code, phone) only after
  acceptance. Donors accept/withdraw/decline from Requests Nearby
  (`useAcceptMatch`, `useWithdrawMatch`, `useDeclineMatch`,
  `getMyResponses`).
- `declineMatch()` chains exactly one replacement — the closest eligible
  unnotified donor up to the max radius — in the same transaction;
  already-matched exclusion plus the unique constraint guarantee
  never-notify-twice, and an empty pool resolves cleanly.
- Timed escalation (issue 15, ADR 005 cron polling): `escalateDueRequests()`
  claims due active requests with a guarded update (concurrency-safe),
  widens by step to max, matches new-only donors, resets or clears the
  timer. `GET /api/cron/escalate` (bearer `CRON_SECRET`), every 10 min via
  `vercel.json`.
- Request management (issue 16): `getActiveRequests()` /
  `getRequestHistory()` feed `/hospital/requests` and
  `/hospital/requests/history`. `updateBloodRequest()` (active-only, never
  below accepted), `cancelBloodRequest()` / `closeBloodRequest()` via
  `settleRequest()` — expires pending matches, cancels accepted matches +
  pending donations, clears the timer, notifies matched donors so their
  Nearby list and inbox reflect the closure.
- Multichannel delivery (issue 17): `dispatchNotification()` fans every
  in-app notification out to SMS (Termii), WhatsApp (Meta Cloud API) and
  email (Resend) per verified phone + `notify*` prefs, with per-channel
  delivery rows, WhatsApp→SMS fallback, cap-limited retries
  (`retryFailedDeliveries`), provider callbacks
  (`POST /api/webhooks/delivery`), failures visible on `/admin`, prefs card
  in the donor inbox. Triggered on match, decline-chain, accept and
  close/cancel; completion hooks in when issue 18 lands.

### Donation completion, wallet & vouchers (issues 18-21)

- Dual confirmation (`servers/donations.ts`): donor + hospital confirm,
  first claim wins via a guarded `updateMany`; completion writes the match,
  cooldown (`COOLDOWN_DAYS`), and exactly one `donation_reward` ledger row
  (partial unique index `wt_one_reward_per_donation`). Never update
  `DonorWallet` from app code — the trigger is the single balance writer.
- Wallet (`servers/wallet.ts`): consent-gated balance + paginated ledger;
  money is integer kobo in the DB, formatted by `lib/money.ts`.
- Vouchers (`servers/vouchers.ts`): `issueVoucher()` creates the voucher
  (unguessable `XXXX-XXXX-XXXX` code, `expiresAt` from
  `VOUCHER_VALIDITY_DAYS`) plus the negative ledger entry in one transaction;
  a client-generated `idempotencyKey` (`@@unique([donorId, idempotencyKey])`)
  makes double-submits return the one voucher. `listVouchersForDonor()` feeds
  My Vouchers; `listVouchersForAdmin()` feeds the admin report (issue 25).
- `apply_wallet_entry()` is UPDATE-first with an INSERT +
  `unique_violation` fallback. Never use INSERT ... ON CONFLICT DO UPDATE
  here: Postgres validates CHECKs on the proposed row before conflict
  detection, so every debit would die on `donor_wallets_balance_chk` even
  with sufficient balance (found live in slice 21). The CHECK on the final
  row is the overdraft arbiter under concurrency — app code only pre-checks
  for a friendly message.
- Merchants (`servers/merchants.ts`, `/admin/merchants`, issue 20): admin
  CRUD + activate/deactivate, staff link/enable/disable, staff creation via
  admin `createUser` + set-password email; `listActiveMerchants()` is the
  redemption picker source (deactivated hidden), `getMerchantPortalContext()`
  authorises slice 22.
- Merchant portal (`/merchant`, issue 22): minimal no-sidebar pages for
  active staff only (proxy consent-gated; page renders access-denied without
  a link; login sends linked staff straight to `/merchant`). Cashier checks
  a code (preview: amount + expiry) then confirms; redeeming is one guarded
  `updateMany` (issued + unexpired + own merchant) so concurrent claims let
  exactly one through. Expired/used/unknown/other-merchant codes — and
  non-staff callers — all get one generic message; redemption records
  staff + time and audit logs; history shows code, amount, donor code and
  who redeemed.

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
2. **Hospital registration + verification (issues 05/08)** → `/auth/signup?role=hospital` collects hospital name, registration number, official email, contact, phone, address/state/LGA and an explicit location pin (lat/lng with find-from-address + empty state), then `organization.create` through the Better Auth organization plugin. The creator becomes `owner`; `verificationStatus`/`isScreeningPartner`/`approvedAt` stay server-controlled (`input: false`, tested) and the plugin hook opens exactly one pending `HospitalVerification` (second pending blocked by `hv_one_pending_key`). Until approved, dashboard + emergency pages render `AwaitingApproval` (pending/rejected/suspended/no-org states) and `requireApprovedHospital()` rejects request creation on the server. Approval itself arrives in issue 09.
2. **Consents** → signup and invitation-signup forms require terms + privacy + data-processing acceptance (marketing optional); `acceptConsents()` records rows at the server policy version with the request IP. Acceptance is idempotent — re-submitting creates no duplicates.
3. **Gate** → `proxy.ts` redirects authenticated users missing required consents away from `/donor`, `/hospital`, `/admin`, `/auth/onboarding` to `/auth/consent?next=…`; `requireConsentsForUser()` enforces the same gate inside `servers/user.ts` and `servers/organization.ts` (new authed endpoints must call it). Bumping `CONSENT_POLICY_VERSION` forces re-consent. Required consents can't be withdrawn (points to account deletion); marketing toggles in profile settings keep revoked rows.
4. **Onboarding** → `/auth/onboarding` collects donor blood group / phone OR confirms hospital org name
3. **Login** → `authClient.signIn.email()` authenticates, client redirects to role dashboard
4. **Client** → `authClient.useSession()` provides session to client components

## Location & Proximity

- Simplified to lat/long coordinates + free text location string
- `scoreDonorProximity()` in `servers/location.ts` uses haversine distance
- Score tiers: ≤10km = 4, ≤25km = 3, ≤50km = 2, >50km = 0

## Key Patterns

- **Layout**: Each role section wraps children in `<SidebarLayout role="...">`
- **Server Actions**: All DB logic in `servers/*.ts` with `"use server"`
- **Data Fetching**: React Query hooks in `hooks/` wrap server actions
- **Styling**: Tailwind utility classes with brand color `#C1121F`
- **Sidebar**: `components/layout/sidebar.tsx` with role-based nav
- **Email**: Resend SDK via `lib/email.ts` for emergency alert emails
- **Toast**: Sonner `<Toaster>` in root layout
