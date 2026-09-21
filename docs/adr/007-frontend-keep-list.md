# ADR 007 — Which existing UI is kept in the frontend

- Status: Accepted (2026-09-21, HITL decision on remodel issue 01)
- Decider: project owner

## Context

The issue asked which existing UI components, hooks, and layouts survive the
remodel. Current inventory is tracked in `contexts/current-structure.md`.

## Decision

Keep: `components/brand/`, `components/landing/`, `components/ui/`
(shadcn), the auth shell and pages, the role sidebar layout plus nav config,
and the `hooks/` React Query layer shape. Drop from the frontend: all direct
database access (`servers/*` internals and any direct Prisma imports in
client-reachable code), replaced by server actions / Route Handlers per
ADR 001 and ADR 003.

## Consequences

- Dark-only theme, black-and-red palette (brand red `#C1121F`), and the
  empty-state-per-screen rule carry over unchanged.
- The already-removed surfaces listed under "Removed" in
  `contexts/current-structure.md` stay removed.
