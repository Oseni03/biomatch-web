# ADR 001 — Backend framework and repo layout

- Status: Accepted (2026-09-21, HITL decision on remodel issue 01)
- Decider: project owner

## Context

Remodel issue 01 asked how the Next.js monolith becomes a frontend-only app
talking to a separate backend service: framework, runtime, monorepo vs
separate repos. The current codebase is a Next.js 16 monolith (App Router,
TypeScript 5.5) with all DB logic in `servers/*.ts` server actions and data
fetching via React Query hooks in `hooks/`.

## Decision

No separate backend service. The backend is the Next.js server layer in this
monorepo: Route Handlers (`app/api/`) plus Server Actions (`servers/`). One
repo, one deployable, one toolchain (no new framework or runtime).

## Consequences

- Slices 03 (standalone backend walking skeleton) and 29 (retire the
  monolith) were scoped on the split premise and need rescoping before they
  are built.
- `src/lib/auth.ts` comments anticipating a separate backend service
  (cross-subdomain cookies, backend-vs-frontend URL split) become stale; see
  ADR 002 follow-up.
- The skill rule "frontend has no database access" is enforced by the
  existing pattern: client components reach data only through server actions
  / Route Handlers, never through direct Prisma imports.
