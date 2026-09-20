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

- [ ] An ADR exists for each decision above, committed to the repository
- [ ] The prototype-data decision (reset vs migrate) is explicit and agreed
- [ ] The background job approach is decided so slices 15 and 23 can be built
- [ ] The team can start slice 03 with no open architecture questions

## Blocked by

None - can start immediately
