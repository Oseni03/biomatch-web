# 72: Mutual Donation Confirmation

**What to build:** A donor records attendance and hospital staff confirms that donation occurred. BioMatch completes the donation only after both sides confirm, then applies the cooldown and reward and resolves remaining matches.

**Blocked by:** 71: Donor Emergency Alert Response

**Status:** ready-for-agent

- [ ] Donor and hospital confirmations are recorded independently and are authorized for the correct participants.
- [ ] No donation record, reward, or cooldown is created after only one confirmation.
- [ ] Both confirmations atomically create the donation, award points, and start the 90-day cooldown.
- [ ] Once fulfilled, new accepts are prevented and remaining unmatched alerts are closed or released.
