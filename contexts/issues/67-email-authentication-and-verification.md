# 67: Email Authentication and Verification

**What to build:** Users register and sign in with only email and password. BioMatch sends verification and password-reset emails through Resend and blocks unverified users from protected routes while providing retryable recovery actions.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Registration accepts only email and password and preserves the selected account role.
- [ ] Resend delivers verification and password-reset emails through server-side configuration.
- [ ] Unverified users cannot access protected routes and can resend verification without revealing account details.
- [ ] Existing accounts remain accessible during the transition.
