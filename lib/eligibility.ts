export const ELIGIBILITY_DAYS = 56;

export interface EligibilityResult {
	eligible: boolean;
	lastDonation: boolean;
	daysSince: number;
	daysRemaining: number;
}

export function getEligibility(lastDonationDate: string | null): EligibilityResult {
	if (!lastDonationDate) {
		return {
			eligible: true,
			lastDonation: false,
			daysSince: 0,
			daysRemaining: 0,
		};
	}

	const last = new Date(lastDonationDate);
	const now = new Date();
	const daysSince = Math.floor(
		(now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24),
	);
	const daysRemaining = Math.max(0, ELIGIBILITY_DAYS - daysSince);

	return {
		eligible: daysSince >= ELIGIBILITY_DAYS,
		lastDonation: true,
		daysSince,
		daysRemaining,
	};
}
