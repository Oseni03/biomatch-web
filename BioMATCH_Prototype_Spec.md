# BioMATCH Prototype — Implementation Spec

**Goal:** Technical proof-of-concept demonstrating the core value loop — a hospital posts a blood request, the system matches nearby compatible verified donors by real distance calculation, donors get alerted and confirm, hospital sees the match happen in real time.

**Stack:** Node.js/Express + PostgreSQL (single backend), React frontend, real haversine-based distance matching, simulated in-app notifications (no Twilio/WhatsApp).

## Scope Cuts (assumptions — flag if wrong)
- **No Admin portal.** Donors/hospitals are auto-verified or verified via a single boolean flip in the DB (no review UI).
- **No hospital team/RBAC.** One login per hospital account; no invite flow.
- **No onboarding walkthroughs/tutorials.**
- **No rewards/voucher redemption logic** — wallet shows a static running total, no redemption flow.
- **No SMS/WhatsApp/email integration** — notifications are in-app only (DB row + UI feed), architected so a real provider could be swapped in later.
- **Single fixed cooldown period** (90 days) — not varied by blood component type.
- **No urgency tiering** — matches PRD (all requests are equally urgent).
- **Donor location** = a manually entered address, geocoded once to lat/long at registration (no live GPS tracking).

---

## 1. Screens

### Public
| Screen | Purpose |
|---|---|
| Landing page | Value prop, "I'm a Hospital" / "I'm a Donor" CTAs |

### Hospital Portal
| Screen | Core elements |
|---|---|
| Register/Login | Org name, email, password, location (geocoded on submit) |
| Dashboard | Active request count, recent donation count, quick "Create Request" |
| Create Blood Request | Blood group, units needed, notes → triggers matching |
| Active Requests | List with status (matching / donor accepted / completed), close/edit actions |
| Request Detail (Donor View) | List of matched donors for that request + their response status (notified / accepted / declined / confirmed) |
| History | Closed/completed requests |

### Donor Portal
| Screen | Core elements |
|---|---|
| Register/Login | Name, blood group, address (geocoded), phone |
| Profile | Blood group, verification status (verified/unverified toggle for demo), availability toggle, cooldown status + countdown |
| Nearby Requests | List of active requests they're eligible/matched for, distance shown, Accept/Decline buttons |
| Notification Inbox | Feed of alerts received (simulates the SMS/WhatsApp trigger) |
| Donation History | Past completed donations |
| Rewards | Static voucher balance |

**Empty states**: at minimum — no active requests, no matches yet, no notifications, no donation history. Build these; they're cheap and the PRD calls them out explicitly.

---

## 2. Data Model (Postgres)

```
hospitals(id, name, email, password_hash, address, lat, lng, verified boolean, created_at)

donors(id, name, email, password_hash, phone, blood_group, address, lat, lng,
       verified boolean, available boolean, cooldown_until timestamp, created_at)

blood_requests(id, hospital_id, blood_group, units_needed, status ['open','matched','completed','closed'],
                created_at, closed_at)

request_matches(id, request_id, donor_id, distance_km, status ['notified','accepted','declined','confirmed'],
                 notified_at, responded_at)

notifications(id, donor_id, request_id, message, read boolean, created_at)

donations(id, request_id, donor_id, hospital_id, completed_at, voucher_amount)
```

---

## 3. Backend API (Express)

**Auth**
- `POST /api/hospitals/register`, `POST /api/hospitals/login`
- `POST /api/donors/register`, `POST /api/donors/login`
- Simple JWT session, no email verification flow needed for prototype

**Hospital**
- `GET /api/hospital/dashboard`
- `POST /api/requests` — create request → triggers matching engine
- `GET /api/requests` (active/history)
- `PATCH /api/requests/:id` — edit/close
- `GET /api/requests/:id/matches` — donor view per request

**Donor**
- `GET /api/donor/nearby-requests`
- `POST /api/matches/:id/accept`
- `POST /api/matches/:id/decline`
- `PATCH /api/donor/profile` — availability toggle
- `GET /api/donor/notifications`
- `POST /api/donations/:requestId/confirm` — both hospital & donor must confirm → triggers cooldown + voucher credit

**Matching engine (core logic — this is the heart of the PoC)**
- On request creation: query donors where `blood_group` compatible, `available = true`, `verified = true`, `cooldown_until < now`
- Compute haversine distance from hospital lat/lng to each eligible donor
- Sort by distance, notify all within initial radius (e.g. 10km) simultaneously — insert `request_matches` rows + `notifications` rows
- Background job/interval: if no acceptance within window (e.g. simulate as a manual "Escalate" button or short timer for demo purposes), widen radius and notify next ring
- On decline: notify next-closest untried donor
- Blood type compatibility table (donor→recipient) implemented as a lookup, not hardcoded per request

---

## 4. Phased Build Order (for the AI agent)

1. **DB schema + migrations** (table above)
2. **Auth** (hospital + donor register/login, JWT middleware)
3. **Blood type compatibility + haversine distance utility** (pure functions, unit-testable — this is the logic that proves the concept, get it right first)
4. **Create request → matching engine → notifications** (the core loop)
5. **Hospital screens**: Dashboard, Create Request, Active Requests, Request Detail/Donor View
6. **Donor screens**: Nearby Requests (accept/decline), Notification Inbox
7. **Confirmation + cooldown + voucher flow**: both-party confirm → donation record → cooldown_until set → voucher credited
8. **History screens** (hospital + donor) + Rewards screen (static balance display)
9. **Empty states** across all screens
10. **Seed script**: fake hospitals + ~30 donors spread across a city with varied blood groups/locations, so the matching logic has something real to chew on for demos

Steps 1–4 are the actual proof-of-concept; everything after is UI to make the loop visible and demoable.
