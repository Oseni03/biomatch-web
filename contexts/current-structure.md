# BioMatch — Current File Structure

> Last updated: 2026-09-22 — Issue 10 (hospital team + RBAC) implemented:
> `requireOrgPermission()` union check over built-in + custom roles
> (`authorizeOrgAction` delegates; `getActiveOrganizationId` honours the
> session's active org); new `src/servers/team.ts` (manager gate, members,
> email invites wired to the accept flow, custom-role CRUD, suspend/reinstate
> with role restore, last-owner protection, org switching); `/hospital/team`
> page + sidebar `Team & Roles` nav + multi-hospital `OrganizationSwitcher`;
> `tests/hospital-team.test.ts` (7 passing).
> Previous state:
>
> Last updated: 2026-09-22 — Issue 09 (admin hospital approval) implemented:
> `prisma/seed.ts` creates the founder admin from env (idempotent, consents
> recorded); new `src/servers/admin.ts` (`requireAdmin`, hospital list/queue/
> detail, transactional approve/reject + emails, suspend/reinstate, portal
> reapply) and `src/servers/audit.ts` (`writeAuditLog`); new `/admin` routes
> (overview, hospitals list + queue, `[id]` detail + review actions) with
> loading/error boundaries and empty states; sidebar `Role` gains `admin`;
> rejected hospitals get a portal `ReapplyButton`; new approval/rejection
> email templates; `tests/admin-approval.test.ts` (7 passing).
> Previous state:
>
> Last updated: 2026-09-22 — Issue 08 (hospital registration + pending state) implemented:
> `src/servers/organization.ts` gained `getOrganizationVerificationStatus` /
> `requireApprovedHospital` (server-side "awaiting approval" gate);
> `src/servers/emergency.ts` `createEmergencyRequest` calls the gate first
> (request creation itself still arrives in slice 12);
> `src/servers/hospital.ts` now reads the real organization row
> (`getHospitalSidebarContext` status-mapped, new
> `getHospitalVerificationState`) and the dead `createHospitalBank` stub was
> removed; new `src/components/hospital/awaiting-approval.tsx`
> (pending/rejected/suspended/no-org states with next-steps + empty states)
> rendered by `/hospital` dashboard and `/hospital/emergency` for unapproved
> workspaces; `/auth/signup?role=hospital` collects required registration
> number plus an explicit location pin (editable lat/lng, find-from-address,
> pin-set/no-pin states, range validation); new
> `tests/hospital-verification.test.ts` (privileged-field stripping, one-pending
> enforcement incl. DB unique rejection, pending blocked / approved allowed /
> rejected blocked — 4 passing).
> Previous state:
>
> Last updated: 2026-09-22 — Issue 07 (phone verification OTP) implemented:
> new `src/lib/sms.ts` (Termii sender per ADR 009 + `fake` provider with
> in-memory outbox; `SMS_PROVIDER`/`TERMII_*` env names decided here) and
> `src/lib/phone-validation.ts` (E.164 regex shared with the plugin
> validator, NG local-format normalization, zod schema); better-auth
> `phoneNumber` plugin enabled (6-digit OTP, 5-min expiry, 3 attempts, no
> phone sign-in, verification optional) with `phoneNumberClient()`;
> `src/servers/user.ts` gained `getPhoneVerificationState` /
> `setPhoneNumber` (normalized save resetting `phoneNumberVerified`, unique
> pre-check + P2002 mapping) / `requestPhoneOtp` (60s cooldown + 5/hour cap,
> all consent-gated); new `PhoneVerification` component mounted on
> `/donor/profile` and `/hospital/profile` (verified/unverified states,
> SMS+WhatsApp explainer); new `tests/phone-verification.test.ts`
> (normalization, fake outbox, full OTP round-trip incl. wrong/expired
> rejection, change-resets, uniqueness, cooldown, hourly cap — 11 passing).
> Previous state:
>
> Last updated: 2026-09-22 — Issue 06 (donor profile + donor code) implemented:
> new `src/lib/donor-code.ts` (BM- + 6 unambiguous chars, format check,
> collision-retry generator) and `src/lib/donor-profile-validation.ts` (zod:
> blood group, past DOB, paired range-checked lat/lng, last-known location);
> `src/servers/user.ts` gained `getDonorProfile` / `updateDonorProfile` /
> `saveDonorProfile` (name + profile upsert, code generated once at creation
> with P2002 retry) / `updateLastKnownLocation` (all consent-gated);
> `/donor/profile` client rebuilt on the real `DonorProfile` fields (blood
> group, DOB, address/state/LGA, home pin with use-my-location +
> find-from-address, availability switch, donor-code card with copy,
> verification badge, unverified screening explainer, no-code/no-pin empty
> states); new `useLastKnownLocation` hook + `LastKnownLocationUpdater`
> mounted in the donor layout (pushes only with granted permission);
> `hasIncompleteProfile` repointed at `DonorProfile` fields; new
> `tests/donor-profile.test.ts` (14 passing). Previous state:
>
> Last updated: 2026-09-22 — Issue 05 (landing page) implemented: landing
> sections already existed; added the missing hospital-registration target as a
> hospital mode on `/auth/signup?role=hospital` (contact + hospital + address/
> state/LGA fields, server-side geocode via new `geocodeAddressAction` in
> `servers/location.ts`, org create through the Better Auth organization
> plugin so verificationStatus stays pending and exactly one
> HospitalVerification is opened, creator becomes owner), derived portal
> routing (`getSessionRole` → `/donor|/hospital|/admin`) passed as
> `portalHref` to Navbar/Hero/FinalCTA/Pricing so signed-in users see a portal
> button instead of sign-up CTAs (also fixes Navbar's broken `/${role}`
> link), and `tests/hospital-registration.test.ts` (geocode guard +
> registration asserts incl. client-cannot-self-approve — 2 passing). Full
> verification form, pending-approval screen and API enforcement stay in
> issue 08. Previous state:
> `ConsentRecord` schema existed, no enforcement. Added `src/lib/consent.ts`
> (server policy version + pure gate helpers), `src/servers/consent.ts`
> (session-derived `acceptConsents`/`updateMarketingConsent`/`withdrawConsent`,
> userId-based `recordConsentsForUser`/`setMarketingForUser`/`requireConsentsForUser`/`hasSatisfiedConsents` for the
> proxy and tests), `src/hooks/use-consent.ts`, `src/components/consent/`
> (`consent-choices` shared checkboxes, `marketing-consent-toggle` settings
> switch), `/auth/consent` re-consent route (page + client + loading + error),
> required checkboxes on signup + invitation signup, `MarketingConsentToggle`
> embedded in donor + hospital profile, proxy gate redirecting ungated
> `/donor|/hospital|/admin|/auth/onboarding` visits to `/auth/consent?next=…`,
> `requireConsentsForUser` wired into `servers/user.ts` (`getUserById`,
> `updateUserProfile`) and `servers/organization.ts` (org id/role/authorize
> choke points; `getSessionRole` stays exempt for the proxy), and
> `tests/consent-gate.test.ts` (gate, idempotency, revoke-keeps-rows,
> version-bump, required-withdrawal refusal — 5 passing). Future slices must
> call `requireConsentsForUser` from new authed endpoints (emergency stubs in
> `servers/emergency.ts` left ungated until slices 12–18 thread a caller id
> through). Previous state:

