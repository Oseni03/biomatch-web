## Parent

Simplification pass (grilling session, 2026-07-16) — continues cleanup already started in the working tree before this session.

## What to build

This is largely already done as uncommitted changes — this ticket is about finishing, verifying, and committing it, not building new work.

The `admin` role stays in the `Role` enum and RBAC (`proxy.ts`) since issues #10/#11 depend on it existing later — only its empty stub pages are being removed. The HMO/gym incentive system is fully removed since it's HITL-blocked (issue #07) with no partner integration to build against. Legacy dead code is confirmed gone.

### Already removed in the working tree (uncommitted)

- `app/admin/*` (layout + 3 stub pages: overview, verification, contracts)
- `servers/incentive.ts`, `components/donor/hmo-insurance-card.tsx`
- `components/prospeo/*` (superseded by the brand redesign)
- `components/ui/chart.tsx`
- `lib/supabase.ts` (legacy, unused)

### Verification steps

- Confirm no remaining imports/references to any of the files above
- Confirm sidebar nav has no dead links to removed admin or HMO/incentive UI
- Remove `IncentiveType`, `ClaimStatus` enums and the `IncentiveClaim` model from `prisma/schema.prisma` if not already dropped, with a migration
- Commit

## Acceptance criteria

- [ ] No broken imports referencing deleted admin pages, incentive server, HMO card, prospeo components, chart.tsx, or supabase.ts
- [ ] `IncentiveClaim` model and its enums removed from schema (migration included) if still present
- [ ] Sidebar nav has no dead links to removed admin/HMO UI
- [ ] `Role` enum still includes `admin` (deferred, not cut)
- [ ] Changes committed

## Blocked by

None — can start immediately
