"use server";

import type {
	DonationRecord,
	DonorAlertWithRequest,
} from "@/lib/donor-types";

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

export async function createEmergencyRequest(_data: {
	organizationId: string;
	bloodGroup: string;
	unitsNeeded: number;
	urgencyLevel: "standard" | "critical";
	searchRadius?: number;
}): Promise<{ matchedDonorCount: number }> {
	throw new Error("Emergency requests arrive in slice 12");
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
	_alertId: string,
	_organizationId: string,
): Promise<never> {
	throw new Error("Donation confirmation arrives in slice 18");
}

export async function donorConfirmDonation(
	_alertId: string,
	_donorId: string,
): Promise<{ completed: boolean }> {
	throw new Error("Donation confirmation arrives in slice 18");
}

export async function getAlertsAwaitingConfirmation(
	_organizationId: string,
): Promise<never[]> {
	return [];
}

export async function getDonorHistory(
	_userId: string,
	page = 1,
	pageSize = 10,
): Promise<DonorHistoryResult> {
	return { records: [], total: 0, page, pageSize, totalPages: 0 };
}

export async function getLocalDemandStats(
	_userId: string,
): Promise<LocalDemandStats> {
	return { monthlyDemand: 0, nearbyRequests: 0 };
}
