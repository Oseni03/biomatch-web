---
id: 03
title: "Walking skeleton: standalone backend, baseline schema, donor sign-up and sign-in"
type: AFK
prd: "§2, 3.2"
---

# 03. Walking skeleton: standalone backend, baseline schema, donor sign-up and sign-in

**Type:** AFK &nbsp;|&nbsp; **PRD:** §2, 3.2

## What to build

Prove the separated architecture end to end with the thinnest complete path. A new donor can sign up and sign in on the existing Next.js frontend, where authentication is served by the standalone backend, and then see a protected donor page that displays their session.

Includes the baseline database schema from the agreed database design: Better Auth core tables with the admin, organization and phone number plugins and the BioMATCH additional fields, UUID ids, plus the hand-written migration for constraints, partial indexes, triggers and seed data that Prisma cannot express. Email and password only. Roles are derived (donor profile, organization membership, admin plugin role), not a role column.

## Acceptance criteria

- [ ] Backend service runs locally and in CI with a health endpoint
- [ ] Baseline schema migration applies cleanly to an empty Postgres database, including the constraints migration
- [ ] A donor can sign up and sign in from the Next.js frontend through the backend; the session persists across reloads
- [ ] Unauthenticated access to the protected donor page redirects to sign-in
- [ ] The frontend contains no direct database access for this flow
- [ ] CI runs lint, typecheck, migrations and tests against a real Postgres instance
- [ ] Integration test covers sign-up, sign-in and session retrieval

## Blocked by

- [01 Architecture and migration decisions](01-architecture-and-migration-decisions.md)
