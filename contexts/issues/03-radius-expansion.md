## What to build

If zero donors accept an emergency request within a configurable timeout (default: 5 minutes), the search radius automatically expands to find additional donors. The expansion continues in fixed increments until a configured hard maximum radius is reached or a configured maximum alert count is met. The hospital dashboard displays an "expanding search radius" indicator during expansion.

### Configuration (server-side constants or DB config)

- INITIAL_RADIUS: 5km (default, configurable)
- EXPANSION_INCREMENT: 5km (default)
- MAX_RADIUS: 25km (default)
- EXPANSION_TIMEOUT_MS: 300000 (5 minutes, configurable)
- MAX_ALERTS_PER_REQUEST: 50 (default)

### Server action

- `expandSearchRadius(requestId)` — called by a scheduled check or on-demand query
  - Checks current request radius
  - If within bounds and zero acceptances, increments radius
  - Queries new donors in expanded radius
  - Creates EmergencyAlert records for new donors
  - Returns updated donor count

### UI indicator

- Hospital request status panel shows "Expanding search radius..." when expansion is active
- Shows current radius and donor count after each expansion

## Acceptance criteria

- [ ] After 5 minutes with zero acceptances, search radius expands automatically
- [ ] Each expansion adds the configured increment to the current radius
- [ ] Newly eligible donors (in expanded radius) receive alerts
- [ ] Expansion stops when hard max radius is reached
- [ ] Expansion stops when max alert count is reached
- [ ] Hospital dashboard shows "Expanding search radius..." indicator
- [ ] Indicator updates with current radius and total alerted donor count

## Blocked by

- Issue 02 — Donor Alert & Response (In-App)
