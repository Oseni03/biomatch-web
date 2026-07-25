// Only consumed by servers/user.ts's `listDonors({ eligibleOnly })` browse
// filter, a separate read path left unchanged by the 3-month cooldown rework
// in lib/eligibility.ts (see contexts/issues/58-*.md).
export const ELIGIBILITY_DAYS = 56;
export const ELIGIBILITY_MONTHS = 3;
export const POINTS_PER_DONATION = 100;
export const CRITICAL_THRESHOLD = 5;
export const ACTIVE_ALERT_STATUSES = [
	"accepted",
	"en_route",
	"arrived",
	"completed",
] as const;

// Shared polling cadence for dashboard hooks that lack push updates.
// See contexts/phase-3-realtime.md for the planned SSE replacement.
export const POLL_INTERVAL_MS = 20_000;
