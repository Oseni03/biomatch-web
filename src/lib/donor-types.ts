export const BLOOD_GROUP_MAP: Record<string, string> = {
	A_PLUS: "A+",
	A_MINUS: "A-",
	B_PLUS: "B+",
	B_MINUS: "B-",
	AB_PLUS: "AB+",
	AB_MINUS: "AB-",
	O_PLUS: "O+",
	O_MINUS: "O-",
};

export function displayBloodGroup(bg: string | null | undefined): string {
	if (!bg) return "Unknown";
	return BLOOD_GROUP_MAP[bg] ?? bg;
}

export interface EmergencyMatchRequest {
	id: string;
	hospitalName: string;
	location: string;
	bloodType: string;
	requiredPints: number;
	contactPhone: string;
	urgency: "critical" | "high" | "medium";
	timestamp: string;
	status: "pending" | "matched" | "completed";
}

export interface DonationRecord {
	id: string;
	date: string;
	hospitalName: string;
	hospitalLocation: string | null;
	bloodGroup: string;
	unitsNeeded: number;
}

export type DonorStatus = "available" | "busy" | "inactive";

export interface DonorAlertWithRequest {
	alerts: {
		id: string;
		status: string;
		request: {
			bloodGroup: string;
			unitsNeeded: number;
			urgencyLevel: string;
			status: string;
			createdAt: Date;
			hospital: {
				id: string;
				name: string;
				location: string | null;
			};
		};
	}[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}
