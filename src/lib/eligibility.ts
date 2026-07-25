import { ELIGIBILITY_MONTHS } from "./constants";

export { ELIGIBILITY_MONTHS } from "./constants";

export interface EligibilityResult {
	eligible: boolean;
	lastDonation: boolean;
	daysSince: number;
	daysRemaining: number;
	windowDays: number;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function addEligibilityMonths(date: Date): Date {
	const result = new Date(date);
	result.setMonth(result.getMonth() + ELIGIBILITY_MONTHS);
	return result;
}

export function getEligibilityCutoffDate(from: Date = new Date()): Date {
	const cutoff = new Date(from);
	cutoff.setMonth(cutoff.getMonth() - ELIGIBILITY_MONTHS);
	return cutoff;
}

export function getEligibility(lastDonationDate: string | null): EligibilityResult {
	if (!lastDonationDate) {
		return {
			eligible: true,
			lastDonation: false,
			daysSince: 0,
			daysRemaining: 0,
			windowDays: 0,
		};
	}

	const last = new Date(lastDonationDate);
	const now = new Date();
	const eligibleDate = addEligibilityMonths(last);

	const daysSince = Math.floor((now.getTime() - last.getTime()) / MS_PER_DAY);
	const daysRemaining = Math.max(
		0,
		Math.ceil((eligibleDate.getTime() - now.getTime()) / MS_PER_DAY),
	);
	const windowDays = Math.round(
		(eligibleDate.getTime() - last.getTime()) / MS_PER_DAY,
	);

	return {
		eligible: now.getTime() >= eligibleDate.getTime(),
		lastDonation: true,
		daysSince,
		daysRemaining,
		windowDays,
	};
}
