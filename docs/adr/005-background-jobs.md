# ADR 005 — Background job approach

- Status: Accepted (2026-09-21, HITL decision on remodel issue 01)
- Decider: project owner

## Context

Later slices depend on this: slice 15 (automatic radius escalation via
`blood_requests.nextEscalationAt`) and slice 23 (voucher expiry sweep over
`voucher_redemptions.expiresAt`). Options were a queue vs a scheduled job.
`prisma/biomatch_constraints.sql` already provides the polling indexes
(`br_escalation_idx`, voucher expiry conditions).

## Decision

Scheduled job (cron) polling the database through the existing indexes. No
queue infrastructure for the prototype.

## Consequences

- Escalation and expiry workers run as scheduled invocations against the
  single host (see ADR 004); idempotency keys off the row state both workers
  already update transactionally.
- If delayed-job precision or at-least-once guarantees become a problem,
  revisit with a queue; that migration is not planned.
