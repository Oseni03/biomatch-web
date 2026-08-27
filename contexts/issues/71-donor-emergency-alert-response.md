# 71: Donor Emergency Alert Response

**What to build:** A matched donor can inspect an emergency alert, explicitly accept or decline it, and follow clear next steps. Acceptance prevents duplicate commitments and keeps the hospital informed; withdrawal remains possible before hospital confirmation.

**Blocked by:** 70: Actionable Donor Dashboard

**Status:** ready-for-agent

- [ ] Alert details show blood group, units, urgency, approximate distance, hospital, broad location, request time, and arrival instructions.
- [ ] Accept and decline actions are confirmed and authorized server-side against the current match state.
- [ ] Acceptance makes the donor unavailable, notifies the hospital, and shows contact and arrival guidance.
- [ ] Withdrawal before hospital confirmation records a reason, restores availability, and notifies the hospital.
