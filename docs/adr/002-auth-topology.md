# ADR 002 — Auth topology (Better Auth placement, cookies, CORS)

- Status: Accepted (2026-09-21, HITL decision on remodel issue 01)
- Decider: project owner

## Context

The issue asked where Better Auth runs and how the Next.js app authenticates
against it (cookie domain, CORS, auth client target). `src/lib/auth.ts`
already stubs a split setup: `BETTER_AUTH_URL` vs `APP_URL`, `trustedOrigins`
including `biomatchlimited.org`, and an optional `COOKIE_DOMAIN`
cross-subdomain block marked "decide the final setup in issue 01".

## Decision

Same-domain: Better Auth keeps running inside the Next.js app
(`app/api/auth/[...all]/route.ts`), so there is no cross-domain auth. No
cookie-domain sharing, no CORS allowlist, no auth-client retargeting.

## Consequences

- The `COOKIE_DOMAIN` / `crossSubDomainCookies` stub, the `BETTER_AUTH_URL`
  vs `APP_URL` split, and "separate backend" comments in `src/lib/auth.ts`
  are dead configuration surface. Simplify them in a later slice (recorded
  as follow-up; not done here to keep this slice decision-only).
- Session cookie-cache TTL (5 min) rationale in `auth.ts` is unaffected.
