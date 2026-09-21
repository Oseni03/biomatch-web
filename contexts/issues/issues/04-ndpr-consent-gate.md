---
id: 04
title: "NDPR consent gate"
type: AFK
prd: "§8"
---

# 04. NDPR consent gate

**Type:** AFK &nbsp;|&nbsp; **PRD:** §8

## What to build

Sign-up requires accepting terms, privacy policy and data processing, and an optional marketing toggle. Consent is stored as an append-only log with the policy version, timestamp and IP. A gate blocks every other backend endpoint until the current versions of the required consents are accepted, so it also covers policy updates: bumping a version sends every user to a re-consent screen at their next request.

Required consents cannot be withdrawn on their own; withdrawing marketing sets a revoked timestamp and never deletes the row. The stored version is always the server's current version, never client input.

## Acceptance criteria

- [x] Sign-up form has required consent checkboxes and an optional marketing checkbox
- [x] Accepting consents is idempotent: a double submit creates no duplicate rows
- [x] A user missing any required consent at the current version receives a consent-required response from every non-exempt endpoint and is routed to the consent screen
- [x] Consent, sign-out and session endpoints are exempt from the gate
- [x] Bumping a policy version forces re-consent for existing users
- [x] Marketing consent can be granted and revoked from settings; revoked rows are kept
- [x] Attempting to withdraw a required consent is rejected with a message pointing to account deletion
- [x] Tests cover the gate, idempotency and version bump

## Implementation (recorded 2026-09-21)

Built on the Next.js server layer per ADR 001 (no separate backend service):
`src/lib/consent.ts` (policy version + pure helpers),
`src/servers/consent.ts` (session-derived accept/update/withdraw, userId-based
gate helpers for the proxy and tests), `src/hooks/use-consent.ts`,
`src/components/consent/` (shared checkboxes + settings toggle),
`/auth/consent` re-consent route, proxy gate for
`/donor|/hospital|/admin|/auth/onboarding`, `requireConsentsForUser` wired
into `servers/user.ts` and `servers/organization.ts`, and
`tests/consent-gate.test.ts` (5 passing). "Backend endpoint" in the criteria
above means Route Handlers + Server Actions; pages are gated by redirect.

## Blocked by

- [03 Walking skeleton: standalone backend, baseline schema, donor sign-up and sign-in](03-walking-skeleton.md)
