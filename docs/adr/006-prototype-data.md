# ADR 006 — Prototype data: reset vs migrate

- Status: Accepted (2026-09-21, HITL decision on remodel issue 01)
- Decider: project owner

## Context

The issue asked whether to reset the database to the new baseline schema or
migrate existing rows. The remodel retires monolith models and renames
extensively (see `prisma/schema.prisma` header: HospitalBank, Wallet,
EmergencyRequest, EmergencyAlert retired; roles derived, not a column).

## Decision

Reset the database and start from the new baseline schema (baseline
migration plus `prisma/biomatch_constraints.sql` CHECKs, partial indexes,
triggers, and `blood_compatibility` seed data).

## Consequences

- Consistent with the owner's prior confirmation (2026-07-24) that the
  database holds no data worth preserving.
- Slice 03 must verify the baseline migration applies cleanly to an empty
  Postgres database, constraints migration included.
