## What to build

Enhance donor registration and profile to capture location, availability preferences, and active status. Donors specify their location (text string), when they are available to donate, and can toggle whether they want to receive emergency alerts.

### Schema additions to User

- `location` String? — free-text location (e.g., "Ikeja, Lagos")
- `availability` String? — comma-separated days/time or free text (e.g., "weekends, evenings")
- `isActive` Boolean (default: true) — opt-in/out of emergency alerts

### Signup form updates

- Add location text input (required)
- Add availability text input (optional)
- Add "Receive emergency alerts" toggle (default: on, maps to isActive)

### Health profile updates

- Add location edit field (pre-filled from signup)
- Add availability edit field
- Add "Pause emergency alerts" toggle (maps to isActive)

### Server actions

- `updateDonorAvailability(userId, availability, isActive)` — update availability and active status
- `updateDonorLocation(userId, location)` — update location

### Matching engine integration

- Matching engine already filters donors where isActive=true (from Issue 01)
- Location is used for proximity sorting and radius matching

## Acceptance criteria

- [ ] Donor signup form includes location (required) and availability (optional) fields
- [ ] Donor signup includes "Receive emergency alerts" toggle (default on)
- [ ] Health profile page shows location, availability, and active status with edit capability
- [ ] Donor can update location independently
- [ ] Donor can toggle emergency alerts on/off (isActive)
- [ ] When isActive=false, donor is excluded from matching engine queries
- [ ] Location changes are reflected in proximity matching within reasonable time

## Blocked by

None — can start immediately
