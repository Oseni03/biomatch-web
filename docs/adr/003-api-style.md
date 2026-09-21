# ADR 003 — API style and typed client

- Status: Accepted (2026-09-21, HITL decision on remodel issue 01)
- Decider: project owner

## Context

The issue asked for the API style and how the frontend gets a typed client.
Current pattern: pages import server actions from `servers/*.ts` directly,
wrapped by React Query hooks in `hooks/`; shared permission helper in
`src/lib/organization-access.ts`.

## Decision

Next.js API (Route Handlers + Server Actions). No OpenAPI codegen, no tRPC.
Typing is TypeScript end to end with zod schemas at the boundary; the
`hooks/` React Query layer keeps its shape over server actions.

## Consequences

- Permissions stay enforced on the server via the shared helper; hiding UI
  controls is not enforcement (unchanged rule).
- Server-controlled fields (verification statuses, roles, reward amounts)
  remain never client-settable (unchanged rule).
