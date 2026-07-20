## Parent

Simplification pass (grilling session, 2026-07-16), split off from issue #22.

Status: needs-triage — **not ready-for-agent**.

## What to build

Not for immediate implementation — logged for future scoping. Make dark mode the only theme (drop the light palette currently tuned for a `#FAFAF8` warm-white background) rather than letting users toggle between light and dark.

Requires a full contrast/accessibility audit of the existing brand redesign (issues #12-18): the `#C1121F` brand red, `shadow-card`/`shadow-brand` values, and every landing/dashboard component restyled during the redesign were validated against a light background and need re-validation against dark.

## Why this is not ready-for-agent

This is new design work requiring a human decision (target dark palette, contrast targets), not a cut of unnecessary complexity — an agent should not unilaterally choose replacement brand colors.

## Acceptance criteria

- [ ] Dark palette decided and documented (owner: human design review)
- [ ] Contrast/accessibility audit of brand red + shadows against the new dark background
- [ ] All redesigned components (issues #12-18) re-validated against the dark palette
- [ ] Light theme and toggle fully removed once dark-only is validated

## Blocked by

None technically, but should not be picked up until a design decision is made — see "Why this is not ready-for-agent" above.
