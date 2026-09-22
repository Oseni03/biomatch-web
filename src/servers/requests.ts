"use server";

import { z } from "zod";
import { BloodGroup } from "@generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { formatBloodGroup } from "@/lib/blood-compatibility";
import {
	MATCH_ESCALATION_WINDOW_MINUTES,
	MATCH_START_RADIUS_KM,
} from "@/lib/config";
import { requireConsentsForUser } from "@/servers/consent";
import { requireApprovedHospital, requireOrgPermission } from "@/servers/organization";
import { findEligibleDonors } from "@/servers/matching";

const BLOOD_GROUP_KEYS = Object.keys(BloodGroup) as [string, ...string[]];

const createRequestSchema = z.object({
	bloodGroup: z.enum(BLOOD_GROUP_KEYS),
	unitsRequired: z.coerce.number().int().min(1).max(100),
	locationName: z.string().trim().min(1).max(200).optional(),
	latitude: z.coerce.number().min(-90).max(90).optional(),
	longitude: z.coerce.number().min(-180).max(180).optional(),
	internalReference: z.string().trim().max(120).optional(),
});

export interface CreatedBloodRequest {
	requestId: string;
	matchedDonorCount: number;
	hospitalName: string;
}

export interface NearbyRequest {
	matchId: string;
	requestId: string;
	bloodGroup: string;
	hospitalName: string;
	locationName: string;
	distanceKm: number;
	unitsRequired: number;
	notifiedAt: Date;
}

