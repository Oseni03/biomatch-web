## What to build

Institutional partners (universities, employers) can register their organization on BIO MATCH, invite members to join as donors, and view aggregate participation data without accessing personal details.

### HITL Decisions Required

1. **Partner onboarding**: Self-service registration vs manual approval? If manual, who approves?
2. **Invitation method**: Email invitation with unique link? Invite code? Batch upload?
3. **Dashboard access**: Separate login/portal for partner admins? Or within existing hospital/admin dashboard?
4. **Aggregate data scope**: What metrics matter most to partners? (donor count, donation frequency, blood type distribution?)

### Schema additions

- `PartnerOrganization` — id, name, contactEmail, contactPhone, logo (URL?), status (enum: pending/active/suspended), memberCount (Int, denormalized), createdAt, updatedAt
- `PartnerMember` — id, organizationId (FK to PartnerOrganization), userId (FK to User), invitedAt, joinedAt, isActive

### Server actions

- `registerPartnerOrganization(data)` — creates partner org with pending status
- `approvePartnerOrganization(orgId)` — activates a partner org (admin action)
- `invitePartnerMembers(orgId, emails[])` — sends email invitations, creates PartnerMember records
- `acceptPartnerInvite(token)` — donor accepts invitation, links User to PartnerOrganization
- `getPartnerAnalytics(orgId)` — returns aggregate metrics without personal details
  - Total registered members
  - Active donor count (donated in last 6 months)
  - Total donations this quarter
  - Blood type distribution (counts only, no names)

### Partner Dashboard UI

- Overview stats cards (total members, active donors, total donations)
- Blood type distribution chart (bar chart, counts only)
- Member list (name + join date + donation count — no personal health details)
- Invite members form (email input, bulk add)

## Acceptance criteria

- [ ] Partner org can be registered with name and contact info
- [ ] Partner org requires admin approval before activation (default: pending)
- [ ] Partner admin can invite members by email
- [ ] Donors can accept invitation and link to the partner org
- [ ] Partner dashboard shows aggregate data only — no personal health details
- [ ] Partner dashboard shows total members, active donors, total donations, blood type distribution
- [ ] Partner dashboard shows member list with name, join date, donation count
- [ ] Unaffiliated donors are not visible to partner orgs

## Blocked by

- Issue 08 — Donor Registration Enhancements (for donor profile structure)
