## Parent

UI/UX + debugging report (grilling session, 2026-07-21) — see CLAUDE.md.

## What to build

`DonorFinderClient` (`src/app/hospital/donor-finder/`) and `DonorDirectory` (`src/components/hospital/donor-directory.tsx`) both call the same `listDonors()` server action and serve the same purpose with no meaningful functional difference — confirmed by direct comparison during grilling, not assumed.

Merge them into one page at `/hospital/directory`, keeping Donor Directory's table layout (Donor Name, Blood Type, Location, Eligibility badge, Contact button, email shown under name) and adopting Donor Finder's two advantages that Directory currently lacks:
- **Location filter** (Directory has none today)
- **Real pagination** — Directory currently hardcodes `pageSize: 50` with no page controls, silently truncating anything past 50 donors; port over Donor Finder's `PaginationControls` pattern

Delete the `/hospital/donor-finder` route entirely and remove its sidebar entry (`src/components/layout/sidebar.tsx`, `NAV_ITEMS.hospital`).

## Acceptance criteria

- [ ] `/hospital/directory` shows table layout + Contact button + eligibility badge + email (from Donor Directory)
- [ ] `/hospital/directory` has a working Location filter (from Donor Finder)
- [ ] `/hospital/directory` has real pagination — no silent 50-row cap
- [ ] `/hospital/donor-finder` route and its sidebar nav entry removed
- [ ] No other page references the deleted route

## Blocked by

None
