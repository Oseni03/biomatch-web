# BioMatch — Current File Structure

> Last updated: 2026-08-27 — Simplified to prototype spec. Core loop only.

```
src/
├── app/                            # Next.js App Router
│   ├── api/
│   │   └── auth/[...all]/route.ts  # BetterAuth API catch-all
│   ├── auth/
│   │   ├── accept-invitation/page.tsx # Accept org staff invite
│   │   ├── forgot-password/page.tsx   # Request password reset
│   │   ├── login/page.tsx             # Sign-in
│   │   ├── onboarding/page.tsx        # Post-signup profile setup (blood group, phone, org name)
│   │   ├── reset-password/page.tsx    # Set new password from reset token
│   │   └── signup/page.tsx            # Registration (donor/hospital toggle)
│   ├── donor/                          # Donor section (role=donor)
│   │   ├── layout.tsx                  #   Wraps children in SidebarLayout role="donor"
│   │   ├── page.tsx                    #   Dashboard — server data loader
│   │   ├── donor-dashboard-client.tsx  #   Client orchestrator
│   │   ├── loading.tsx                 #   Route-level skeleton
│   │   ├── error.tsx                   #   Route-level error boundary
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
│   │   └── auth-shell.tsx              # Shared auth page shell
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
│   │   ├── active-mission-tracker.tsx
│   │   ├── alert-card.tsx
│   │   ├── declined-alert-row.tsx
│   │   ├── donation-history-table.tsx
│   │   ├── emergency-alerts-feed.tsx
│   │   └── success-modal.tsx
│   ├── hospital/
│   │   ├── emergency-request-form.tsx
│   │   ├── emergency-history.tsx
│   │   ├── live-status-panel.tsx
│   │   └── request-funnel-card.tsx
│   ├── landing/                        # Landing page sections
│   │   ├── cta-band.tsx
│   │   ├── feature-rows.tsx
│   │   ├── footer.tsx
│   │   ├── hero.tsx
│   │   ├── impact.tsx
│   │   ├── navbar.tsx
│   │   ├── services.tsx
│   │   ├── stats.tsx
│   │   └── testimonials.tsx
│   ├── layout/
│   │   └── sidebar.tsx                  # SidebarLayout for role sections
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