> Last updated: 2026-09-21 — Remodel issue 01 (HITL) decided: no separate
> backend service; backend = Next.js server layer (Route Handlers + Server
> Actions), single host. ADRs committed under `docs/adr/` (001 backend
> layout, 002 auth topology, 003 API style, 004 hosting/secrets,
> 005 background jobs, 006 prototype-data reset, 007 frontend keep-list,
> 008 Prisma carry-over). ADR follow-ups implemented same day: `src/lib/auth.ts`
> simplified to single same-domain URL (COOKIE_DOMAIN stub removed,
> BETTER_AUTH_URL kept as fallback; `notification.ts` alert link aligned,
> `.env.local.example` switched to APP_URL), `DEPLOYMENT.md` rewritten for the
> current stack, `vercel.json` buildCommand fixed to `npm run vercel-build`.
> Slices 03 and 29 still need rescoping (both assumed the split). Previous state:

```
docs/
├── adr/                              # Remodel issue 01 decisions (HITL, 2026-09-21)
│   ├── 001-backend-framework-and-layout.md
│   ├── 002-auth-topology.md
│   ├── 003-api-style.md
│   ├── 004-hosting-environments-secrets.md
│   ├── 005-background-jobs.md
│   ├── 006-prototype-data.md
│   ├── 007-frontend-keep-list.md
│   ├── 008-prisma-config.md
│   ├── 009-messaging-providers.md
│   └── 010-slice-03-rescope.md
```


