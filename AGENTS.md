# BioMatch — Agent Context

## Project Overview

BioMatch is an incentivized blood donation and hospital inventory marketplace. Donors register, maintain health profiles, earn points for donations, and redeem perks. Hospitals monitor blood inventory, find eligible donors, and request blood drives.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.5 |
| Styling | Tailwind CSS 3.4 + shadcn/ui (Radix Nova) |
| Icons | lucide-react |
| ORM | Prisma 7 + `@prisma/adapter-pg` |
| Database | PostgreSQL |
| Auth | better-auth (email/password) |
| Charts | recharts + @tremor/react |
| Data Fetching | Server actions (`servers/`) + `@tanstack/react-query` |
| Toast | sonner |
| Theme | next-themes |

## Routing

### Public
- `/` — Landing page
- `/auth/login` — Sign in
- `/auth/signup` — Register (donor/hospital)

### Protected — Donor (`role=donor`)
- `/donor` — Dashboard (eligibility, stats, critical needs)
- `/donor/health-profile` — Full health/medical form
- `/donor/wallet` — Rewards & perk redemption

### Protected — Hospital (`role=hospital`)
- `/hospital/inventory` — Live inventory grid + eligible donors
- `/hospital/donor-finder` — Search/filter eligible donors
- `/hospital/blood-drive` — Request blood drive

### Protected — Admin (`role=admin`)
- `/admin` — System overview
- `/admin/verification` — Verification queue
- `/admin/contracts` — Partner contracts

### API
- `/api/auth/[...all]` — BetterAuth catch-all

## Data Model (Prisma)

Key models in `prisma/schema.prisma`:
- **User** — `name`, `email`, `bloodGroup` (enum), `genotype`, `role` (enum), `updatedHealthInfo` (JSON), `lastDonationDate`, `location` (string, nullable)
- **HospitalBank** — `hospitalName`, `location`, `inventory` (JSON `Record<string, number>`)
- **Wallet** — `userId` (unique), `points`, `lifetimeDonations`
- **IncentiveClaim** — `userId`, `type` (enum), `status` (enum), `metadata` (JSON)
- **Session, Account, Verification** — BetterAuth internal

Enums: `Role` (donor/hospital/admin), `BloodGroup` (A+/A-/B+/B-/AB+/AB-/O+/O-), `IncentiveType` (hmo_voucher/gym_discount), `ClaimStatus` (pending/approved/redeemed).

## Key Patterns

1. **Layout**: Each role section wraps children in `SidebarLayout` from `components/layout/sidebar.tsx`
2. **Server Actions**: All DB logic in `servers/*.ts` with `"use server"` — pages import and call directly
3. **Data Fetching**: `@tanstack/react-query` hooks in `hooks/` — no manual `useState`+`useEffect` patterns
4. **Auth Flow**: better-auth server config in `lib/auth.ts`, client in `lib/auth-client.ts`, RBAC in `middleware.ts`
5. **Styling**: Tailwind utility classes throughout; no CSS-in-JS or global style blocks

## Server Actions (`servers/`)

| File | Functions |
|---|---|
| `auth.ts` | `signUpWithProfile()`, `loginWithRole()` |
| `emergency.ts` | `createEmergencyRequest()`, `getActiveEmergencyRequests()`, `getAlertsForDonor()`, `getEmergencyRequestsForHospital()`, `getPendingEmergencyRequestsForHospital()`, `expandSearchRadius()`, `respondToAlert()`, `updateAlertStatus()`, `markAlertOpened()`, `getEmergencyRequestStatus()`, `getEmergencyHistory()` |
| `hospital.ts` | `getAllHospitalBanks()`, `getHospitalBankById()`, `createHospitalBank()`, `updateHospitalBankInventory()` |
| `incentive.ts` | `createIncentiveClaim()`, `getClaimsByUserId()`, `getPendingClaims()`, `updateClaimStatus()` |
| `user.ts` | `getUserById()`, `getUserBasicById()`, `getUserByEmail()`, `updateUserProfile()`, `updateUserRole()`, `listDonors()` |
| `wallet.ts` | `getWalletByUserId()`, `awardPoints()`, `deductPoints()` |

## Code Conventions

- **No comments** in code unless the user explicitly asks
- **No emojis** — never add emoji to any file
- **Tailwind classes** over CSS-in-JS or `<style>` blocks
- **shadcn/ui** primitives from `components/ui/` for buttons, cards, inputs, etc.
- **CVA** (`class-variance-authority`) for component variants
- **`cn()`** from `lib/utils.ts` for conditional class merging
- **lucide-react** for all icons
- **Server actions** always placed in `servers/` directory, one file per domain
- **React Query hooks** in `hooks/`, named `use-<domain>.ts`

## Agent Instructions

### Before making ANY modifications:
1. Read all files in `contexts/` to understand the current state and improvement plans
2. Regenerate/update `contexts/current-structure.md` to reflect the current file tree
3. Check `contexts/architecture.md` for routing, data model, and pattern references

