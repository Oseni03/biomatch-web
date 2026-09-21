# ADR 008 — Prisma 7 configuration carry-over

- Status: Accepted (2026-09-21, HITL decision on remodel issue 01)
- Decider: project owner

## Context

The issue asked which Prisma 7 configuration carries over (adapter,
generated client location). Current setup: `@prisma/adapter-pg` with a
`PrismaPg` adapter singleton in `src/lib/prisma.ts`, client generated into
`../generated/prisma`, datasource URL in `prisma.config.ts`, uuid ids via
`advanced.database.generateId`, and Better Auth CLI output treated as
authoritative for auth models (see `prisma/schema.prisma` header).

## Decision

Carry over unchanged: `@prisma/adapter-pg`, generated-client location,
`prisma.config.ts` datasource pattern, uuid id generation. Better Auth CLI
regeneration stays authoritative for auth models, with BioMATCH additions
re-applied afterwards.

## Consequences

- No Prisma client or adapter changes are needed for slice 03 beyond the
  baseline schema itself.
- The `WARNING` in `prisma/biomatch_constraints.sql` stands: hand-maintain
  the partial indexes against future `prisma migrate dev` output.