> Last updated: 2026-09-20 — Hospital mock re-merge pass: the React-Router `HospitalSidebar`/`HospitalDashboardPage` prototype was already merged (see "Previous state" below), so no verbatim port; the one uncovered mock concept — the sidebar "Create Blood Request" quick action — is now covered by a route-compliant CTA in `components/sidebar/hospital-sidebar.tsx` (links to `/hospital/emergency`, brand tokens, closes mobile drawer). Mock concepts still intentionally NOT ported: local useState request lists, Routine/Urgent 3-tier urgency, emergencyRef/location free-text, tab-state navigation, hard-coded dark hexes, manual Mark-Fulfilled, hard-coded notifications/profile content. Follow-up: dashboard greeting now takes the server-resolved bank name as a prop (`page.tsx` via `getHospitalSidebarContext`, same source + fallback chain as the sidebar workspace card and profile page) instead of guessing from the first pending request / client session — so the greeting, sidebar, and profile always show the same hospital name. Previous dead-code sweep state:

> Previous state: Merged the (React-Router prototype) hospital dashboard mock into the real hospital section, following the donor-dashboard-merge precedent. `EmergencyRequestForm` is now a shadcn-Dialog creation modal (blood-type grid, 1–20 unit stepper, Standard/Critical urgency mapped to the schema enum, 5–25km radius slider, toasts + query invalidation on success). `LiveStatusPanel` gained the mock's card layout (BloodTypeBadge hero, urgency + Donors-Responding status tags, notified/responding/created meta grid, expandable responding-donor coordination list with relative times, expand-radius action) while keeping the funnel grid. `hospital-broadcasts-client` composes a time-aware `DashboardGreeting` + summary strip (Active/Responding/Notified) + active list with mock-style empty state + new `RecentActivitySection` (3-item `useEmergencyHistory` preview linking to full history). New real-data routes close the dead `/hospital/notifications` nav link (dispatch feed derived from pending requests + alert transitions, no new model) and add `/hospital/profile` (bank context + member role + compliance note, no invented accreditation IDs); nav gained a Hospital Profile item. Mock concepts intentionally NOT ported: local useState request lists (React Query owns data), Routine/Urgent 3-tier urgency (schema is standard/critical), emergencyRef/location free-text (org + bank location own this), tab-state navigation (routes own this), hard-coded dark hexes (design tokens own this), manual Mark-Fulfilled (fulfillment is the mutual-confirmation flow).

> Follow-up cleanup same day — single stats source + nav wiring: `HospitalDashboardShell` is the only stats surface (fixed `Donors Responding` to count responded-only via aggregates instead of all alerts; replaced the always-zero `Fulfilled` card — the pending query never returns fulfilled rows — with real `Awaiting Confirmation` from `useAlertsAwaitingConfirmation`; replaced the always-equal `Total Requests` with `Donors Notified`; the duplicate inline strip was removed from `hospital-broadcasts-client`). `LiveStatusPanel`'s unused `organizationId` prop removed. Dead `/hospital/inventory` link in the emergency-form success state now points to `/hospital`. Nav: `Active` badge moved to Dashboard (the page listing live requests), Emergency Requests description now matches its creation-form reality, redundant `/hospital/profile` special-case removed from `getHospitalPageTitle` (nav config is single-source). `SidebarLayout` now feeds the hospital Notifications red dot from live data (lit when an alert is accepted/en-route/arrived).