export interface NearbyRequestsResult {
	requests: NearbyRequest[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export interface InboxNotification {
	id: string;
	type: string;
	title: string;
	body: string;
	data: Record<string, string>;
	readAt: Date | null;
	createdAt: Date;
}

export interface InboxResult {
	notifications: InboxNotification[];
	unreadCount: number;
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export interface BloodRequestSummary {
	requestId: string;
	bloodGroup: string;
	unitsRequired: number;
	unitsAccepted: number;
	status: string;
	locationName: string;
	currentRadiusKm: number;
	createdAt: Date;
	notifiedCount: number;
	acceptedCount: number;
	declinedCount: number;
}

function donorSafeRequestWhere(donorId: string) {
	return {
		donorId,
		status: "notified" as const,
		request: { status: "active" as const },
	};
}

export async function createBloodRequest(
	organizationId: string,
	callerUserId: string,
	rawInput: unknown,
): Promise<CreatedBloodRequest> {
	await requireConsentsForUser(callerUserId);
	await requireApprovedHospital(organizationId);
	await requireOrgPermission(organizationId, callerUserId, {
		bloodRequest: ["create"],
	});
	const input = createRequestSchema.parse(rawInput);
	const organization = await prisma.organization.findUnique({
		where: { id: organizationId },
		select: { name: true, address: true, state: true, latitude: true, longitude: true },
	});
	if (!organization) {
		throw new Error("Hospital not found");
	}
	const outcome = await prisma.$transaction(async (tx) => {
		const request = await tx.bloodRequest.create({
			data: {
				organizationId,
				createdById: callerUserId,
				bloodGroup: input.bloodGroup as BloodGroup,
				unitsRequired: input.unitsRequired,
				locationName:
					input.locationName ?? `${organization.address}, ${organization.state}`,
				latitude: input.latitude ?? organization.latitude,
				longitude: input.longitude ?? organization.longitude,
				currentRadiusKm: MATCH_START_RADIUS_KM,
				nextEscalationAt: new Date(
					Date.now() + MATCH_ESCALATION_WINDOW_MINUTES * 60 * 1000,
				),
				internalReference: input.internalReference,
			},
			select: { id: true },
		});
		return request;
	});
	const matched = await matchDonorsForRequest(outcome.id, MATCH_START_RADIUS_KM, 0);
	return {
		requestId: outcome.id,
		matchedDonorCount: matched.matchedCount,
		hospitalName: organization.name,
	};
}

// Matches every newly eligible donor for a request and notifies them all at
// once with an in-app notification. Idempotent: donors already matched are
// excluded by the eligibility query, so re-running only adds new donors
// (radius escalation in slice 15 reuses this).
export async function matchDonorsForRequest(
	requestId: string,
	radiusKm: number,
	escalationLevel: number,
): Promise<{ matchedCount: number }> {
	const request = await prisma.bloodRequest.findUnique({
		where: { id: requestId },
		select: {
			id: true,
			status: true,
			bloodGroup: true,
			organization: { select: { name: true } },
		},
	});
	if (!request || request.status !== "active") {
		return { matchedCount: 0 };
	}
	const candidates = await findEligibleDonors(requestId, radiusKm);
	if (candidates.length === 0) {
		return { matchedCount: 0 };
	}
	const bloodDisplay = formatBloodGroup(String(request.bloodGroup));
	const hospitalName = request.organization.name;
	await prisma.$transaction(async (tx) => {
		await tx.requestMatch.createMany({
			data: candidates.map((candidate) => ({
				requestId,
				donorId: candidate.donorId,
				status: "notified" as const,
				distanceKm: candidate.distanceKm,
				escalationLevel,
			})),
			skipDuplicates: true,
		});
		const matches = await tx.requestMatch.findMany({
			where: { requestId, escalationLevel },
			select: { id: true, donorId: true },
		});
		const donorIds = new Set(candidates.map((candidate) => candidate.donorId));
		const fresh = matches.filter((match) => donorIds.has(match.donorId));
		if (fresh.length > 0) {
			const donors = await tx.user.findMany({
				where: { id: { in: fresh.map((match) => match.donorId) } },
				select: { id: true },
			});
			const donorSet = new Set(donors.map((donor) => donor.id));
			await tx.notification.createMany({
				data: fresh
					.filter((match) => donorSet.has(match.donorId))
					.map((match) => ({
						userId: match.donorId,
						type: "request.new_match",
						title: `Urgent: ${bloodDisplay} blood needed near you`,
						body: `${bloodDisplay} needed at ${hospitalName}. Open the app to respond.`,
						data: { requestId, matchId: match.id },
					})),
			});
		}
	});
	return { matchedCount: candidates.length };
}

export async function getRequestsNearby(
	donorUserId: string,
	filters?: { page?: number; pageSize?: number },
): Promise<NearbyRequestsResult> {
	await requireConsentsForUser(donorUserId);
	const page = Math.max(1, filters?.page ?? 1);
	const pageSize = Math.min(50, Math.max(1, filters?.pageSize ?? 10));
	const where = donorSafeRequestWhere(donorUserId);
	const [total, rows] = await Promise.all([
		prisma.requestMatch.count({ where }),
		prisma.requestMatch.findMany({
			where,
			orderBy: { notifiedAt: "desc" },
			skip: (page - 1) * pageSize,
			take: pageSize,
			select: {
				id: true,
				requestId: true,
				distanceKm: true,
				notifiedAt: true,
				request: {
					select: {
						bloodGroup: true,
						locationName: true,
						unitsRequired: true,
						organization: { select: { name: true } },
					},
				},
			},
		}),
	]);
	return {
		requests: rows.map((row) => ({
			matchId: row.id,
			requestId: row.requestId,
			bloodGroup: formatBloodGroup(String(row.request.bloodGroup)),
			hospitalName: row.request.organization.name,
			locationName: row.request.locationName,
			distanceKm: Number(row.distanceKm),
			unitsRequired: row.request.unitsRequired,
			notifiedAt: row.notifiedAt,
		})),
		total,
		page,
		pageSize,
		totalPages: Math.max(1, Math.ceil(total / pageSize)),
	};
}

export async function getNotificationInbox(
	donorUserId: string,
	filters?: { page?: number; pageSize?: number; unreadOnly?: boolean },
): Promise<InboxResult> {
	await requireConsentsForUser(donorUserId);
	const page = Math.max(1, filters?.page ?? 1);
	const pageSize = Math.min(50, Math.max(1, filters?.pageSize ?? 20));
	const where = {
		userId: donorUserId,
		...(filters?.unreadOnly ? { readAt: null } : {}),
	};
	const [total, unreadCount, rows] = await Promise.all([
		prisma.notification.count({ where }),
		prisma.notification.count({ where: { userId: donorUserId, readAt: null } }),
		prisma.notification.findMany({
			where,
			orderBy: { createdAt: "desc" },
			skip: (page - 1) * pageSize,
			take: pageSize,
			select: {
				id: true,
				type: true,
				title: true,
				body: true,
				data: true,
				readAt: true,
				createdAt: true,
			},
		}),
	]);
	return {
		notifications: rows.map((row) => ({
			id: row.id,
			type: row.type,
			title: row.title,
			body: row.body,
			data: (row.data ?? {}) as Record<string, string>,
			readAt: row.readAt,
			createdAt: row.createdAt,
		})),
		unreadCount,
		total,
		page,
		pageSize,
		totalPages: Math.max(1, Math.ceil(total / pageSize)),
	};
}

export async function markNotificationRead(
	notificationId: string,
	donorUserId: string,
): Promise<{ notificationId: string }> {
	await requireConsentsForUser(donorUserId);
	const notification = await prisma.notification.findUnique({
		where: { id: notificationId },
		select: { userId: true },
	});
	if (!notification || notification.userId !== donorUserId) {
		throw new Error("Notification not found");
	}
	await prisma.notification.update({
		where: { id: notificationId },
		data: { readAt: new Date() },
	});
	return { notificationId };
}

export async function getBloodRequestSummary(
	organizationId: string,
	callerUserId: string,
	requestId: string,
): Promise<BloodRequestSummary> {
	await requireConsentsForUser(callerUserId);
	await requireOrgPermission(organizationId, callerUserId, {
		bloodRequest: ["read"],
	});
	const request = await prisma.bloodRequest.findFirst({
		where: { id: requestId, organizationId },
		select: {
			id: true,
			bloodGroup: true,
			unitsRequired: true,
			unitsAccepted: true,
			status: true,
			locationName: true,
			currentRadiusKm: true,
			createdAt: true,
			_count: { select: { matches: true } },
			matches: { select: { status: true } },
		},
	});
	if (!request) {
		throw new Error("Blood request not found");
	}
	const countBy = (status: string) =>
		request.matches.filter((match) => String(match.status) === status).length;
	return {
		requestId: request.id,
		bloodGroup: formatBloodGroup(String(request.bloodGroup)),
		unitsRequired: request.unitsRequired,
		unitsAccepted: request.unitsAccepted,
		status: String(request.status),
		locationName: request.locationName,
		currentRadiusKm: Number(request.currentRadiusKm),
		createdAt: request.createdAt,
		notifiedCount: request._count.matches,
		acceptedCount: countBy("accepted"),
		declinedCount: countBy("declined"),
	};
}
