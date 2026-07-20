## What to build

Build the end-to-end emergency request creation and matching flow. Hospital staff can create an emergency request specifying blood type, units needed, and urgency level (standard/critical). On creation, the system matches compatible donors using blood type compatibility rules (including universal donor/recipient), checks 56-day deferral eligibility, and filters by proximity radius. The matched donor pool is recorded against the request for downstream alerting.

### Prisma models to add

- `EmergencyRequest` — id, hospitalId (FK to User), bloodGroup (BloodGroup enum), unitsNeeded (Int), urgencyLevel (enum: standard/critical), status (enum: pending/matched/expired/cancelled/fulfilled), search radius (Int), createdAt, updatedAt
- `EmergencyAlert` — id, requestId (FK to EmergencyRequest), donorId (FK to User), status (enum: alerted/opened/accepted/declined/en_route/arrived/completed), respondedAt, createdAt, updatedAt

### Matching logic

- Query donors where: role=donor, bloodGroup is compatible (implement compatibility matrix), lastDonationDate is null or >56 days ago, isActive=true
- Sort by proximity (text-based location matching — exact match first, partial match second)
- Create EmergencyAlert records for each matched donor
- Return matched donor count to the hospital UI

## Acceptance criteria

- [ ] Hospital staff can create an emergency request with blood type, units, urgency level
- [ ] On creation, matching engine selects compatible, eligible donors within radius
- [ ] Blood type compatibility matrix handles universal donor (O-) and universal recipient (AB+)
- [ ] Donors with lastDonationDate within 56 days are excluded
- [ ] EmergencyAlert records are created for each matched donor
- [ ] Hospital UI shows confirmation with donor count after request creation
- [ ] Form validates required fields and acceptable ranges

## Blocked by

None — can start immediately
