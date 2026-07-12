## Parent

Redesign plan (from grilling session Q15).

## What to build

Redesign the `/hospital/inventory` page from its current table/grid display into a card-based blood search interface matching the plan's "Blood Search Page" design. Each hospital bank is displayed as a bento card showing available blood units by type, location, and contact info.

### Data model

- No schema changes — `HospitalBank.inventory` JSON blob (`Record<string, number>`) already stores units per blood group
- `getAllHospitalBanks()` server action already returns all banks with location

### Page redesign

- Replace the current layout with a search/filter bar at the top:
  - Blood group dropdown (filter by specific blood type)
  - Location text search (filter by hospital name or location)
  - "Show only available" toggle (hides banks with zero units of selected blood type)
- Display results as bento cards (not table rows):
  - Hospital name (bold, prominent)
  - Location with map pin icon
  - Blood inventory displayed as a mini bento grid within the card — one cell per blood group showing O+, O-, A+, A-, B+, B-, AB+, AB- with unit count
  - Contact phone/email
  - "Reserve" button (placeholder — opens a modal or shows contact info; the actual reservation workflow is future scope)
- Empty state when no banks match the filters
- Framer-motion staggered card entrance animation

### Server action updates

- No new server actions needed — the existing `getAllHospitalBanks()` and `listDonors()` (`EligibleDonorsList` sub-component) already provide the data
- Filtering is done client-side on the fetched data for responsiveness (small dataset — typically < 100 hospitals)

## Acceptance criteria

- [ ] Inventory page shows hospital banks as bento cards (not table rows)
- [ ] Each card shows hospital name, location, all 8 blood groups with unit counts, contact
- [ ] Blood group dropdown filter works (shows only banks with that blood type available)
- [ ] Location text search filters results by hospital name or location
- [ ] "Show only available" toggle hides banks with zero units of selected type
- [ ] "Reserve" button is present on each card
- [ ] Empty state displays when no banks match filters
- [ ] Framer-motion staggered card entrance animation plays
- [ ] EligibleDonorsList sub-component (existing donor table within the page) also visually updated to match new card style

## Blocked by

- 16-dashboard-sidebar-topbar
