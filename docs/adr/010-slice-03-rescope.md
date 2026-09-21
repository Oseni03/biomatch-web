# ADR 010 — Slice 03 rescope: Next.js walking skeleton

- Status: Accepted (2026-09-21, follows from ADR 001; recorded at owner's request)
- Decider: project owner (via ADR 001 decisions)

## Context

Slice 03 was scoped on the split premise ("standalone backend", "separated
architecture") that ADR 001 explicitly rejected: there is no separate
backend service; the backend is the Next.js server layer (Route Handlers +
Server Actions) on a single host. The slice as written cannot be built, so
it is rescoped here, not rebuilt from scratch. New title: "Walking
skeleton: Next.js baseline, baseline schema, donor sign-up and sign-in".

## Rescoped acceptance criteria (old → new)

- "Backend service runs locally and in CI with a health endpoint" →
  the Next.js app runs locally and in CI with a health endpoint served by
  a Route Handler (e.g. `app/api/health/route.ts`). Verified 2026-09-21:
  no health endpoint exists yet and the only API route is the Better Auth
  catch-all, so slice 03 builds it.
- Baseline schema migration on an empty Postgres database, constraints
  migration included → unchanged (ADR 006).
- "Sign up and sign in from the Next.js frontend through the backend" →
  through the Next.js server layer; session persists across reloads.
  Email and password only.
- Unauthenticated access to the protected donor page redirects to sign-in
  → unchanged (middleware RBAC).
- No direct database access in the frontend for this flow → unchanged.
- "CI runs lint, typecheck, migrations and tests against a real Postgres
  instance" → unchanged as a requirement, but verified 2026-09-21: no CI
  workflow exists yet, so slice 03 creates it. Discovered obstacle: the
  `lint` script (`next lint`) is broken repo-wide — `next lint` was removed
  in Next 16 — so CI setup must fix or replace it first.
- Integration test covers sign-up, sign-in and session retrieval →
  unchanged (real Postgres; no external providers involved in this flow).

## Consequences

- Slice 03 is build-ready: blocker (issue 01) is met and no architecture
  question remains open.
- Current auth UI and `servers/auth.ts` target the old schema; slice 03
  rebuilds this flow on the baseline, keeping it thin (email + password,
  no screening pass, no onboarding extras — those belong to later slices).
- Slice 29 ("retire the monolith") still assumes the split and still needs
  its own rescope; explicitly out of scope here.