> Previous state: Added the missing `/donor/notifications` route the donor sidebar already linked to (was a dead 404). New `app/donor/notifications/` route (`page.tsx` server prefetch + `donor-notifications-client.tsx` + `loading.tsx`/`error.tsx`) with presentational `components/donor/notifications-section.tsx`: All/Unread/Blood-Requests filters, unread badge + mark-all-read, per-item mark-as-read, all wired to real data (alert-derived `blood_request`/`status_update` items with `openedAt` as the read receipt via existing `markAlertOpened`, plus derived `eligibility_reminder`/`account_notification` items — no new DB model). Donor section layout now feeds the sidebar's Notifications red dot from a live unopened-alert count. `DonorAlertWithRequest` alert-item type extended with the `openedAt`/`respondedAt`/`responseReason`/`createdAt`/`updatedAt` fields the queries already returned. Previous state: wired both role sidebars. Hospital: `SidebarLayout` branches to the dedicated `HospitalSidebar` fed by `getHospitalSidebarContext` (org bank name/location + live blood-bank status); `HOSPITAL_NAV_ITEMS` targets real routes. Donor: `AppSidebar` nav points at real routes (dead `/donor/requests` removed; `/donor/notifications` implemented 2026-09-20, live alert badge moved to Dashboard) and the eligibility card is now fed client-side from the prefetched donor-dashboard query. Same session: merged the (React-Router prototype) donor dashboard mock into the real donor dashboard — new `UrgentRequestCard` hero ("Urgent Request Near You", I Can Help / Not Available feeding existing respond/decline, confirmed-mission state with en-route/arrived/donation-confirm/withdraw), plus Eligibility and Verified Donation Record cards; `ActiveMissionTracker` component retired (its confirmed-mission role absorbed by the hero card). Follow-up same day: ported the mock's remaining layout deltas into `donor-dashboard-client.tsx` — in-page tabs (Dashboard / Live Requests / My Responses with live counts), time-aware greeting with standby subtitle, `My Responses` view reusing `UrgentRequestCard` for accepted/en-route/arrived/completed alerts with the mock's empty state, `max-w-4xl` content constraint, Eligibility + Ledger scoped to the Dashboard tab; removed a stray `icon="heart"` prop on the shared Button (no such prop — Heart already renders as a child). Accept path in `useEmergencyMissionTracker` now fires a success toast ("Response confirmed. The hospital blood bank team has been notified.") matching the prototype's confirmation toast.

