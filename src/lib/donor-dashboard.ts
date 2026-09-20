import { ELIGIBILITY_MONTHS } from "@/lib/eligibility";
import type { EligibilityResult } from "@/lib/eligibility";
import { displayBloodGroup } from "@/lib/donor-types";
import type {
	DonorAlertWithRequest,
	EmergencyMatchRequest,
} from "@/lib/donor-types";

const REQUIRED_HEALTH_KEYS = [
	"height_cm",
	"weight_kg",
	"blood_pressure",
	"resting_heart_rate",
] as const;

function hasText(value: unknown): boolean {
	return typeof value === "string" && value.trim().length > 0;
}

function hasHealthMetrics(health: Record<string, unknown>): boolean {
	return REQUIRED_HEALTH_KEYS.every((key) => {
		const value = health[key];
		return typeof value === "string"
			? value.trim().length > 0
			: value != null && String(value).trim().length > 0;
	});
}

export function hasIncompleteProfile(user: unknown): boolean {
	if (!user || typeof user !== "object") return true;
	const profile = user as Record<string, unknown>;
	return !(
		hasText(profile.name) &&
		profile.bloodGroup &&
		hasText(profile.location) &&
		profile.availability &&
		hasHealthMetrics((profile.updatedHealthInfo ?? {}) as Record<string, unknown>)
	);
}

export function buildRequests(
	alerts: DonorAlertWithRequest["alerts"],
): EmergencyMatchRequest[] {
	return (alerts ?? [])
		.filter((a) => a.request.status === "pending" || a.request.status === "matched")
		.map((a) => ({
			id: a.id,
			hospitalName: a.request.organization?.name ?? "Unknown",
			location: a.request.organization?.hospitalBanks[0]?.location ?? "Unknown",
			bloodType: displayBloodGroup(a.request.bloodGroup),
			requiredPints: a.request.unitsNeeded,
			contactPhone: "N/A",
			urgency: a.request.urgencyLevel === "critical" ? "critical" : "high",
			timestamp: new Date(a.request.createdAt).toISOString(),
			status: a.request.status as "pending" | "matched" | "completed",
			donorConfirmedAt: a.donorConfirmedAt
				? new Date(a.donorConfirmedAt).toISOString()
				: null,
		}));
}

export function getGreeting(): string {
	const hour = new Date().getHours();
	if (hour < 12) return "Good morning";
	if (hour < 17) return "Good afternoon";
	return "Good evening";
}

export function formatNextEligibleDate(lastDonationDate: Date): string {
	const next = new Date(lastDonationDate);
	next.setMonth(next.getMonth() + ELIGIBILITY_MONTHS);
	return next.toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

export function nextDonationCopy(
	eligibility: EligibilityResult,
	nextLabel: string | null,
): string {
	if (eligibility.eligible) {
		return eligibility.lastDonation
			? "Cooldown window complete — you're cleared to donate."
			: "Standard pre-donation screening will be performed at hospital arrival.";
	}
	return nextLabel ? `Next eligible on ${nextLabel}.` : "Deferral window in progress.";
}
