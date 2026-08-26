# 68: Donor Profile Completion

**What to build:** After email verification, a donor is guided through a resumable profile-completion flow. The donor may access a limited dashboard before completion, but cannot participate in matching until the required donor and health information is present.

**Blocked by:** 67: Email Authentication and Verification

**Status:** ready-for-agent

- [ ] Donor signup does not collect profile fields beyond email and password.
- [ ] Verified donors are prompted to complete name, phone, blood group, address, location selection, health information, and availability.
- [ ] Completed sections save progressively and the flow resumes at the next incomplete section.
- [ ] Profile completion does not change the separate server-controlled donor verification status.
