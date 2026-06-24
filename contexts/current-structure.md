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
│   │   ├── login/page.tsx          # Sign-in form (useState, calls loginWithRole)
│   │   └── signup/page.tsx         # Registration form (donor/hospital toggle)
│   ├── donor/                      # Donor section (role=donor)
│   │   ├── layout.tsx              #   Wraps children in SidebarLayout role="donor"
│   │   ├── page.tsx                #   Dashboard - eligibility, stats, critical needs
│   │   ├── health-profile/page.tsx #   Health/medical form (inline <style jsx global>)
│   │   └── wallet/page.tsx         #   Rewards wallet + perk cards
│   ├── hospital/                   # Hospital section (role=hospital)
│   │   ├── layout.tsx              #   Wraps children in SidebarLayout role="hospital"
│   │   ├── page.tsx                #   (redirects to /hospital/inventory)
│   │   ├── inventory/page.tsx      #   Live inventory grid + eligible donor list
│   │   ├── donor-finder/page.tsx   #   STUB - Donor search/filter
│   │   └── blood-drive/page.tsx    #   STUB - Blood drive request form
│   ├── favicon.ico
│   ├── globals.css                 # Tailwind directives + theme variables
│   ├── layout.tsx                  # Root layout: Inter font, ThemeProvider
│   └── page.tsx                    # Landing page (navbar, hero, stats, mission, services, impact, join, footer)
│
├── components/
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
│   │   └── sidebar.tsx             # Shared sidebar — role-based nav, mobile responsive
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
│   │   ├── sonner.tsx
│   │   ├── switch.tsx
│   │   └── textarea.tsx
│   ├── theme-provider.tsx          # next-themes ThemeProvider wrapper
│   └── theme-toggle.tsx            # Light/dark toggle
│
├── contexts/                       # AI context & plans directory
│   ├── architecture.md             # Tech stack, data model, routing, patterns
│   ├── current-structure.md        # This file — full file tree
│   ├── improvement-plan.md         # Summary of all 3 phases
│   ├── phase-1-foundation.md       # React Query, shared components, cleanup
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
│       ├── 09-donor-history-impact.md
│       ├── 10-hospital-admin-features.md
│       └── 11-institutional-partner-management.md
│
├── hooks/
│   └── use-scroll-reveal.ts        # IntersectionObserver scroll animation hook
│
├── lib/
│   ├── auth.ts                     # BetterAuth server config (email/password, prisma adapter)
│   ├── auth-client.ts              # createAuthClient() for browser
│   ├── prisma.ts                   # Singleton PrismaClient
│   ├── supabase.ts                 # Supabase client (unused / legacy)
│   └── utils.ts                    # cn() clsx+tailwind-merge helper
│
├── servers/                        # Server Actions ("use server")
│   ├── auth.ts                     # signUpWithProfile(), loginWithRole()
│   ├── hospital.ts                 # getAllHospitalBanks(), getHospitalBankById(), createHospitalBank(), updateHospitalBankInventory()
│   ├── incentive.ts                # createIncentiveClaim(), getClaimsByUserId(), getPendingClaims(), updateClaimStatus()
│   ├── user.ts                     # getUserById(), getUserByEmail(), updateUserProfile(), updateUserRole(), listDonors()
│   └── wallet.ts                   # getWalletByUserId(), awardPoints(), deductPoints()
│
├── prisma/
│   ├── schema.prisma               # Data model (User, HospitalBank, Wallet, IncentiveClaim, Session, Account, Verification)
│   └── migrations/                 # 5 migration folders
│
├── middleware.ts                   # Edge middleware — RBAC guard, session fetch, role redirect
├── package.json                    # Dependencies & scripts
├── tailwind.config.ts
├── tsconfig.json
├── next.config.mjs
├── postcss.config.mjs
├── components.json                 # shadcn/ui config
└── prisma.config.ts
```

## Current Data Fetching Pattern

Every dashboard page follows this pattern (no React Query yet):

```typescript
// 1. Session
const { data: session, isPending: sessionLoading } = authClient.useSession();

// 2. Local state
const [data, setData] = useState<... | null>(null);
const [loading, setLoading] = useState(true);

// 3. Callback wrapped in useCallback
const fetchAll = useCallback(async () => {
  if (!session?.user?.id) return;
  const result = await getSomeData(session.user.id);
  setData(result);
  setLoading(false);
}, [session?.user?.id]);

// 4. Effect triggers fetch
useEffect(() => {
  if (!sessionLoading) fetchAll();
}, [fetchAll, sessionLoading]);
```

## Issues Found

| Issue | Severity | File(s) |
|---|---|---|
| React Query unused — manual fetch boilerplate everywhere | High | All dashboard pages |
| Donor Finder is a stub | High | `app/hospital/donor-finder/page.tsx` |
| Inventory + donor list conflated in one page | Medium | `app/hospital/inventory/page.tsx` |
| `getUserById` fetches everything every time | Medium | `servers/user.ts` |
| No donor location field → can't search by location | Medium | `prisma/schema.prisma` |
| `listDonors()` has no pagination | Medium | `servers/user.ts` |
| `<style jsx global>` in health profile | Low | `app/donor/health-profile/page.tsx` |
| Dead public routes in middleware (`/sign-in`, `/sign-up`) | Low | `middleware.ts` |
| Hardcoded 10s polling — no pause on background tab | Medium | `app/hospital/inventory/page.tsx` |
| `inventory` JSON blob — no type safety, can't query | Medium | `prisma/schema.prisma` |
| No shared dashboard components | Low | `app/donor/page.tsx` (StatCard), `app/donor/health-profile/page.tsx` (Section/Field) |
| Sidebar `userName` prop never passed by layouts | Low | `app/donor/layout.tsx`, `app/hospital/layout.tsx` |
| No error boundaries or toast on action failures | Low | All pages |
| Static nav links — no badge counts | Low | `components/layout/sidebar.tsx` |
