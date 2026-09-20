# BioMatch — Current File Structure

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
│   │   │   ├── donor-profile-client.tsx #  Prefilled update form (personal, donation, health) + completion progress
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
│   │   ├── profile-incomplete-banner.tsx # Links to /donor/profile
│   │   └── urgent-request-card.tsx      #   Dashboard hero: urgent match + CTA / confirmed-mission state
│   ├── hospital/
│   │   ├── emergency-request-form.tsx  # Create-request dialog (blood grid, units, urgency, radius)
│   │   ├── emergency-history.tsx
│   │   ├── live-status-panel.tsx       # Active card (meta grid + responding donors + funnel)
│   │   ├── recent-activity-section.tsx # Dashboard history preview (3 latest + View All link)
│   │   └── request-funnel-card.tsx
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
│   ├── use-donor-dashboard.ts
│   ├── use-donor-history.ts
│   ├── use-emergency-mission-tracker.ts
│   ├── use-emergency-requests.ts
│   └── use-mobile.ts

├── lib/                                # Utilities
│   ├── animations.ts                   # Shared framer-motion easings
│   ├── auth.ts                         # BetterAuth server config
│   ├── auth-client.ts                  # BetterAuth client
│   ├── blood-compatibility.ts
│   ├── constants.ts
│   ├── donor-dashboard.ts              # Profile-completeness, request mapping, greeting/date helpers
│   ├── donor-types.ts
│   ├── eligibility.ts
│   ├── email.ts                        # Resend wrapper
│   ├── geocoding.ts
│   ├── get-query-client.ts
│   ├── get-session.ts
│   ├── hospital-code.ts                # BIOMATCH-NNN formatter (kept, no callers yet)
│   ├── organization-access.ts
│   ├── prisma.ts
│   ├── radius-expansion.ts
│   └── utils.ts

├── servers/                            # Server actions (all exports have callers)
│   ├── auth.ts                         # signUpWithProfile, acceptInvitationSignUp
│   ├── emergency.ts                    # dispatch funnel + matching + confirmation + history
│   ├── hospital.ts                     # createHospitalBank, getHospitalSidebarContext
│   ├── location.ts                     # scoreDonorProximity
│   ├── notification.ts                 # sendEmergencyAlertEmail
│   ├── organization.ts                 # org membership + access control
│   ├── staff.ts                        # getInvitationPreview (invite-accept flow only)
│   └── user.ts                         # getUserById, updateUserProfile

└── emails/                             # Email templates (all imported)
    ├── emergency-alert.tsx
    ├── reset-password-email.tsx
    ├── staff-invitation.tsx
    └── verification-email.tsx
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
