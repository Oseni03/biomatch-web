# BIO MATCH — Product Requirements Document

**Version:** 1.0  
**Date:** June 24, 2026  
**Status:** Ready for development

---

## Problem Statement

In many developing countries, delayed access to safe and compatible blood during medical emergencies results in preventable deaths. When a patient needs blood urgently, hospital staff must rely on informal networks — phone calls, personal contacts, and family appeals — to locate willing donors. This process is slow, uncoordinated, and unreliable. There is no centralized, real-time system connecting hospitals with nearby voluntary blood donors at the moment of need.

---

## Solution

BIO MATCH is a health-tech platform that enables hospital staff to instantly search for and alert compatible blood donors nearby during emergencies. Donors register voluntarily, receive real-time emergency alerts via push notification and SMS, and travel to the hospital to donate. The platform acts as a discovery and coordination layer — hospitals are still responsible for screening donors before transfusion. BIO MATCH reduces the time from emergency blood request to donor confirmation, saving lives by accelerating a process that currently has no digital infrastructure.

---

## User Stories

### Hospital staff (primary emergency requester)

1. As a hospital staff member, I want to trigger an emergency blood request from a dashboard, so that I can reach nearby donors immediately without making individual phone calls.
2. As a hospital staff member, I want to specify blood type, quantity needed, and urgency level when making a request, so that only compatible and appropriately motivated donors are alerted.
3. As a hospital staff member, I want to see in real time how many donors were alerted, how many opened the notification, and how many accepted, so that I can make parallel decisions rather than waiting blindly.
4. As a hospital staff member, I want the platform to automatically widen the search radius if no donor responds within 5 minutes, so that coverage expands without manual intervention.
5. As a hospital staff member, I want to see a donor's estimated travel time and live "en route" status once they accept, so that I know when to expect them.
6. As a hospital staff member, I want to view a history of emergency requests and their outcomes, so that I can report on platform performance and identify gaps.
7. As a hospital staff member, I want to access a donor directory filtered by blood type and proximity, so that I can proactively identify high-value donors before emergencies occur.

### Voluntary donor

8. As a voluntary donor, I want to register my blood type, location, and availability preferences, so that I only receive relevant alerts I can act on.
9. As a voluntary donor, I want to receive a push notification when there is a nearby emergency matching my blood type, so that I can respond quickly.
10. As a voluntary donor, I want to receive an SMS alert if I don't open the push notification within 2 minutes, so that I never miss a critical request due to connectivity issues.
11. As a voluntary donor, I want to accept or decline an emergency request in one tap, so that the hospital gets a fast, clear signal.
12. As a voluntary donor, I want to mark myself as "en route" after accepting, so that the hospital can track my expected arrival.
13. As a voluntary donor, I want to receive a notification when I become eligible to donate again (after the standard recovery period), so that I stay engaged without guessing.
14. As a voluntary donor, I want to see how many emergencies have occurred near me this month, so that I understand local demand for my blood type.
15. As a voluntary donor, I want to track my full donation history on the platform, so that I can see my personal impact over time.
16. As a voluntary donor, I want my basic HMO coverage to be activated after my first confirmed donation, so that I have tangible, immediate personal value from registering.
17. As a voluntary donor, I want my HMO coverage to upgrade after every 3 confirmed donations, so that continued engagement is rewarded progressively.
18. As a voluntary donor, I want to update my location and availability status easily, so that alerts remain accurate as my life circumstances change.

### Hospital administrator

19. As a hospital administrator, I want to manage staff accounts and permissions on the dashboard, so that access is controlled appropriately.
20. As a hospital administrator, I want to view aggregated analytics on emergency response times, donor response rates, and blood type coverage gaps, so that I can improve our preparedness.
21. As a hospital administrator, I want to export donation records and platform usage reports, so that I can meet internal reporting requirements.

### Institutional partner (university / corporate)

22. As an institutional partner (university or employer), I want to register my organization on BIO MATCH and invite members to join as donors, so that I can run coordinated donor drives through the platform.
23. As an institutional partner, I want to see aggregate participation data for my organization's donors (without personal details), so that I can measure the impact of our donor community.

---

## Implementation Decisions

### Platform architecture

- BIO MATCH is a two-sided platform: a **hospital-facing dashboard** (web, desktop-first) and a **donor-facing mobile app** (iOS and Android).
- The two sides communicate through a shared backend API.
- The hospital dashboard is the primary emergency request interface. The mobile app is the primary donor interface.

### Emergency request and matching engine

- An emergency request includes: blood type, units needed, urgency level (standard / critical), and requesting hospital location.
- The matching engine queries all active donors within an initial radius, filtered by blood type compatibility.
- If zero donors accept within a configurable window (default: 5 minutes), the radius automatically expands in increments until a hard maximum radius or a maximum alert count is reached.
- Compatibility logic must account for universal donors (O-) and universal recipients (AB+).
- Donor eligibility is checked at alert time: donors who donated within the past 56 days (standard deferral period) are excluded from the active pool.

