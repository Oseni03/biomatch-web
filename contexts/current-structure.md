# BioMatch — Current File Structure

> Last updated: 2026-09-19 — Wired both role sidebars. Hospital: `SidebarLayout` branches to the dedicated `HospitalSidebar` fed by `getHospitalSidebarContext` (org bank name/location + live blood-bank status); `HOSPITAL_NAV_ITEMS` targets real routes. Donor: `AppSidebar` nav points at real routes (dead `/donor/requests` + `/donor/notifications` removed, live alert badge moved to Dashboard) and the eligibility card is now fed client-side from the prefetched donor-dashboard query. Same session: merged the (React-Router prototype) donor dashboard mock into the real donor dashboard — new `UrgentRequestCard` hero ("Urgent Request Near You", I Can Help / Not Available feeding existing respond/decline, confirmed-mission state with en-route/arrived/donation-confirm/withdraw), plus Eligibility and Verified Donation Record cards; `ActiveMissionTracker` component retired (its confirmed-mission role absorbed by the hero card). Follow-up same day: ported the mock's remaining layout deltas into `donor-dashboard-client.tsx` — in-page tabs (Dashboard / Live Requests / My Responses with live counts), time-aware greeting with standby subtitle, `My Responses` view reusing `UrgentRequestCard` for accepted/en-route/arrived/completed alerts with the mock's empty state, `max-w-4xl` content constraint, Eligibility + Ledger scoped to the Dashboard tab; removed a stray `icon="heart"` prop on the shared Button (no such prop — Heart already renders as a child). Accept path in `useEmergencyMissionTracker` now fires a success toast ("Response confirmed. The hospital blood bank team has been notified.") matching the prototype's confirmation toast.

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
│   │   ├── layout.tsx                  #   Wraps children in SidebarLayout role="donor"
│   │   ├── page.tsx                    #   Dashboard — server data loader
│   │   ├── donor-dashboard-client.tsx  #   Thin orchestrator (data + view switch)
│   │   ├── loading.tsx                 #   Route-level skeleton
│   │   ├── error.tsx                   #   Route-level error boundary
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
│   │   │   ├── hospital-broadcasts-client.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   └── history/
│   │       ├── page.tsx                #   Emergency request history
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
│   │   ├── stat-card.tsx
│   │   └── section-card.tsx
│   ├── donor/
│   │   ├── alert-card.tsx
│   │   ├── dashboard-eligibility.tsx   # Eligibility + blood-profile tiles
│   │   ├── dashboard-header.tsx        # Time-aware greeting
│   │   ├── dashboard-record.tsx        # Verified Donation Record ledger card
│   │   ├── dashboard-responses.tsx     # My Emergency Responses view
│   │   ├── dashboard-shared.tsx        # CardHandlers type, EmptyState, InfoCard, InfoTile
│   │   ├── dashboard-urgent.tsx        # Urgent Request Near You hero
│   │   ├── declined-alert-row.tsx
│   │   ├── donation-history-table.tsx
│   │   ├── emergency-alerts-feed.tsx
│   │   ├── profile-incomplete-banner.tsx # Links to /donor/profile
│   │   ├── success-modal.tsx
│   │   └── urgent-request-card.tsx      #   Dashboard hero: urgent match + CTA / confirmed-mission state
│   ├── hospital/
│   │   ├── emergency-request-form.tsx
│   │   ├── emergency-history.tsx
│   │   ├── live-status-panel.tsx
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
│   │   └── account-summary.tsx          #   (unused) account summary card
│   └── ui/                             # shadcn/ui primitives
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── pagination-controls.tsx
│       └── ...
│
├── hooks/                              # React Query hooks
│   ├── use-donor-dashboard.ts
│   ├── use-donor-history.ts
│   ├── use-emergency-mission-tracker.ts
│   ├── use-emergency-requests.ts
│   └── use-session.ts
│
├── lib/                                # Utilities
│   ├── auth.ts                         # BetterAuth server config
│   ├── auth-client.ts                  # BetterAuth client
│   ├── blood-compatibility.ts
│   ├── constants.ts
│   ├── donor-dashboard.ts              # Profile-completeness, request mapping, greeting/date helpers
│   ├── donor-types.ts
│   ├── eligibility.ts
│   ├── geocoding.ts
│   ├── organization-access.ts
│   ├── prisma.ts
│   ├── radius-expansion.ts
│   └── utils.ts
│
├── servers/                            # Server actions
│   ├── auth.ts
│   ├── emergency.ts
│   ├── hospital.ts
│   ├── location.ts
│   ├── notification.ts
│   ├── organization.ts
│   ├── user.ts
│   └── wallet.ts
│
└── emails/                             # Email templates
    ├── emergency-alert.tsx
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
