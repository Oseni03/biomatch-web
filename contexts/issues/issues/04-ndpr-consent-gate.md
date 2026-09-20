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

- [ ] Sign-up form has required consent checkboxes and an optional marketing checkbox
- [ ] Accepting consents is idempotent: a double submit creates no duplicate rows
- [ ] A user missing any required consent at the current version receives a consent-required response from every non-exempt endpoint and is routed to the consent screen
- [ ] Consent, sign-out and session endpoints are exempt from the gate
- [ ] Bumping a policy version forces re-consent for existing users
- [ ] Marketing consent can be granted and revoked from settings; revoked rows are kept
- [ ] Attempting to withdraw a required consent is rejected with a message pointing to account deletion
- [ ] Tests cover the gate, idempotency and version bump

## Blocked by

- [03 Walking skeleton: standalone backend, baseline schema, donor sign-up and sign-in](03-walking-skeleton.md)
