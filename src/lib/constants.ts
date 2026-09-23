export const ELIGIBILITY_MONTHS = 3;
export const POINTS_PER_DONATION = 100;
export const CRITICAL_THRESHOLD = 5;

// Phone OTP (issue 07): app-level resend cooldown + hourly cap per number,
// on top of the better-auth rateLimit customRules for /phone-number/*.
export const PHONE_OTP_RESEND_SECONDS = 60;
export const PHONE_OTP_MAX_PER_HOUR = 5;
export const ACTIVE_ALERT_STATUSES = [
	"accepted",
	"en_route",
	"arrived",
	"completed",
] as const;

// Shared polling cadence for dashboard hooks that lack push updates.
// See contexts/phase-3-realtime.md for the planned SSE replacement.
export const POLL_INTERVAL_MS = 20_000;

export const VOUCHER_REDEEM_FAILED_MESSAGE =
	"This code cannot be redeemed. Check the code and try again.";

export const INSUFFICIENT_BALANCE_MESSAGE =
	"Insufficient wallet balance for this voucher amount.";
export const MERCHANT_UNAVAILABLE_MESSAGE =
	"This merchant is no longer accepting vouchers.";

export const VOUCHER_CODE_PATTERN = /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/;
