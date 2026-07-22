## Parent

UI/UX + debugging report (grilling session, 2026-07-21) — see CLAUDE.md.

Status: needs-triage — **not ready-for-agent**.

## What to build

Stakeholder report: searching "Divine" on the hospital donor search returns no results, reported as a bug. Confirmed during grilling that this is production data, not a dev/seed-data gap.

Code review of `listDonors()` (`src/servers/user.ts` lines 92-143) found the search query itself correct: case-insensitive (`mode: "insensitive"`) substring match (`contains`) against the `name` column. There is no client-side re-filtering step that could discard valid server results, and the `eligibleOnly` filter (confirmed unchecked by default, state unclear whether it was checked during the actual repro) is a separate, independently-correct filter, not a bug in how it combines with search.

Resolved during grilling: **no code change** — the working theory is that "Divine" is a nickname/informal name (e.g. a middle name) that isn't literally present in the donor's stored `name` field, which would make this expected behavior (search correctly matches what's stored) rather than a bug. The stakeholder explicitly declined to add nickname/alias search support for this.

## Why this is not ready-for-agent

Requires checking the actual production `User.name` value for the donor in question — an agent without production DB access cannot confirm or refute the nickname theory. This needs a human (or someone with DB/admin access) to look up the record before any further action (including "no action needed") can be confirmed.

## Acceptance criteria

- [ ] Confirm what is actually stored in `User.name` for the donor referred to as "Divine"
- [ ] If the stored name does contain "Divine" as a substring and the search still fails, re-open as a real bug with the exact repro (search term, eligible-only checkbox state, results returned)
- [ ] If the stored name does not contain "Divine", close as expected behavior — no code change

## Blocked by

None technically, but should not be picked up by an agent — see "Why this is not ready-for-agent" above.
