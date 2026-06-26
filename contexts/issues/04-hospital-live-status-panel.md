## What to build

Hospital staff see a live status panel for each active emergency request showing the full alert funnel: donors alerted, notifications opened, acceptances, and current status of each donor (accepted / en route / arrived). Completed requests are preserved in a history view with the full funnel visible, including unfulfilled requests showing where in the funnel the shortfall occurred.

### Hospital UI — Live Status Panel

- Request detail view with funnel metrics:
  - Total donors alerted (count)
  - Notifications opened (count)
  - Accepted (count + list)
  - Currently en route (count + list with ETA if available)
  - Arrived (count + list)
- Each listed donor shows name, blood group, status badge, and last status update time
- Auto-refreshes via polling or SSE

### Hospital UI — Request History

- List of past emergency requests with: date, blood type, units, urgency, final status (fulfilled/expired/cancelled)
- Expandable row showing full funnel breakdown for each request
- Filterable by date range, blood type, status

### Server actions

- `getEmergencyRequestStatus(requestId)` — returns request with all alert aggregates and donor details
- `getEmergencyHistory(hospitalId, filters?)` — paginated history with funnel data

## ✅ Completed

| Deliverable | Files |
|---|---|
| `getEmergencyRequestStatus` server action | `servers/emergency.ts` |
| `getEmergencyHistory` server action | `servers/emergency.ts` |
| `useEmergencyRequestStatus` hook (5s polling) | `hooks/use-emergency-requests.ts` |
| `useEmergencyHistory` hook | `hooks/use-emergency-requests.ts` |
| LiveStatusPanel component | `components/hospital/live-status-panel.tsx` |
| EmergencyHistory component | `components/hospital/emergency-history.tsx` |
| History tab in dashboard | `components/hospital/hospital-dashboard.tsx` |

## Acceptance criteria

- [x] Active request shows real-time funnel counts (alerted → opened → accepted → en route → arrived)
- [x] Each funnel stage shows a donor list for that status
- [x] Donor entries show name, blood group, status badge, and update timestamp
- [x] Status updates from donor side reflect in the panel within 5 seconds
- [x] Request history shows all past requests with funnel data
- [x] Unfulfilled requests clearly show where in the funnel the shortfall occurred
- [x] History is filterable by date range, blood type, and status
- [x] History is paginated

## Blocked by

- Issue 02 — Donor Alert & Response (In-App)
