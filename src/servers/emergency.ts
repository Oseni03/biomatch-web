"use server";

import type {
	DonationRecord,
	DonorAlertWithRequest,
} from "@/lib/donor-types";
import { prisma } from "@/lib/prisma";
import { confirmDonationByDonor, confirmDonationByHospital, getMyDonations } from "@/servers/donations";

export interface PendingAlertItem {
	id: string;
	status: string;
	updatedAt: Date;
	donor: {
		name: string | null;
		bloodGroup: string | null;
		location: string | null;
	};
}

export interface PendingRequestAggregates {
	alerted: number;
	accepted: number;
	declined: number;
	en_route: number;
	arrived: number;
	completed: number;
}

export interface PendingRequestItem {
	id: string;
	bloodGroup: string;
	unitsNeeded: number;
	urgencyLevel: string;
	status: string;
	searchRadius: number | null;
	createdAt: Date;
	organization: {
		hospitalBanks: { location: string }[];
	} | null;
	aggregates: PendingRequestAggregates;
	alerts: PendingAlertItem[];
}

export interface PendingRequestsResult {
	requests: PendingRequestItem[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export interface EmergencyHistoryItem {
	id: string;
	status: string;
	bloodGroup: string;
	unitsNeeded: number;
	createdAt: Date;
	aggregates: {
		alerted: number;
		accepted: number;
		en_route: number;
		arrived: number;
		completed: number;
	};
	alerts: {
		id: string;
		status: string;
		donor: { name: string | null; bloodGroup: string | null };
	}[];
}

export interface EmergencyHistoryResult {
	requests: EmergencyHistoryItem[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export interface DonorHistoryResult {
	records: DonationRecord[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export interface LocalDemandStats {
	monthlyDemand: number;
	nearbyRequests: number;
}

export interface ExpandRadiusResult {
	expanded: boolean;
	reason: string;
	searchRadius: number;
	newDonorsAdded: number;
}

export async function markAlertOpened(_alertId: string): Promise<void> {
	return;
}

export async function getAlertsForDonor(
	_donorId: string,
	filters?: { page?: number; pageSize?: number },
): Promise<DonorAlertWithRequest> {
	const page = filters?.page ?? 1;
	const pageSize = filters?.pageSize ?? 10;
	return { alerts: [], total: 0, page, pageSize, totalPages: 0, blacklisted: false };
}

export async function getPendingEmergencyRequestsForOrganization(
	_organizationId: string,
	filters?: { page?: number; pageSize?: number },
): Promise<PendingRequestsResult> {
	const page = filters?.page ?? 1;
	const pageSize = filters?.pageSize ?? 10;
	return { requests: [], total: 0, page, pageSize, totalPages: 0 };
}

export async function expandSearchRadius(
	_requestId: string,
): Promise<ExpandRadiusResult> {
	return { expanded: false, reason: "not_implemented", searchRadius: 0, newDonorsAdded: 0 };
}

export async function getEmergencyHistory(
	_organizationId: string,
	_filters?: {
		dateFrom?: string;
		dateTo?: string;
		bloodGroup?: string;
		status?: string;
		page?: number;
		pageSize?: number;
	},
): Promise<EmergencyHistoryResult> {
	return { requests: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
}

export async function respondToAlert(
	_alertId: string,
	_response: "accepted" | "declined",
	_donorId: string,
): Promise<never> {
	throw new Error("Alert response arrives in slice 13");
}

export async function withdrawAlert(
	_alertId: string,
	_donorId: string,
	_reason?: string,
): Promise<never> {
	throw new Error("Alert response arrives in slice 13");
}

export async function updateAlertStatus(
	_alertId: string,
	_status: string,
	_donorId: string,
): Promise<never> {
	throw new Error("Alert response arrives in slice 13");
}

export async function confirmDonation(
	alertId: string,
	organizationId: string,
	callerUserId: string,
): Promise<{ completed: boolean }> {
	return confirmDonationByHospital(organizationId, callerUserId, alertId);
}

export async function donorConfirmDonation(
	alertId: string,
	donorId: string,
): Promise<{ completed: boolean }> {
	return confirmDonationByDonor(alertId, donorId);
}

export async function getAlertsAwaitingConfirmation(
	organizationId: string,
): Promise<Array<{ id: string; matchId: string; donorId: string; donorName: string; bloodGroup: string }>> {
	const donations = await prisma.donation.findMany({
		where: {
			organizationId,
			donorConfirmedAt: { not: null },
			hospitalConfirmedAt: null,
		},
		select: {
			id: true,
			matchId: true,
			donorId: true,
			donor: { select: { user: { select: { name: true } }, bloodGroup: true } },
		},
	});
	return donations.map((d) => ({
		id: d.id,
		matchId: d.matchId,
		donorId: d.donorId,
		donorName: d.donor.user.name ?? "Unknown",
		bloodGroup: String(d.donor.bloodGroup).replace("_", " "),
	}));
}

export async function getDonorHistory(
	userId: string,
	filters?: { page?: number; pageSize?: number },
) {
	const result = await getMyDonations(userId, filters);
	return {
		records: result.donations.map((d) => ({
			donationId: d.donationId,
			matchId: d.matchId,
			requestId: d.requestId,
			completedAt: d.completedAt,
			request: {
				bloodGroup: d.bloodGroup,
				locationName: d.locationName,
				organization: { name: d.hospitalName },
			},
		})),
		total: result.total,
		page: filters?.page ?? 1,
		pageSize: filters?.pageSize ?? 10,
		totalPages: Math.ceil(result.total / (filters?.pageSize ?? 10)),
	};
}

export async function getLocalDemandStats(
	userId: string,
) {
	const [, orgRequests] = await Promise.all([
		getMyDonations(userId, { page: 1, pageSize: 1 }),
		prisma.bloodRequest.count({
			where: { status: "active" },
		}),
	]);
	return {
		monthlyDemand: orgRequests,
		nearbyRequests: 0,
	};
}
