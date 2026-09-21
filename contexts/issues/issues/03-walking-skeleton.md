---
id: 03
title: "Walking skeleton: Next.js baseline, baseline schema, donor sign-up and sign-in"
type: AFK
prd: "§2, 3.2"
---

# 03. Walking skeleton: Next.js baseline, baseline schema, donor sign-up and sign-in

**Type:** AFK &nbsp;|&nbsp; **PRD:** §2, 3.2

## Rescope (recorded 2026-09-21 in `docs/adr/010-slice-03-rescope.md`)

Retitled from "standalone backend" to "Next.js baseline" per ADR 001 (no
separate backend service). Criteria below are the rescoped wording.

## What to build

Prove the architecture end to end with the thinnest complete path. A new donor can sign up and sign in on the Next.js frontend, where authentication is served by the Next.js server layer, and then see a protected donor page that displays their session.

Includes the baseline database schema from the agreed database design: Better Auth core tables with the admin, organization and phone number plugins and the BioMATCH additional fields, UUID ids, plus the hand-written migration for constraints, partial indexes, triggers and seed data that Prisma cannot express. Email and password only. Roles are derived (donor profile, organization membership, admin plugin role), not a role column.

## Acceptance criteria

- [ ] Next.js app runs locally and in CI with a health endpoint (Route Handler)
- [ ] Baseline schema migration applies cleanly to an empty Postgres database, including the constraints migration
- [ ] A donor can sign up and sign in from the frontend through the Next.js server layer; the session persists across reloads
- [ ] Unauthenticated access to the protected donor page redirects to sign-in
- [ ] The frontend contains no direct database access for this flow
- [ ] CI runs lint, typecheck, migrations and tests against a real Postgres instance
- [ ] Integration test covers sign-up, sign-in and session retrieval

## Blocked by

- [01 Architecture and migration decisions](01-architecture-and-migration-decisions.md)