```
src/
├── app/                            # Next.js App Router
│   ├── api/
│   │   └── auth/[...all]/route.ts  # BetterAuth API catch-all
│   ├── auth/
│   │   ├── accept-invitation/page.tsx # Accept org staff invite
│   │   ├── consent/page.tsx        # NDPR re-consent screen (issue 04) + consent-client + loading + error
│   │   ├── forgot-password/page.tsx   # Request password reset
│   │   ├── login/page.tsx             # Sign-in (brand logo + AuthForm + resend verification)
│   │   ├── onboarding/page.tsx        # Post-signup profile setup (blood group, phone, org name)
│   │   ├── reset-password/page.tsx    # Set new password from reset token
│   │   └── signup/page.tsx            # Registration (donor/hospital toggle)
│   ├── donor/                          # Donor section (role=donor)
│   │   ├── layout.tsx                  #   Wraps children in SidebarLayout role="donor" + live unread-alert dot
│   │   ├── page.tsx                    #   Dashboard — server data loader
│   │   ├── donor-dashboard-client.tsx  #   Dashboard (urgent hero + eligibility + ledger + feed)
│   │   ├── loading.tsx                 #   Route-level skeleton
│   │   ├── error.tsx                   #   Route-level error boundary
│   │   ├── notifications/
│   │   │   ├── page.tsx                #   Notifications — server data loader
│   │   │   ├── donor-notifications-client.tsx #  Alert-derived + eligibility/profile items, filters, mark-read
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   ├── responses/
│   │   │   ├── page.tsx                #   My Emergency Responses — server data loader
│   │   │   ├── donor-responses-client.tsx #  Active responses (accepted/en_route/arrived/completed) + pagination
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   ├── profile/
│   │   │   ├── page.tsx                #   Donor profile — server data loader
│   │   │   ├── donor-profile-client.tsx #  Issue 06 fields + donor code + issue 07 PhoneVerification
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   └── history/
│   │       ├── page.tsx                #   Donation history & impact
│   │       ├── donor-history-client.tsx
│   │       ├── loading.tsx
│   │       └── error.tsx
│   ├── hospital/                       # Hospital section (role=hospital)
│   │   ├── layout.tsx                  #   Wraps children in SidebarLayout role="hospital"
│   │   ├── (dashboard)/                #   Route group — hospital dashboard
│   │   │   ├── layout.tsx              #     Dashboard layout
│   │   │   ├── page.tsx                #     Dashboard overview
│   │   │   ├── hospital-broadcasts-client.tsx # Dashboard (greeting + summary strip + active cards + recent activity)
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   └── history/
│   │       ├── page.tsx                #   Emergency request history
│   │       ├── loading.tsx
│   │       └── error.tsx
│   │   ├── emergency/
│   │   │   ├── page.tsx                #   Full-page emergency request form
│   │   │   ├── emergency-request-client.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   ├── notifications/
│   │   │   ├── page.tsx                #   Dispatch feed derived from pending requests + alerts
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   └── profile/
│   │       ├── page.tsx                #   Workspace profile (bank context + member role)
│   │       ├── loading.tsx
│   │       └── error.tsx
│   ├── globals.css                     # Tailwind directives + theme variables
│   ├── layout.tsx                      # Root layout: Geist font, ThemeProvider, QueryClientProvider, Toaster
│   └── page.tsx                        # Landing page
│
├── components/
│   ├── auth/
│   │   ├── accept-invitation-client.tsx # Org staff invite accept flow
│   │   ├── auth-card.tsx               # Card wrapper (icon + title + description)
│   │   ├── auth-constants.ts           # Shared shell stats
│   │   ├── auth-form.tsx               # Shadcn auth card form (title, error/success alert, footer)
│   │   ├── auth-form-field.tsx         # Legacy labeled input (icon: mail/lock/phone, toggle)
│   │   ├── auth-input.tsx              # Shadcn input w/ label, leftIcon, hint, error
│   │   ├── auth-shell.tsx              # Shared auth page shell
│   │   └── password-field.tsx          # Password input w/ visibility toggle + headerAction
│   ├── brand/                          # Brand design-system components
│   │   ├── blood-drop-icon.tsx
│   │   ├── blood-type-badge.tsx
│   │   ├── dashboard-greeting.tsx
│   │   ├── status-tag.tsx
│   │   └── wordmark.tsx
│   ├── consent/                        # NDPR consent UI (issue 04)
│   │   ├── consent-choices.tsx         #   Shared required + marketing checkboxes
│   │   └── marketing-consent-toggle.tsx #  Settings switch (donor + hospital profile)
│   ├── dashboard/
│   │   └── stat-card.tsx
│   ├── donor/
│   │   ├── alert-card.tsx
│   │   ├── notifications-section.tsx   # Notifications list UI (filters, unread badge, empty state)
│   │   ├── dashboard-eligibility.tsx   # Eligibility + blood-profile tiles
│   │   ├── dashboard-header.tsx        # Time-aware greeting
│   │   ├── dashboard-record.tsx        # Verified Donation Record ledger card
│   │   ├── dashboard-responses.tsx     # My Emergency Responses section (dedicated /donor/responses page)
│   │   ├── dashboard-shared.tsx        # CardHandlers type, EmptyState, InfoCard, InfoTile
│   │   ├── dashboard-urgent.tsx        # Urgent Request Near You hero
│   │   ├── declined-alert-row.tsx
│   │   ├── emergency-alerts-feed.tsx
│   │   ├── last-known-location-updater.tsx # Issue 06: location push on app open (donor layout)
│   │   ├── profile-incomplete-banner.tsx # Links to /donor/profile
│   │   └── urgent-request-card.tsx      #   Dashboard hero: urgent match + CTA / confirmed-mission state
│   ├── hospital/
│   │   ├── awaiting-approval.tsx   # Issue 08: pending/rejected/suspended/no-org states
│   │   ├── emergency-request-form.tsx  # Create-request dialog (blood grid, units, urgency, radius)
│   │   ├── emergency-history.tsx
│   │   ├── live-status-panel.tsx       # Active card (meta grid + responding donors + funnel)
│   │   ├── recent-activity-section.tsx # Dashboard history preview (3 latest + View All link)
│   │   └── request-funnel-card.tsx
│   ├── profile/                        # Shared profile settings UI
│   │   └── phone-verification.tsx      # Issue 07: add/change number, OTP entry, verified state (donor + hospital)
│   ├── landing/                        # Landing page sections
│   │   ├── navbar.tsx                   # Sticky nav (EASE_SMOOTH, real section anchors)
│   │   ├── hero.tsx                     # Live dispatch radar simulation
│   │   ├── blood-shortage.tsx           # #why-it-matters
│   │   ├── how-it-works.tsx             # #how-it-works
│   │   ├── for-donors.tsx               # #for-donors
│   │   ├── for-hospitals.tsx            # #for-hospitals
│   │   ├── safety.tsx                   # #safety
│   │   ├── pricing.tsx                  # #pricing
│   │   ├── final-cta.tsx                # #final-cta
│   │   └── footer.tsx                   # Brand BloodDropIcon, /auth/* links
│   ├── sidebar/                         # Modular role-sidebar package (shadcn sidebar)
│   │   ├── sidebar-layout.tsx           #   Client shell: SidebarProvider + top bar + AppSidebar/HospitalSidebar
│   │   ├── app-sidebar.tsx              #   Generic donor sidebar (live alert count, eligibility card)
│   │   ├── hospital-sidebar.tsx         #   Dedicated hospital sidebar (blood-bank status, workspace, support)
│   │   ├── nav-config.tsx               #   Donor/hospital nav config, active-route matching
│   │   ├── hospital-nav-config.tsx      #   Hospital nav config + page-title helper
│   │   ├── sidebar-user-menu.tsx        #   User menu (profile, help/support, sign-out)
│   │   ├── eligibility-card.tsx         #   Donor eligibility status card
│   │   ├── blood-bank-status.tsx        #   Blood bank status card (operational/limited/offline)
│   │   ├── hospital-workspace-card.tsx  #   Hospital name/location/accreditation card
│   │   ├── hospital-support-dialog.tsx  #   Hospital emergency support contact dialog
│   │   ├── support-dialog.tsx           #   Generic help & support dialog
│   └── ui/                             # shadcn/ui primitives (15 — all imported)
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── pagination-controls.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── sonner.tsx
│       └── tooltip.tsx
│
├── hooks/                              # React Query hooks (all imported)
│   ├── use-consent.ts
│   ├── use-donor-dashboard.ts
│   ├── use-donor-history.ts
│   ├── use-emergency-mission-tracker.ts
│   ├── use-emergency-requests.ts
│   ├── use-last-known-location.ts        # Issue 06: push geolocation when permission granted
│   └── use-mobile.ts

├── lib/                                # Utilities
│   ├── animations.ts                   # Shared framer-motion easings
│   ├── auth.ts                         # BetterAuth server config
│   ├── auth-client.ts                  # BetterAuth client
│   ├── blood-compatibility.ts
│   ├── consent.ts                      # NDPR policy version + gate helpers (issue 04)
│   ├── constants.ts
│   ├── donor-code.ts                   # Issue 06: BM- + 6 unambiguous chars, collision retry
│   ├── donor-dashboard.ts              # Profile-completeness, request mapping, greeting/date helpers
│   ├── donor-profile-validation.ts     # Issue 06: zod profile + last-known-location schemas
│   ├── donor-types.ts
│   ├── eligibility.ts
│   ├── email.ts                        # Resend wrapper
│   ├── geocoding.ts
│   ├── get-query-client.ts
│   ├── get-session.ts
│   ├── hospital-code.ts                # BIOMATCH-NNN formatter (kept, no callers yet)
│   ├── organization-access.ts
│   ├── phone-validation.ts             # Issue 07: E.164 regex, NG normalization, zod schema
│   ├── prisma.ts
│   ├── radius-expansion.ts
│   ├── sms.ts                          # Issue 07: Termii sender + fake provider w/ test outbox
│   └── utils.ts

├── servers/                            # Server actions (all exports have callers)
│   ├── auth.ts                         # signUpWithProfile, acceptInvitationSignUp
│   ├── consent.ts                      # NDPR consent log + gate (issue 04)
│   ├── emergency.ts                    # dispatch funnel + matching + confirmation + history (create gated by requireApprovedHospital, issue 08)
│   ├── hospital.ts                     # real sidebar context + verification state from organization (issue 08)
│   ├── location.ts                     # scoreDonorProximity
│   ├── notification.ts                 # sendEmergencyAlertEmail
│   ├── organization.ts                 # org membership + access control + approval gate (issue 08)
│   ├── staff.ts                        # getInvitationPreview (invite-accept flow only)
│   └── user.ts                         # getUserById, updateUserProfile + issue 06 donor-profile + issue 07 phone actions

└── emails/                             # Email templates (all imported)
    ├── emergency-alert.tsx
    ├── reset-password-email.tsx
    ├── staff-invitation.tsx
    └── verification-email.tsx

tests/
├── auth-skeleton.test.ts               # Issue 03 walking-skeleton integration test
├── consent-gate.test.ts                # Issue 04 gate/idempotency/version-bump tests
├── donor-profile.test.ts               # Issue 06 donor code + profile validation/persistence tests
├── hospital-registration.test.ts       # Issue 05 hospital registration asserts
├── hospital-verification.test.ts       # Issue 08 privileged fields + one-pending + approval gate (4 passing)
└── phone-verification.test.ts          # Issue 07 normalization + OTP round-trip w/ fake SMS (11 passing)
```

