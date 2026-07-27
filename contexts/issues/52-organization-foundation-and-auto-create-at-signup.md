## Parent

Hospital-as-Organization grilling session (2026-07-22) — see AGENTS.md. First of 6 tickets (52-57), sequenced as a follow-up to the donor verification work (47-51), not blocking it.

## What to build

Today "hospital" is just a `User` row with `role: "hospital"`; there is no real tenant boundary. `HospitalBank.managedById`, `EmergencyRequest.hospitalId`, and `DonorScreening.hospitalId` (added in ticket 47) all point at a `User` id by convention, and hospital staff are separate `User` rows carrying an ad-hoc `hospitalStaffRole` field with no FK tying them to a specific hospital (`getStaffMembers()` only works by accident for the owning account, not for actual invited staff — see `servers/staff.ts`).

Add BetterAuth's [organization plugin](https://www.better-auth.com/docs/plugins/organization) to `lib/auth.ts` and `lib/auth-client.ts`, which creates its own `Organization`, `Member`, and `Invitation` tables (do not hand-roll these — let the plugin's schema generation produce them, then run it through the same additive-migration path as any other schema change).

Define exactly three custom org roles — `admin`, `requester`, `viewer` — via the plugin's access-control API, with permission statements per resource this app already gates: staff management, emergency requests, inventory, donor screening. BetterAuth auto-assigns whoever creates an org the framework `owner` role; treat `owner` as admin-equivalent in every permission check, but never expose `owner` as a selectable role in any invite UI — app-facing behavior is still exactly three roles.

Wire `signUpWithProfile()` (`servers/auth.ts`) so that a hospital signup (`role: "hospital"`) automatically creates exactly one Organization in the same flow, with the signing-up user as its owner. A hospital-role `User` should never exist without an org from this point forward. Enforce one-organization-per-user at the app level (reject anything that would create a second membership) — this is a policy check in our code, not a schema constraint, and can be relaxed later without a schema rework.

This ticket does not touch `HospitalBank`, `EmergencyRequest`, or `DonorScreening` — those FK migrations are tickets 54-56. This ticket only stands up the org/member/invitation foundation and auto-creation at signup.

## Acceptance criteria

- [ ] BetterAuth organization plugin installed and configured with custom `admin`/`requester`/`viewer` roles and per-resource access-control statements
- [ ] Hospital signup creates exactly one Organization per signup, with the signer as owner
- [ ] A second attempt to join/create an org for a user who already belongs to one is rejected at the app level
- [ ] `owner` role passes every `admin`-gated permission check but is never offered as an invite option
- [ ] Migration is additive only per AGENTS.md's Database Safety rules — no existing tables/columns touched yet

## Blocked by

None — can start immediately, but should not begin before donor verification tickets 47-51 are merged (deferred sequencing decision from the grilling session)
