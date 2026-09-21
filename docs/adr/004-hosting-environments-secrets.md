# ADR 004 — Hosting, environments, and secrets

- Status: Accepted (2026-09-21, HITL decision on remodel issue 01)
- Decider: project owner

## Context

The issue asked for hosting and environments (local, staging, production)
and secrets management. Current state: `vercel.json` deploys the monolith to
Vercel; `.env.local.example` carries `DATABASE_URL`, `BETTER_AUTH_SECRET`,
`RESEND_API_KEY`, `EMAIL_FROM`. `DEPLOYMENT.md` is stale (Supabase + Next 14
era, predates Better Auth and the remodel).

## Decision

Single host: frontend and backend deploy together as one Next.js app
(Vercel, as today). Environments are local, staging, production. Secrets
live in provider env dashboards (and `.env.local` for development), never
committed.

## Consequences

- No sibling-subdomain or multi-service deployment to plan for slices 15
  and 23 workers (see ADR 005).
- Follow-up (not this slice): rewrite `DEPLOYMENT.md` to match the current
  stack, and confirm staging/production database and domain wiring before
  slice 03.