### After every modification:
1. Update `contexts/current-structure.md` — add new files, note changes, mark completed tasks in plan files
2. Update `contexts/architecture.md` if the data model, routing, or patterns changed
3. If a plan phase step is completed, update the relevant `phase-*.md` to mark it done
4. **Immediately update the issue's Status in its tracker table** (the PRD Issue Map above, the Redesign Issues table, or the Simplification Issues table) — ✅ when fully done, 🔶 when partially done. Do this in the same session as the implementation, not as a follow-up — a stale status table is worse than no status table, since future agents trust it over re-reading every issue file.

### When implementing planned work:
- Start with the lowest-numbered incomplete phase (Phase 1 → Phase 2 → Phase 3)
- Within a phase, follow the numbered steps in order
- After completing all steps in a phase, update `contexts/improvement-plan.md`

## Plans

See `contexts/` directory for the detailed improvement plan:
- `contexts/architecture.md` — Tech stack, data model, routing, patterns
- `contexts/current-structure.md` — Full file tree and current state
- `contexts/improvement-plan.md` — Summary of all 3 phases
- `contexts/phase-1-foundation.md` — React Query migration, shared components, cleanup
- `contexts/phase-2-directory.md` — Donor Finder implementation
- `contexts/phase-3-realtime.md` — SSE inventory updates
- `contexts/prd-issues.md` — PRD issue tracker with dependency graph, HITL decision registry, user-story coverage map
- `contexts/issues/` — 11 vertical-slice issue files derived from BIO_MATCH_PRD.md

## PRD Implementation Issues

11 vertical-slice issues were derived from `BIO_MATCH_PRD.md` via the `to-issues` process. Each cuts through all layers (schema, API, UI, tests). See `contexts/prd-issues.md` for the full dependency graph and recommended implementation order.

| # | Title | Type | Blocked By |
|---|---|---|---|
| 01 | Emergency Request + Matching Engine | AFK | — |
| 02 | Donor Alert & Response (In-App) | AFK | 01 |
| 03 | Radius Expansion | AFK | 02 |
| 04 | Hospital Live Request Status Panel | AFK | 02 |
| 05 | Notification Delivery (Push + SMS) | HITL | 01 |
| 06 | Donation Confirmation | AFK | 02 |
| 07 | HMO Incentive Integration | HITL | 06 |
| 08 | Donor Registration Enhancements | AFK | — |
| 09 | Donor History & Impact Dashboard | AFK | 06, 08 |
| 10 | Hospital Admin Features | HITL | 04, 06 |
| 11 | Institutional Partner Management | HITL | 08 |

**HITL issues** (05, 07, 10, 11) require human decisions on provider choices, partner contracts, and role definitions before AFK agents can implement them.

## Redesign Issues (from grilling session)

7 vertical-slice issues derived from the redesign plan. Listed in dependency order.

| # | Title | Type | Blocked By |
|---|---|---|---|
| 12 | Design Foundation | AFK | — |
| 13 | Landing Hero + Navbar | AFK | 12 |
| 14 | Landing Stats + How It Works + Testimonials | AFK | 12 |
| 15 | Landing Services + Impact + Footer | AFK | 12 |
| 16 | Dashboard Sidebar + Top Bar | AFK | 12 |
| 17 | Dashboard Bento Widget Restyle | AFK | 16 |
| 18 | Hospital Blood Search Cards | AFK | 16 |

## Simplification Issues (from grilling session, 2026-07-16)

8 issues derived from an architecture-review grilling session that fact-checked and prioritized an overengineering audit. All are independent — no dependency chain, work in any order. Status: blank = not started, 🔶 = in progress, ✅ = done.

| # | Title | Type | Blocked By | Status |
|---|---|---|---|---|
| 19 | Simplify Location Matching to 3 Levels + 3 Radius Tiers | AFK | — | ✅ |
| 20 | Collapse `opened` into `alerted` in Alert Lifecycle | AFK | — | ✅ |
| 21 | Commit In-Progress Dead Code Removal (admin stubs, HMO, legacy) | AFK | — | ✅ |
| 22 | Remove Dead UI Surface (blood-drive stub, scroll-reveal hook, theme toggle) | AFK | — | |
| 23 | Promote Staff Role to Typed Schema Columns | AFK | — | |
| 24 | Validate Hospital Inventory Writes with Zod | AFK | — | |
| 25 | Replace `alert-context.tsx` with a Shared Query Hook | AFK | — | |
| 26 | [Backlog] Dark-Only Theme Redesign | HITL | — (needs design decision first) | needs-triage |

See `contexts/issues/19-*.md` through `contexts/issues/26-*.md` for full details. Issue #26 is explicitly **not** ready-for-agent — it requires a human palette/contrast decision before implementation.

## Agent skills

### Issue tracker

Issues live as local markdown files under `contexts/issues/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical roles map to the same-named strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo; the authoritative doc is `contexts/architecture.md`. See `docs/agents/domain.md`.
