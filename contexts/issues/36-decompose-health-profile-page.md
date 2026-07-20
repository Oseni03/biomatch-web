## Parent

Codebase optimization & page-decomposition audit (2026-07-19) — see CLAUDE.md.

## What to build

`app/donor/health-profile/page.tsx` is 660 lines — a 13-field health form, the location cascade (see issue #35), a profile-loading query, and 7 `SectionCard` blocks all inlined in one file. Split each `SectionCard`'s body into its own component under `components/donor/health-profile/`: `IdentitySection`, `EmergencyPreferencesSection`, `VitalsSection`, `MedicalHistorySection`, `EligibilityScreeningSection`, `LastScreeningSection`. Move the reusable `Field`/`Checkbox` helpers at the bottom of the file to `form-fields.tsx` in the same directory.

**Note for a human**: the "Emergency Preferences" section (location + availability + alert-pause toggle) arguably belongs closer to the donor dashboard's own `LocationSettingsCard` than to a health/medical-history page. This is a product placement question, not a mechanical one — flagged here, not resolved unilaterally. Proceed with the component-level decomposition either way; leave the section where it is unless a human says otherwise.

## Acceptance criteria

- [ ] Each of the 6 `SectionCard` bodies extracted to its own component file
- [ ] `Field`/`Checkbox` helpers moved to a shared `form-fields.tsx`
- [ ] `health-profile/page.tsx` reduced to composition + top-level form state/submit handler
- [ ] No behavior or validation change
- [ ] Emergency Preferences section-placement question surfaced to a human, not resolved unilaterally

## Blocked by

None — can start independently of #35, though naturally done together