## Removed (simplified out)

- `donor/health-profile/` — full health/medical form
- `donor/wallet/` — rewards wallet
- `hospital/inventory/` — blood search bento cards
- `hospital/(dashboard)/analytics/` — analytics dashboard
- `hospital/(dashboard)/directory/` — donor directory
- `hospital/(dashboard)/screening/` — donor screening
- `hospital/(dashboard)/staff/` — staff management
- `admin/` — admin section
- `servers/screening.ts` — screening server actions
- `servers/analytics.ts` — analytics server actions
- `lib/inventory-schema.ts` — inventory ledger schema
- `lib/availability.ts` — availability utilities
- `lib/hospital-code.ts` — hospital code generation (restored, kept)
- `hooks/use-screening.ts`, `use-analytics.ts`, `use-staff.ts`, `use-eligible-donors.ts`, `use-blood-group-usage.ts`, `use-city-labels.ts`, `use-donor-settings-form.ts`, `use-inventory.ts`, `use-hospital-bank.ts`, `use-location-cascade.ts`
- Screening/analytics/inventory/wallet/health-profile components
- `DonorScreening`, `InventoryTransaction`, `NotificationLog`, `Location` models (schema)

## Dead-code sweep (2026-09-20)

Every remaining file/symbol verified referenced before keeping. Removed:
- Files: `components/donor/success-modal.tsx`, `components/brand/inventory-gauge.tsx`, `components/brand/emergency-alert.tsx`, `components/dashboard/section-card.tsx`, `components/sidebar/account-summary.tsx`, `hooks/use-donations.ts`, `hooks/use-wallet.ts`, `servers/donation.ts`, `components/ui/{checkbox,field,label,menubar,switch,textarea,collapsible}.tsx`
- `use-emergency-requests.ts`: `useRespondToAlert`, `useUpdateAlertStatus`, `useConfirmDonation` (donor flows go through `useEmergencyMissionTracker`; hospital confirm has no calling UI yet — only the awaiting-confirmation count is surfaced)
- `servers/auth.ts`: `loginWithRole()` (login page uses `authClient.signIn.email` directly)
- `servers/emergency.ts`: `getActiveEmergencyRequests()`, `getEmergencyRequestsForOrganization()`, `getEmergencyRequestStatus()`
- `servers/hospital.ts`: `getAllHospitalBanks()`, `getHospitalBankById()`, `getHospitalBankByOrganizationId()`, `updateHospitalBankInventory()`, `getBloodGroupUsageSummary()` (+ orphaned `ORGANIZATION_OWNER_INCLUDE`); `Inventory`/`emptyInventory`/`HospitalSidebarContext` de-exported to module-local
- `servers/user.ts`: `getUserBasicById()`, `getUserByEmail()`, `isDonorProfileComplete()` (superseded by `hasIncompleteProfile`), `updateUserRole()`, `getWalletByUserId()`, `listDonors()` + `ListDonorsFilters`
- `servers/staff.ts`: slimmed to the live invite-accept path (`getInvitationPreview` + `InvitationPreview`); staff list/invite/update/remove/cancel + `StaffMember` removed with the staff-management UI
- `servers/location.ts`: `proximityPassesThreshold()`; `lib/radius-expansion.ts`: `EXPANSION_TIMEOUT_MS`, `getExpansionLevel()`, `getRadiusTier()`; `lib/geocoding.ts`: `persistAddressCoordinates()` (`GeocodeResult` de-exported); `lib/donor-types.ts`: `DonationRecord`; `lib/constants.ts`: `ELIGIBILITY_DAYS` (only fed dead `listDonors`); `lib/organization-access.ts`: `INVITABLE_ROLES`/`InvitableRole` (only fed dead staff functions); `hospital-nav-config.tsx`: `FALLBACK_HOSPITAL_NAME`
- Kept deliberately: `lib/hospital-code.ts` (BIOMATCH-NNN formatter, no callers yet — prior "restored, kept" decision stands)
- Gaps surfaced (not fixed): no UI calls hospital-side `confirmDonation()` yet; no UI creates staff invitations (accept flow exists without an invite flow)
