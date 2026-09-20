# BioMATCH remodel: issues

Vertical slices (tracer bullets) for rebuilding the BioMatch prototype into the separated frontend/backend platform described in the PRD. Each file is one issue in the agreed template. Publish order below is dependency order.

**Confirmed decisions**
- Donors without a verified phone are matched for in-app alerts; phone verification only gates SMS and WhatsApp.
- Partner-hospital staff find a donor for screening by **donor code**.
- Issues are published as markdown files (no tracker configured, so no triage labels are applied; `type` is in each file's front matter).

**Conventions**
- Every UI slice includes its empty states in its acceptance criteria.
- HITL slices need a human decision; AFK slices can be built and merged without one.

| # | Title | Type | Blocked by | PRD |
|---|---|---|---|---|
| [01](01-architecture-and-migration-decisions.md) | Architecture and migration decisions | HITL | None | §2 |
| [02](02-messaging-providers-and-whatsapp-template.md) | Messaging providers and WhatsApp template approval | HITL | None | §6 |
| [03](03-walking-skeleton.md) | Walking skeleton: standalone backend, baseline schema, donor sign-up and sign-in | AFK | 01 | §2, 3.2 |
| [04](04-ndpr-consent-gate.md) | NDPR consent gate | AFK | 03 | §8 |
| [05](05-landing-page.md) | Landing page carried over with donor and hospital CTAs | AFK | 03 | §4.1 |
| [06](06-donor-profile-and-donor-code.md) | Donor profile: blood group, home pin, availability and donor code | AFK | 03, 04 | §4.3, 5.2 |
| [07](07-phone-verification-otp.md) | Phone number and OTP verification in profile settings | AFK | 02, 06 | §4.3, 6 |
| [08](08-hospital-registration-and-pending-state.md) | Hospital registration and pending-approval state | AFK | 03, 04 | §4.2, 5.1 |
| [09](09-admin-hospital-approval.md) | Admin: hospital approval and management | AFK | 08 | §4.4, 5.1 |
| [10](10-hospital-team-and-rbac.md) | Hospital team and role-based access control | AFK | 08 | §3.1, 4.2 |
| [11](11-donor-screening-by-donor-code.md) | Donor screening recorded by partner hospital staff | AFK | 06, 09, 10 | §5.2 |
| [12](12-create-request-and-match-donors.md) | Create blood request and match donors (in-app) | AFK | 06, 09, 11 | §5.3, 7, 4.3 |
| [13](13-donor-accept-with-unit-cap-and-donor-view.md) | Donor accepts with acceptances capped at units needed, plus hospital Donor View | AFK | 12 | §5.3, 4.2 |
| [14](14-decline-notifies-next-closest-donor.md) | Decline notifies the next-closest donor | AFK | 13 | §5.3 |
| [15](15-automatic-radius-escalation.md) | Automatic escalation to a wider radius | AFK | 13 | §5.3, 7 |
| [16](16-edit-cancel-close-requests-and-history.md) | Edit, cancel and close requests; Active Requests and History | AFK | 13 | §4.2, 7 |
| [17](17-multichannel-notification-delivery.md) | SMS, WhatsApp and email delivery with tracking and fallback | AFK | 02, 07, 12 | §6 |
| [18](18-donation-completion-cooldown-and-reward.md) | Donation completion: dual confirmation, cooldown and reward | AFK | 13 | §5.3, 5.4, 9 |
| [19](19-rewards-wallet-screen.md) | Rewards wallet screen | AFK | 18 | §4.3, 9 |
| [20](20-admin-merchant-management.md) | Admin: merchant management | AFK | 09 | §9 |
| [21](21-donor-redeems-voucher.md) | Donor redeems a voucher and receives a code | AFK | 19, 20 | §9 |
| [22](22-merchant-portal-redeem-code.md) | Merchant portal: verify and redeem codes | AFK | 21 | §9 |
| [23](23-voucher-expiry-policy-and-sweep.md) | Voucher expiry policy and sweep | HITL | 21 | §9 |
| [24](24-admin-donor-management.md) | Admin: donor management | AFK | 12 | §4.4 |
| [25](25-admin-platform-overview.md) | Admin: platform overview metrics | AFK | 18 | §4.4 |
| [26](26-hospital-dashboard-and-account-settings.md) | Hospital dashboard and account settings | AFK | 18 | §4.2 |
| [27](27-first-time-walkthroughs.md) | First-time walkthroughs for donors and hospitals | AFK | 06, 08 | §4.2, 4.3 |
| [28](28-ndpr-erasure.md) | NDPR erasure: account deletion | AFK | 04, 18 | §8 |
| [29](29-retire-the-monolith.md) | Retire the monolith's server actions and old schema | AFK | 18, 24, 26 | §2 |
