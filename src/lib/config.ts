function readInt(name: string, fallback: number): number {
	const raw = process.env[name];
	if (!raw) return fallback;
	const parsed = Number.parseInt(raw, 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

// Tunable backend values (referenced by prisma/biomatch_constraints.sql).
// Override any of these with the matching environment variable.

export const MATCH_START_RADIUS_KM = readInt("MATCH_START_RADIUS_KM", 10);
export const MATCH_MAX_RADIUS_KM = readInt("MATCH_MAX_RADIUS_KM", 50);
export const MATCH_ESCALATION_STEP_KM = readInt("MATCH_ESCALATION_STEP_KM", 10);
export const MATCH_ESCALATION_WINDOW_MINUTES = readInt(
	"MATCH_ESCALATION_WINDOW_MINUTES",
	30,
);
export const LOCATION_FRESH_HOURS = readInt("LOCATION_FRESH_HOURS", 24);
export const COOLDOWN_DAYS = readInt("COOLDOWN_DAYS", 90);

// Donation reward credited to the donor wallet on completion (issue 18).
// Placeholder product value: 1,000 NGN, stored as integer kobo.
export const REWARD_CREDIT_KOBO = readInt("REWARD_CREDIT_KOBO", 100_000);

// Voucher validity from issue date (issue 21).
export const VOUCHER_VALIDITY_DAYS = readInt("VOUCHER_VALIDITY_DAYS", 90);

// External-channel delivery attempts per notification channel (issue 17):
// the initial attempt plus retries of failed rows before giving up.
export const DELIVERY_MAX_ATTEMPTS = readInt("DELIVERY_MAX_ATTEMPTS", 3);
