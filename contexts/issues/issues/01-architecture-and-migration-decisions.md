---
id: 01
title: "Architecture and migration decisions"
type: HITL
prd: "§2"
---

# 01. Architecture and migration decisions

**Type:** HITL &nbsp;|&nbsp; **PRD:** §2

## What to build

Decide and record how the current Next.js monolith becomes a frontend-only app talking to a separate backend service. This is a human decision slice: the output is written decisions (ADRs), not features.

Decisions to make:
- Backend framework and runtime, and repo layout (monorepo vs separate repos).
- Where Better Auth runs (on the backend) and how the Next.js app authenticates against it (cookie domain, CORS, auth client pointed at the backend).
- API style and how the frontend gets a typed client.
- Hosting and environments (local, staging, production) and how secrets are managed.
- Background job approach for the escalation worker and voucher expiry sweep (queue vs scheduled job), since later slices depend on it.
- Prototype data: reset the database and start from the new baseline schema (recommended, since this is a prototype) vs migrate existing rows.
- Which existing UI components, hooks and layouts are kept in the frontend.
- Prisma 7 configuration carried over from the current repo (adapter, generated client location).

## Acceptance criteria

- [x] An ADR exists for each decision above, committed to the repository
- [x] The prototype-data decision (reset vs migrate) is explicit and agreed
- [x] The background job approach is decided so slices 15 and 23 can be built
- [x] The team can start slice 03 with no open architecture questions

## Decisions (recorded 2026-09-21, decider: project owner)

ADRs committed under `docs/adr/`:

- 001 backend framework + layout: no separate backend service; the backend
  is the Next.js server layer (Route Handlers + Server Actions), one repo,
  one deployable.
- 002 auth topology: same-domain; Better Auth stays mounted in the Next.js
  app, no cookie-domain sharing or CORS work.
- 003 API style: Next.js API (Route Handlers + Server Actions); TypeScript +
  zod, no OpenAPI codegen or tRPC.
- 004 hosting/environments/secrets: single host (Vercel, as today);
  local/staging/production; secrets in provider dashboards, never committed.
- 005 background jobs: scheduled cron polling existing indexes; no queue.
- 006 prototype data: reset to the baseline schema (plus constraints
  migration and seed data).
- 007 frontend keep-list: keep brand/landing/ui/auth shell/sidebar/hooks
  shape; frontend keeps no direct database access.
- 008 Prisma 7: carry over adapter-pg, generated-client location,
  prisma.config.ts pattern, uuid ids, Better Auth CLI authoritative.

## Deviations

- The issue premise ("monolith becomes a frontend-only app talking to a
  separate backend service") was explicitly rejected by human decision. The
  monolith stays; "backend" means the Next.js server layer. Slices 03 and
  29 were scoped on the split premise and need rescoping before they start.
- Follow-ups recorded in the ADRs, not built here: simplify the
  separate-backend stubs in `src/lib/auth.ts` (002); rewrite stale
  `DEPLOYMENT.md` and confirm staging/prod wiring before slice 03 (004).

## Blocked by

None - can start immediately