### Notification delivery

- **Primary channel:** Push notification (iOS APNs / Android FCM).
- **Fallback channel:** SMS, triggered automatically if the push notification is not opened within 2 minutes. SMS must work on any GSM network without data.
- For requests with urgency level "critical," SMS is sent simultaneously with push (no delay).
- Notification content includes: blood type needed, hospital name, approximate distance, and a single-tap accept/decline action.

### Donor verification model

- BIO MATCH is a **discovery and coordination tool**, not a certified blood bank.
- Donors self-register. All donor profiles carry a visible "unverified" status by default.
- The hospital is responsible for screening donors before transfusion.
- In a future version, registered hospitals will be able to "badge" donors they have previously screened, upgrading them to "hospital-verified" status on the platform.

### HMO incentive system

- HMO coverage is managed through a partnership with an external HMO provider via API integration.
- Coverage tiers:
  - Basic plan: unlocked after first confirmed donation.
  - Upgraded plan: unlocked after every 3 cumulative confirmed donations.
- A donation is "confirmed" when the hospital staff member marks it as completed in the dashboard after the donor arrives and donates.
- The HMO provider receives an enrollment event via API on each coverage unlock.

### Failure state transparency

- The hospital dashboard displays a live request status panel showing: donors alerted, notifications opened, acceptances, and current donor status (accepted / en route / arrived).
- If a request closes without fulfillment, the final state is preserved in history with the full alert funnel visible.

### Donor retention and engagement

- Utility reminders are sent at key moments: re-eligibility after 56-day deferral, low local supply alerts for the donor's blood type, and monthly local demand summaries.
- Institutional partners (universities, employers) can create a branded donor group, invite members, and run group drives through the platform.
- Gamification (badges, leaderboards) is explicitly out of scope for V1.

### Monetization

- Hospitals access the platform via a monthly SaaS subscription.
- Donors always access the platform for free.
- Subscription tiers and pricing are out of scope for this PRD but must be supported architecturally (feature flags per subscription tier).

### North star metric

- **Average time from emergency request creation to first donor confirmation.** All product decisions should be evaluated against their impact on this metric.

---

## Testing Decisions

### What makes a good test

Tests should verify observable, external behavior — what the system does — not how it does it internally. Avoid coupling tests to implementation details like internal function names, database schema, or notification library internals.

### Modules to test

- **Matching engine:** Given a set of donors with known blood types, locations, and eligibility states, assert that the correct donor pool is returned for a given request. Test radius expansion logic in isolation.
- **Eligibility checker:** Given a donor's last donation date, assert correct eligible/ineligible status across boundary conditions (55 days, 56 days, 57 days).
- **Notification fallback logic:** Assert that SMS is triggered after the correct delay when push is unacknowledged. Assert simultaneous send for critical urgency.
- **HMO enrollment trigger:** Assert that the correct enrollment event is emitted to the HMO API when donation confirmation milestones are reached (1st, 3rd, 6th donations).
- **Donation confirmation flow:** Assert that marking a donation as confirmed in the dashboard updates donor eligibility state, HMO milestone count, and donation history correctly.

### Integration tests

- End-to-end request flow: hospital creates request → matching engine selects donors → notifications sent → donor accepts → en route status updates → hospital dashboard reflects state changes in real time.
- Radius expansion: simulate zero acceptances for 5 minutes and assert the expanded donor pool query is triggered with the correct new radius.

---

## Out of Scope (V1)

- Hospital-verified donor badging (planned for V2).
- USSD integration for feature phones without smartphones.
- Automated voice call alerts.
- Logistics / courier dispatch for blood collection.
- Family member emergency request flow (secondary actor, not V1 primary user).
- Gamification (badges, streaks, leaderboards).
- Blood inventory tracking within hospitals.
- Integration with national blood bank registries.
- Payments or transaction fees of any kind.
- Multi-country / multi-language support beyond English and Nigerian context.

---

## Further Notes

### Launch coalition — tri-party pilot

BIO MATCH launches with three anchor partners:
- **Anchor hospital** — seeds demand and co-signs the pilot case study.
- **Anchor university** — seeds the initial donor supply pool.
- **HMO partner** — funds and administers the donor incentive program.

These three partners must be brought into a shared pilot agreement before launch, with defined roles and shared access to aggregated outcome data. The goal is a publishable case study — response times, fulfillment rates, donors enrolled — that serves as the primary sales asset for acquiring the second hospital.

### Pre-launch validation requirement

Before going live, run a minimum of 3 simulated emergency drills with the university donor pool. Measure: notification open rate, accept rate, actual travel time vs. proximity estimate, and drop-off points in the funnel. This data must exist before any paid hospital pitch is made.

### Lagos traffic — proximity vs. availability

Geolocation proximity does not equal arrival time in dense urban environments. The matching algorithm should factor estimated travel time (not just straight-line distance) into donor ranking. This is especially important for blood types where scarcity is highest (O-).
