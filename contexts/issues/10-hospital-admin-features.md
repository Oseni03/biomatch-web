## What to build

Hospital administrators can manage staff accounts with role-based permissions, view aggregated analytics on emergency response performance, and export donation records for internal reporting.

### HITL Decisions Required

1. **Staff roles**: What permission levels are needed within a hospital? (e.g., admin, requester, viewer)
2. **Analytics KPIs**: Exact metrics and time ranges for the dashboard
3. **Export format**: CSV, PDF, or both? What fields should be included?

### Schema — HospitalStaff (or extend User)

- `HospitalStaffRole` enum: admin / requester / viewer
- `User.hospitalStaffRole` (String? or enum) — role within the hospital
- `User.hospitalId` (FK to HospitalBank or User for hospital admin) — which hospital the staff belongs to

### UI — Staff Management

- List of staff accounts for the hospital with role badges
- Invite new staff (email + role selection)
- Change/revoke roles
- Remove staff access

### UI — Analytics Dashboard

- Response time metrics: average time from request to first acceptance
- Donor response rates: % of alerted donors who accept
- Blood type coverage gaps: which blood types had the most unfulfilled requests
- Request volume over time (chart)
- Filterable by date range

### UI — Export

- "Export donation records" button
- Date range selector
- Downloads CSV with donation data

### Server actions

- `inviteStaffMember(hospitalId, email, role)` — sends invitation, creates staff record on acceptance
- `updateStaffRole(userId, role)` — changes role
- `removeStaffMember(userId)` — revokes access
- `getHospitalAnalytics(hospitalId, dateRange)` — aggregated metrics
- `exportDonationRecords(hospitalId, dateRange)` — returns CSV data

## Acceptance criteria

- [ ] Hospital admin can view staff list with role badges
- [ ] Hospital admin can invite new staff by email with role selection
- [ ] Hospital admin can change roles or remove staff
- [ ] Analytics dashboard shows response time, donor response rates, coverage gaps
- [ ] Analytics dashboard shows request volume over time
- [ ] Analytics is filterable by date range
- [ ] Export downloads a CSV with donation records for the selected date range
- [ ] Access controls enforce role-based permissions within hospital

## Blocked by

- Issue 04 — Hospital Live Request Status (for analytics data sources)
- Issue 06 — Donation Confirmation (for donation record data)
