# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BioMatch is an incentivized blood donation and hospital inventory marketplace built on Next.js. Donors register, maintain health profiles, respond to emergency blood requests, and earn wallet points. Hospitals track blood bank inventory and dispatch emergency requests to nearby eligible donors.

**Read `AGENTS.md` first** — it has the full project context, server action inventory, and PRD issue tracker. This file adds Claude-Code-specific operational notes and flags where AGENTS.md / `contexts/` have drifted from the actual code (the repo is mid-refactor as of this writing — admin role/routes and HMO incentive features are being removed).

**Read `DESIGN_SYSTEM.md` before touching any UI** — color tokens, typography, the `src/components/brand/` primitives, and the marketing-site structure are documented there. Most dashboard widgets predate it and haven't been migrated onto it yet.

## Commands

```bash
npm run dev              # Start dev server (next dev)
npm run build             # Production build
npm run start             # Run production build
npm run lint              # next lint
npm run prisma:generate   # Regenerate Prisma client (also runs on postinstall)
npx prisma db push        # Push schema.prisma changes to the database (dev)
npx prisma migrate dev    # Create a migration file
npx tsx prisma/seed.ts    # Seed the Nigerian location hierarchy
```

There is no test suite or test runner configured in this repo. There is no separate `eslint` config file beyond `next lint`'s defaults.

The Prisma client is generated to `generated/prisma` (not `node_modules/.prisma`) and imported via the `@generated/*` path alias — always run `npm run prisma:generate` after editing `prisma/schema.prisma` before using new fields/models in code.

## Architecture

### Path aliases
- `@/*` → `src/*`
- `@generated/*` → `generated/*` (Prisma client output)

### Request flow / auth guard
Route protection lives in **`src/proxy.ts`** (Next.js's newer replacement for `middleware.ts` — it exports a `proxy()` function, not `middleware()`). It must live inside `src/` alongside `src/app`, not at the repo root — Next 16 only picks up `proxy.ts` at the same level as the `app`/`pages` directory, and a root-level file is silently never invoked, leaving every route unprotected. It checks the better-auth session via `auth.api.getSession()` and redirects based on `session.user.role` (`donor` | `hospital` | `admin`). Public routes are `/`, `/auth/login`, `/auth/signup`, `/api/auth`. If you're hunting for RBAC logic, look here, not in a `middleware.ts` file — don't recreate one.

### Directory layout (under `src/`)
- `app/` — Next.js App Router pages. Each role section (`donor/`, `hospital/`) has its own `layout.tsx` wrapping children in `SidebarLayout` from `components/layout/sidebar.tsx`.
- `servers/` — All database access, as `"use server"` files, one per domain (`emergency.ts`, `hospital.ts`, `user.ts`, `location.ts`, `notification.ts`, `staff.ts`, `analytics.ts`, `auth.ts`). Pages call these directly; there is no separate API layer for internal data access.
- `hooks/` — `@tanstack/react-query` hooks (`use-<domain>.ts`) that wrap server actions for pages. Prefer adding a hook here over calling a server action with manual `useState`/`useEffect` in a component.
- `lib/` — Cross-cutting utilities: `auth.ts` (better-auth server config), `auth-client.ts` (browser client), `prisma.ts` (singleton client), `constants.ts` (shared domain constants like `ELIGIBILITY_DAYS`, `POINTS_PER_DONATION`, `CRITICAL_THRESHOLD` — import these rather than re-declaring), `radius-expansion.ts` (emergency alert radius tiers), `blood-compatibility.ts`, `eligibility.ts`, `email.ts` (Resend wrapper, mocks when `RESEND_API_KEY` is unset).
- `components/ui/` — shadcn/ui primitives (Radix Nova style, configured in `components.json`).
- `components/brand/` — BioMatch design-system primitives (`BloodDropIcon`, `BloodTypeBadge`, `StatusTag`, `InventoryGauge`, `EmergencyAlert`, `DashboardGreeting`). See `DESIGN_SYSTEM.md`.
- `emails/` — React Email templates sent via `lib/email.ts`.

### Data model (`prisma/schema.prisma`)
Core models: `User` (role, bloodGroup, genotype, availability, isActive, locationId, lastDonationDate), `HospitalBank` (JSON `inventory` blob keyed by blood group string), `Wallet` (points, lifetimeDonations), `Location` (self-referential Nigerian region→state→city→area hierarchy, seeded via `prisma/seed.ts`), `EmergencyRequest` → `EmergencyAlert` → `NotificationLog` (the emergency dispatch funnel), plus better-auth's `Session`/`Account`/`Verification`.

Donor-to-hospital matching uses location hierarchy depth (`getCommonAncestorDepth()` in `servers/location.ts`), not free-text or geocoding — same city/area scores higher than same state/region.

### Known drift between docs and code
`AGENTS.md` and `contexts/architecture.md` / `contexts/current-structure.md` predate the `src/` restructure and an in-progress removal of the admin role and HMO incentive claim features (`servers/incentive.ts`, `components/donor/hmo-insurance-card.tsx`, `app/admin/*`, `components/prospeo/*` no longer exist). When those docs disagree with what you find in `src/`, trust the code. If you're asked to update the architecture docs per the `AGENTS.md` "after every modification" workflow, verify current state first rather than trusting the existing doc content.

### Issue tracker workflow
Work items live as markdown files under `contexts/issues/<NN>-<slug>.md`, numbered sequentially. Status for each issue is tracked centrally in a table, not in the issue file itself — either `contexts/prd-issues.md`'s Issue Map, or one of the tables in `AGENTS.md` (Redesign Issues, Simplification Issues). **After implementing or partially implementing an issue, update its Status cell in that table in the same turn** (✅ done, 🔶 partial) — don't defer this to a follow-up. A future session trusts the status table over re-reading every issue file, so a stale table actively misleads. Not every issue is `ready-for-agent` by default — check for a "not ready-for-agent" / `needs-triage` note before implementing (e.g. work that needs a human design or provider decision first).

## Conventions
- No code comments unless explicitly requested; no emoji in any file.
- Tailwind utility classes only — no CSS-in-JS or `<style>` blocks.
- `cn()` from `lib/utils.ts` for conditional class merging; CVA for component variants; lucide-react for all icons.
- New DB logic goes in `servers/<domain>.ts`; new data-fetching hooks go in `hooks/use-<domain>.ts`.
