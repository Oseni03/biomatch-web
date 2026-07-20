## Parent

Codebase optimization & page-decomposition audit (2026-07-19) — see CLAUDE.md.

## What to build

`getActiveEmergencyRequests()`, `getAlertsForDonor()`, `getEmergencyRequestsForHospital()`, and `getPendingEmergencyRequestsForHospital()` in `servers/emergency.ts` return unbounded result sets with no `take`/`skip`, unlike `getEmergencyHistory()` and `getDonorHistory()` which already paginate. As request volume grows these load unbounded rows into memory and over the wire on every dashboard poll.

Add consistent pagination (page/pageSize params + total count, matching the existing pattern in `getEmergencyHistory()`) to all four, and update the corresponding hooks in `hooks/use-emergency-requests.ts` and their calling components to pass through pagination.

## Acceptance criteria

- [ ] All four functions accept page/pageSize and return a shape consistent with `getEmergencyHistory()`'s existing pagination
- [ ] Corresponding hooks in `use-emergency-requests.ts` updated to pass pagination params
- [ ] Calling components (hospital broadcasts tab, donor alerts feed) still render correctly — add page controls only where genuinely needed for UX, not just because the API changed
- [ ] No behavior change for current typical data volumes

## Blocked by

None — can start immediately
