"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@generated/prisma/client";
import { auth } from "@/lib/auth";
import { getCompatibleDonorGroups } from "@/lib/blood-compatibility";
import { getEligibilityCutoffDate } from "@/lib/eligibility";
import {
	ACTIVE_ALERT_STATUSES,
	POINTS_PER_DONATION,
} from "@/lib/constants";
import {
	INITIAL_RADIUS,
	MAX_ALERTS_PER_REQUEST,
	nextRadius,
	canExpand,
} from "@/lib/radius-expansion";
import type { DonorAlertWithRequest } from "@/lib/donor-types";
import { sendEmergencyAlertEmail } from "./notification";
import { scoreDonorProximity } from "./location";
import { authorizeOrgAction, getOrganizationOwnerUserId } from "./organization";

function computeAlertAggregates(alerts: { status: string }[]) {
	return {
		alerted: alerts.filter((a) => a.status === "alerted").length,
		accepted: alerts.filter((a) => a.status === "accepted").length,
		declined: alerts.filter((a) => a.status === "declined").length,
		en_route: alerts.filter((a) => a.status === "en_route").length,
		arrived: alerts.filter((a) => a.status === "arrived").length,
		completed: alerts.filter((a) => a.status === "completed").length,
	};
}

export async function markAlertOpened(alertId: string) {
	const existing = await prisma.emergencyAlert.findUnique({
		where: { id: alertId },
		select: { openedAt: true },
	});

	if (!existing) {
		throw new Error("Alert not found");
	}

	if (existing.openedAt) {
		return;
	}

	await prisma.emergencyAlert.update({
		where: { id: alertId },
		data: { openedAt: new Date() },
	});
}

async function applyDonationRewards(userId: string) {
	await prisma.wallet.upsert({
		where: { userId },
		create: {
			userId,
			points: 100,
			lifetimeDonations: 1,
		},
		update: {
			points: { increment: 100 },
			lifetimeDonations: { increment: 1 },
		},
	});
}

async function matchDonors(
	bloodGroup: string,
	organizationId: string,
): Promise<{
	donors: {
		id: string;
		location: string | null;
		name: string;
		score: number;
	}[];
	hospitalLocation: {
		location: string | null;
		latitude: number | null;
		longitude: number | null;
		name: string | null;
	} | null;
}> {
	const compatibleGroups = getCompatibleDonorGroups(bloodGroup);
	const now = new Date();
	const cutoffDate = getEligibilityCutoffDate(now);

	const ownerUserId = await getOrganizationOwnerUserId(organizationId);

	const [matchedDonors, requestLocation] = await Promise.all([
		prisma.user.findMany({
			where: {
				role: "donor",
				isActive: true,
				bloodGroup: { in: compatibleGroups as any },
				blacklistedAt: null,
				AND: [
					{
						OR: [
							{ lastDonationDate: null },
							{ lastDonationDate: { lt: cutoffDate } },
						],
					},
					{
						OR: [
							{ deferredUntil: null },
							{ deferredUntil: { lt: now } },
						],
					},
				],
			},
			select: { id: true, location: true, latitude: true, longitude: true, name: true },
		}),
		prisma.user.findUnique({
			where: { id: ownerUserId },
			select: { location: true, latitude: true, longitude: true, name: true },
		}),
	]);

	const scored = await Promise.all(
		matchedDonors.map(async (donor) => {
			const score = await scoreDonorProximity(
				donor.latitude,
				donor.longitude,
				requestLocation?.latitude ?? null,
				requestLocation?.longitude ?? null,
			);
			return { ...donor, score };
		}),
	);

	scored.sort((a, b) => b.score - a.score);

	return { donors: scored, hospitalLocation: requestLocation };
}

export async function createEmergencyRequest(data: {
	organizationId: string;
	bloodGroup: string;
	unitsNeeded: number;
	urgencyLevel: "standard" | "critical";
	searchRadius?: number;
}) {
	const ownerUserId = await getOrganizationOwnerUserId(data.organizationId);

	const request = await prisma.emergencyRequest.create({
		data: {
			organizationId: data.organizationId,
			bloodGroup: data.bloodGroup as any,
			unitsNeeded: data.unitsNeeded,
			urgencyLevel: data.urgencyLevel as any,
			searchRadius: data.searchRadius ?? INITIAL_RADIUS,
			status: "pending",
		},
	});

	const { donors: scored, hospitalLocation } = await matchDonors(
		data.bloodGroup,
		data.organizationId,
	);

	if (scored.length > 0) {
		await prisma.emergencyAlert.createMany({
			data: scored.map((donor) => ({
				requestId: request.id,
				donorId: donor.id,
				status: "alerted",
			})),
			skipDuplicates: true,
		});

		const createdAlerts = await prisma.emergencyAlert.findMany({
			where: { requestId: request.id },
			select: { id: true },
		});

		Promise.allSettled(
			createdAlerts.map((a) => sendEmergencyAlertEmail(a.id)),
		).then((results) => {
			const failed = results.filter(
				(r) => r.status === "rejected",
			).length;
			if (failed > 0) {
				console.error(
					`${failed}/${createdAlerts.length} notification emails failed for request ${request.id}`,
				);
			}
		});
	}

	return {
		request,
		matchedDonorCount: scored.length,
		hospitalName: hospitalLocation?.name ?? "Unknown",
	};
}

export async function getActiveEmergencyRequests(filters?: {
	page?: number;
	pageSize?: number;
}) {
	const page = filters?.page ?? 1;
	const pageSize = filters?.pageSize ?? 10;

	const [requests, total] = await Promise.all([
		prisma.emergencyRequest.findMany({
			where: {
				status: { in: ["pending", "matched"] },
			},
			include: {
				organization: {
					select: {
						id: true,
						name: true,
						hospitalBanks: { select: { location: true }, take: 1 },
					},
				},
				alerts: {
					select: { id: true, donorId: true, status: true },
				},
			},
			orderBy: [{ urgencyLevel: "desc" }, { createdAt: "desc" }],
			skip: (page - 1) * pageSize,
			take: pageSize,
		}),
		prisma.emergencyRequest.count({
			where: { status: { in: ["pending", "matched"] } },
		}),
	]);
	return {
		requests,
		total,
		page,
		pageSize,
		totalPages: Math.ceil(total / pageSize),
	};
}

export async function getAlertsForDonor(
	donorId: string,
	filters?: { page?: number; pageSize?: number },
): Promise<DonorAlertWithRequest> {
	const page = filters?.page ?? 1;
	const pageSize = filters?.pageSize ?? 10;

	const donor = await prisma.user.findUnique({
		where: { id: donorId },
		select: { blacklistedAt: true },
	});

	if (donor?.blacklistedAt) {
		return {
			alerts: [],
			total: 0,
			page,
			pageSize,
			totalPages: 0,
			blacklisted: true,
		};
	}

	const [alerts, total] = await Promise.all([
		prisma.emergencyAlert.findMany({
			where: { donorId },
			include: {
				request: {
					include: {
						organization: {
							select: {
								id: true,
								name: true,
								hospitalBanks: { select: { location: true }, take: 1 },
							},
						},
					},
				},
			},
			orderBy: { createdAt: "desc" },
			skip: (page - 1) * pageSize,
			take: pageSize,
		}),
		prisma.emergencyAlert.count({ where: { donorId } }),
	]);

	return {
		alerts,
		total,
		page,
		pageSize,
		totalPages: Math.ceil(total / pageSize),
		blacklisted: false,
	};
}

export async function getCompatibleEmergencyRequests(
	donorId: string,
	filters?: { page?: number; pageSize?: number },
) {
	const page = filters?.page ?? 1;
	const pageSize = filters?.pageSize ?? 10;

	const donor = await prisma.user.findUnique({
		where: { id: donorId },
		select: {
			bloodGroup: true,
			blacklistedAt: true,
			lastDonationDate: true,
			deferredUntil: true,
			isActive: true,
		},
	});

	if (!donor || donor.blacklistedAt) {
		return {
			requests: [],
			total: 0,
			page,
			pageSize,
			totalPages: 0,
			blacklisted: true,
		};
	}

	const now = new Date();
	const cutoffDate = getEligibilityCutoffDate(now);
	const eligible =
		donor.isActive &&
		(!donor.lastDonationDate || donor.lastDonationDate < cutoffDate) &&
		(!donor.deferredUntil || donor.deferredUntil < now);

	if (!eligible) {
		return {
			requests: [],
			total: 0,
			page,
			pageSize,
			totalPages: 0,
			blacklisted: false,
			eligible: false,
		};
	}

	const compatibleGroups = getCompatibleDonorGroups(donor.bloodGroup!);

	const [requests, total] = await Promise.all([
		prisma.emergencyRequest.findMany({
			where: {
				status: { in: ["pending", "matched"] },
				bloodGroup: { in: compatibleGroups as any },
			},
			include: {
				organization: {
					select: {
						id: true,
						name: true,
						hospitalBanks: { select: { location: true }, take: 1 },
					},
				},
			},
			orderBy: [{ urgencyLevel: "desc" }, { createdAt: "desc" }],
			skip: (page - 1) * pageSize,
			take: pageSize,
		}),
		prisma.emergencyRequest.count({
			where: {
				status: { in: ["pending", "matched"] },
				bloodGroup: { in: compatibleGroups as any },
			},
		}),
	]);

	const requestIds = requests.map((r) => r.id);
	const existingAlerts =
		requestIds.length > 0
			? await prisma.emergencyAlert.findMany({
					where: {
						requestId: { in: requestIds },
						donorId,
					},
					select: {
						requestId: true,
						status: true,
						donorConfirmedAt: true,
						hospitalConfirmedAt: true,
						id: true,
					},
				})
			: [];

	const alertMap = new Map(existingAlerts.map((a) => [a.requestId, a]));

	const missingRequestIds = requests
		.filter((r) => !alertMap.has(r.id))
		.map((r) => r.id);

	if (missingRequestIds.length > 0) {
		await prisma.emergencyAlert.createMany({
			data: missingRequestIds.map((requestId) => ({
				requestId,
				donorId,
				status: "alerted",
			})),
			skipDuplicates: true,
		});

		const createdAlerts = await prisma.emergencyAlert.findMany({
			where: {
				requestId: { in: missingRequestIds },
				donorId,
			},
			select: {
				requestId: true,
				status: true,
				donorConfirmedAt: true,
				hospitalConfirmedAt: true,
				id: true,
			},
		});

		for (const a of createdAlerts) {
			alertMap.set(a.requestId, a);
		}
	}

	const mapped = requests.map((r) => {
		const alert = alertMap.get(r.id);
		return {
			id: alert?.id ?? r.id,
			requestId: r.id,
			hospitalName: r.organization?.name ?? "Unknown",
			location: r.organization?.hospitalBanks[0]?.location ?? "Unknown",
			bloodType: r.bloodGroup,
			requiredPints: r.unitsNeeded,
			urgency: r.urgencyLevel === "critical" ? "critical" : "high",
			timestamp: r.createdAt.toISOString(),
			alertStatus: alert?.status ?? null,
			donorConfirmedAt: alert?.donorConfirmedAt
				? alert.donorConfirmedAt.toISOString()
				: null,
			status: r.status,
		};
	});

	return {
		requests: mapped,
		total,
		page,
		pageSize,
		totalPages: Math.ceil(total / pageSize),
		blacklisted: false,
		eligible,
	};
}

export async function getEmergencyRequestsForOrganization(
	organizationId: string,
	filters?: { page?: number; pageSize?: number },
) {
	const page = filters?.page ?? 1;
	const pageSize = filters?.pageSize ?? 10;

	const [requests, total] = await Promise.all([
		prisma.emergencyRequest.findMany({
			where: { organizationId },
			include: {
				alerts: {
					include: {
						donor: {
							select: {
								id: true,
								name: true,
								bloodGroup: true,
								location: true,
							},
						},
					},
				},
			},
			orderBy: { createdAt: "desc" },
			skip: (page - 1) * pageSize,
			take: pageSize,
		}),
		prisma.emergencyRequest.count({ where: { organizationId } }),
	]);
	return {
		requests,
		total,
		page,
		pageSize,
		totalPages: Math.ceil(total / pageSize),
	};
}

export async function getPendingEmergencyRequestsForOrganization(
	organizationId: string,
	filters?: {
		page?: number;
		pageSize?: number;
	},
) {
	const page = filters?.page ?? 1;
	const pageSize = filters?.pageSize ?? 10;

	const [requests, total] = await Promise.all([
		prisma.emergencyRequest.findMany({
			where: {
				organizationId,
				status: { in: ["pending", "matched"] },
			},
			include: {
				organization: {
					select: {
						id: true,
						name: true,
						hospitalBanks: { select: { location: true }, take: 1 },
					},
				},
				alerts: {
					select: {
						id: true,
						donorId: true,
						status: true,
							donorConfirmedAt: true,
							hospitalConfirmedAt: true,
						updatedAt: true,
						donor: {
							select: {
								id: true,
								name: true,
								location: true,
								bloodGroup: true,
							},
						},
					},
					orderBy: { updatedAt: "desc" },
				},
			},
			orderBy: { createdAt: "desc" },
			skip: (page - 1) * pageSize,
			take: pageSize,
		}),
		prisma.emergencyRequest.count({
			where: {
				organizationId,
				status: { in: ["pending", "matched"] },
			},
		}),
	]);
	const requestsWithAggregates = requests.map((req) => ({
		...req,
		aggregates: computeAlertAggregates(req.alerts),
	}));
	return {
		requests: requestsWithAggregates,
		total,
		page,
		pageSize,
		totalPages: Math.ceil(total / pageSize),
	};
}

export async function expandSearchRadius(requestId: string) {
	const request = await prisma.emergencyRequest.findUnique({
		where: { id: requestId },
		select: {
			id: true,
			bloodGroup: true,
			searchRadius: true,
			organizationId: true,
			alerts: {
				select: { id: true, donorId: true, status: true },
			},
		},
	});

	if (!request) {
		throw new Error("Emergency request not found");
	}

	if (!request.organizationId) {
		throw new Error("Emergency request has no organization");
	}

	if (!canExpand(request.searchRadius)) {
		return {
			expanded: false,
			reason: "max_radius_reached",
			searchRadius: request.searchRadius,
			newDonorsAdded: 0,
			totalDonors: request.alerts.length,
		};
	}

	const hasAccepted = request.alerts.some((a) =>
		(ACTIVE_ALERT_STATUSES as readonly string[]).includes(a.status),
	);

	if (hasAccepted) {
		return {
			expanded: false,
			reason: "donor_accepted",
			searchRadius: request.searchRadius,
			newDonorsAdded: 0,
			totalDonors: request.alerts.length,
		};
	}

	if (request.alerts.length >= MAX_ALERTS_PER_REQUEST) {
		return {
			expanded: false,
			reason: "max_alerts_reached",
			searchRadius: request.searchRadius,
			newDonorsAdded: 0,
			totalDonors: request.alerts.length,
		};
	}

	const newRadius = nextRadius(request.searchRadius);
	const alreadyAlertedIds = request.alerts.map((a) => a.donorId);

	const { donors: potential, hospitalLocation } = await matchDonors(
		request.bloodGroup,
		request.organizationId,
	);

	const filteredNewDonors = potential
		.filter((donor) => !alreadyAlertedIds.includes(donor.id))
		.filter((donor) => {
			if (donor.score === 0) {
				const donorArea = (donor.location ?? "").toLowerCase();
				const hospitalArea = (
					hospitalLocation?.location ?? ""
				).toLowerCase();
				if (!donorArea) return false;
				if (request.searchRadius <= 5)
					return donorArea === hospitalArea;
				if (request.searchRadius <= 15)
					return (
						donorArea.includes(hospitalArea) ||
						hospitalArea.includes(donorArea)
					);
				return true;
			}
			const radiusThreshold =
				request.searchRadius <= 5
					? 3
					: request.searchRadius <= 15
						? 2
						: 1;
			return donor.score >= radiusThreshold;
		});

	if (filteredNewDonors.length > 0) {
		await prisma.emergencyAlert.createMany({
			data: filteredNewDonors.map((donor) => ({
				requestId: request.id,
				donorId: donor.id,
				status: "alerted",
			})),
			skipDuplicates: true,
		});
	}

	await prisma.emergencyRequest.update({
		where: { id: requestId },
		data: { searchRadius: newRadius },
	});

	return {
		expanded: true,
		reason: "expanded",
		searchRadius: newRadius,
		newDonorsAdded: filteredNewDonors.length,
		totalDonors: request.alerts.length + filteredNewDonors.length,
	};
}

export async function getEmergencyRequestStatus(requestId: string) {
	const request = await prisma.emergencyRequest.findUnique({
		where: { id: requestId },
		include: {
			organization: {
				select: {
					id: true,
					name: true,
					hospitalBanks: { select: { location: true }, take: 1 },
				},
			},
			alerts: {
				include: {
					donor: {
						select: {
							id: true,
							name: true,
							bloodGroup: true,
							location: true,
						},
					},
				},
				orderBy: { updatedAt: "desc" },
			},
		},
	});

	if (!request) {
		throw new Error("Emergency request not found");
	}

	return { ...request, aggregates: computeAlertAggregates(request.alerts) };
}

export async function getEmergencyHistory(
	organizationId: string,
	filters?: {
		dateFrom?: string;
		dateTo?: string;
		bloodGroup?: string;
		status?: string;
		page?: number;
		pageSize?: number;
	},
) {
	const page = filters?.page ?? 1;
	const pageSize = filters?.pageSize ?? 10;

	const where: Record<string, unknown> = {
		organizationId,
		status: { in: ["fulfilled", "expired", "cancelled"] },
	};

	if (filters?.dateFrom) {
		where.createdAt = {
			...((where.createdAt as Record<string, unknown>) ?? {}),
			gte: new Date(filters.dateFrom),
		};
	}
	if (filters?.dateTo) {
		where.createdAt = {
			...((where.createdAt as Record<string, unknown>) ?? {}),
			lte: new Date(filters.dateTo),
		};
	}
	if (filters?.bloodGroup) {
		where.bloodGroup = filters.bloodGroup;
	}
	if (filters?.status) {
		where.status = filters.status;
	}

	const [requests, total] = await Promise.all([
		prisma.emergencyRequest.findMany({
			where: where as any,
			include: {
				alerts: {
					include: {
						donor: {
							select: { id: true, name: true, bloodGroup: true },
						},
					},
					orderBy: { updatedAt: "desc" },
				},
			},
			orderBy: { createdAt: "desc" },
			skip: (page - 1) * pageSize,
			take: pageSize,
		}),
		prisma.emergencyRequest.count({ where: where as any }),
	]);

	const requestsWithAggregates = requests.map((req) => ({
		...req,
		aggregates: computeAlertAggregates(req.alerts),
	}));

	return {
		requests: requestsWithAggregates,
		total,
		page,
		pageSize,
		totalPages: Math.ceil(total / pageSize),
	};
}

const VALID_RESPOND_TRANSITIONS: Record<string, string[]> = {
	alerted: ["accepted", "declined"],
};

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
	accepted: ["en_route"],
	en_route: ["arrived"],
};

async function finalizeDonation(tx: Prisma.TransactionClient, alertId: string) {
	const alertRequest = await tx.emergencyAlert.findUnique({
		where: { id: alertId },
		select: { requestId: true },
	});
	if (!alertRequest) return { completed: false };

	await tx.$queryRaw(Prisma.sql`
		SELECT id FROM emergency_requests WHERE id = ${alertRequest.requestId}::uuid FOR UPDATE
	`);

	const alert = await tx.emergencyAlert.findUnique({
		where: { id: alertId },
		include: {
			request: { select: { unitsNeeded: true, bloodGroup: true } },
			donor: { select: { id: true, name: true } },
		},
	});

	if (!alert || !alert.donorConfirmedAt || !alert.hospitalConfirmedAt) {
		return { completed: false };
	}

	const completedCountBefore = await tx.emergencyAlert.count({
		where: { requestId: alert.requestId, status: "completed" },
	});
	if (completedCountBefore >= alert.request.unitsNeeded) {
		await tx.emergencyAlert.update({
			where: { id: alertId },
			data: {
				status: "declined",
				respondedAt: new Date(),
				responseReason: "Request fulfilled by other donors",
			},
		});
		return { completed: false, alreadyFulfilled: true };
	}

	const claimed = await tx.emergencyAlert.updateMany({
		where: {
			id: alertId,
			status: "arrived",
			donorConfirmedAt: { not: null },
			hospitalConfirmedAt: { not: null },
		},
		data: { status: "completed" },
	});

	if (claimed.count === 0) {
		return { completed: true, alreadyCompleted: true };
	}

	const donatedAt = new Date();
	await tx.user.update({
		where: { id: alert.donor.id },
		data: { lastDonationDate: donatedAt },
	});
	await tx.wallet.upsert({
		where: { userId: alert.donor.id },
		create: {
			userId: alert.donor.id,
			points: POINTS_PER_DONATION,
			lifetimeDonations: 1,
		},
		update: {
			points: { increment: POINTS_PER_DONATION },
			lifetimeDonations: { increment: 1 },
		},
	});
	await tx.donation.create({
		data: {
			donorId: alert.donor.id,
			emergencyRequestId: alert.requestId,
			bloodGroup: alert.request.bloodGroup,
			donatedAt,
		},
	});

	const completedCount = await tx.emergencyAlert.count({
		where: { requestId: alert.requestId, status: "completed" },
	});

	if (completedCount >= alert.request.unitsNeeded) {
		await tx.emergencyRequest.update({
			where: { id: alert.requestId },
			data: { status: "fulfilled" },
		});
		await tx.emergencyAlert.updateMany({
			where: { requestId: alert.requestId, status: "alerted" },
			data: {
				status: "declined",
				respondedAt: donatedAt,
				responseReason: "Request fulfilled by other donors",
			},
		});
	}

	return {
		completed: true,
		donorName: alert.donor.name,
		requestId: alert.requestId,
		completedCount,
		unitsNeeded: alert.request.unitsNeeded,
	};
}

export async function respondToAlert(
	alertId: string,
	status: "accepted" | "declined",
	donorId?: string,
) {
	const existing = await prisma.emergencyAlert.findUnique({
		where: { id: alertId },
		include: { request: { select: { status: true } } },
	});

	if (!existing) {
		throw new Error("Alert not found");
	}

	if (donorId && existing.donorId !== donorId) {
		throw new Error("Not authorized to respond to this alert");
	}

	if (existing.request.status === "fulfilled") {
		throw new Error("This emergency request has already been fulfilled");
	}

	const allowed = VALID_RESPOND_TRANSITIONS[existing.status];
	if (!allowed || !allowed.includes(status)) {
		throw new Error(
			`Cannot transition from "${existing.status}" to "${status}". Allowed: ${(allowed ?? []).join(", ") || "none"}`,
		);
	}

	return prisma.$transaction(async (tx) => {
		await tx.$queryRaw(Prisma.sql`
			SELECT id FROM emergency_requests WHERE id = ${existing.requestId}::uuid FOR UPDATE
		`);
		const currentRequest = await tx.emergencyRequest.findUniqueOrThrow({
			where: { id: existing.requestId },
			select: { status: true },
		});
		if (currentRequest.status === "fulfilled") {
			throw new Error("This emergency request has already been fulfilled");
		}

		const updated = await tx.emergencyAlert.updateMany({
			where: { id: alertId, status: existing.status },
			data: {
				status,
				respondedAt: new Date(),
				responseReason: null,
			},
		});
		if (updated.count === 0) {
			throw new Error("Alert was already updated by another action");
		}

		if (status === "accepted") {
			await tx.user.update({
				where: { id: existing.donorId },
				data: { isActive: false },
			});
			await tx.emergencyRequest.update({
				where: { id: existing.requestId },
				data: { status: "matched" },
			});
		}

		return tx.emergencyAlert.findUniqueOrThrow({ where: { id: alertId } });
	});
}

export async function withdrawAlert(
	alertId: string,
	donorId: string,
	reason?: string,
) {
	const existing = await prisma.emergencyAlert.findUnique({
		where: { id: alertId },
	});

	if (!existing) {
		throw new Error("Alert not found");
	}

	if (existing.donorId !== donorId) {
		throw new Error("Not authorized to withdraw from this alert");
	}

	if (existing.donorConfirmedAt) {
		throw new Error(
			"Cannot withdraw after hospital confirmation has been recorded.",
		);
	}

	if (!["accepted", "en_route", "arrived"].includes(existing.status)) {
		throw new Error(
			`Cannot withdraw from alert status "${existing.status}".`,
		);
	}

	const alert = await prisma.emergencyAlert.update({
		where: { id: alertId },
		data: {
			status: "withdrawn",
			respondedAt: new Date(),
			responseReason:
				reason?.trim() && reason.trim().length > 0
					? reason.trim()
					: "No reason provided",
		},
	});

	await prisma.user.update({
		where: { id: donorId },
		data: { isActive: true },
	});

	const remainingActiveAlerts = await prisma.emergencyAlert.count({
		where: {
			requestId: alert.requestId,
			status: { in: [...ACTIVE_ALERT_STATUSES] },
		},
	});

	if (remainingActiveAlerts === 0) {
		await prisma.emergencyRequest.update({
			where: { id: alert.requestId },
			data: { status: "pending" },
		});
	}

	return alert;
}

export async function updateAlertStatus(
	alertId: string,
	status: "en_route" | "arrived",
	donorId?: string,
) {
	const existing = await prisma.emergencyAlert.findUnique({
		where: { id: alertId },
	});

	if (!existing) {
		throw new Error("Alert not found");
	}

	if (donorId && existing.donorId !== donorId) {
		throw new Error("Not authorized to update this alert");
	}

	const allowed = VALID_STATUS_TRANSITIONS[existing.status];
	if (!allowed || !allowed.includes(status)) {
		throw new Error(
			`Cannot transition from "${existing.status}" to "${status}". Allowed: ${(allowed ?? []).join(", ") || "none"}`,
		);
	}

	const alert = await prisma.emergencyAlert.update({
		where: { id: alertId },
		data: {
			status,
		},
	});

	return alert;
}

export async function confirmDonation(alertId: string, staffUserId: string) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (
		!session?.user ||
		session.user.role !== "hospital" ||
		session.user.id !== staffUserId
	) {
		throw new Error("Not authorized to confirm this donation");
	}

	const alert = await prisma.emergencyAlert.findUnique({
		where: { id: alertId },
		include: {
			request: {
				select: {
					id: true,
					unitsNeeded: true,
					bloodGroup: true,
					organizationId: true,
				},
			},
			donor: {
				select: { id: true, name: true },
			},
		},
	});

	if (!alert) {
		throw new Error("Alert not found");
	}

	if (alert.status !== "arrived") {
		throw new Error(
			`Cannot confirm donation: alert status is "${alert.status}". Donation can only be confirmed for donors who have arrived.`,
		);
	}

	if (!alert.request.organizationId) {
		throw new Error("Emergency request has no organization");
	}

	await authorizeOrgAction(alert.request.organizationId, staffUserId, {
		donation: ["confirm"],
	});

	return prisma.$transaction(async (tx) => {
		const updated = await tx.emergencyAlert.updateMany({
			where: {
				id: alertId,
				status: "arrived",
				hospitalConfirmedAt: null,
			},
			data: { hospitalConfirmedAt: new Date() },
		});

		if (updated.count === 0) {
			throw new Error("Donation has already been confirmed by the hospital");
		}

		return finalizeDonation(tx, alertId);
	});
}

export async function donorConfirmDonation(alertId: string, donorId: string) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (
		!session?.user ||
		session.user.role !== "donor" ||
		session.user.id !== donorId
	) {
		throw new Error("Not authorized to confirm this donation");
	}

	const alert = await prisma.emergencyAlert.findUnique({
		where: { id: alertId },
	});

	if (!alert) {
		throw new Error("Alert not found");
	}

	if (alert.donorId !== donorId) {
		throw new Error("Not authorized to confirm this alert");
	}

	if (alert.status !== "arrived") {
		throw new Error(
			`Cannot confirm donation: alert status is "${alert.status}". Donation can only be self-confirmed while arrived.`,
		);
	}

	return prisma.$transaction(async (tx) => {
		const updated = await tx.emergencyAlert.updateMany({
			where: {
				id: alertId,
				donorId,
				status: "arrived",
				donorConfirmedAt: null,
			},
			data: { donorConfirmedAt: new Date() },
		});

		if (updated.count === 0) {
			throw new Error("Donation has already been confirmed by the donor");
		}

		return finalizeDonation(tx, alertId);
	});
}

export async function getAlertsAwaitingConfirmation(organizationId: string) {
	return prisma.emergencyAlert.findMany({
		where: {
			status: "arrived",
			OR: [
				{ donorConfirmedAt: { not: null } },
				{ hospitalConfirmedAt: { not: null } },
			],
			request: { organizationId },
		},
		include: {
			donor: { select: { id: true, name: true, bloodGroup: true } },
			request: { select: { bloodGroup: true, unitsNeeded: true } },
		},
		orderBy: { donorConfirmedAt: "asc" },
	});
}

export async function getDonorHistory(userId: string, page = 1, pageSize = 10) {
	const skip = (page - 1) * pageSize;

	const [alerts, total] = await Promise.all([
		prisma.emergencyAlert.findMany({
			where: { donorId: userId, status: "completed" },
			include: {
				request: {
					select: {
						bloodGroup: true,
						unitsNeeded: true,
						createdAt: true,
						organization: {
							select: {
								name: true,
								hospitalBanks: { select: { location: true }, take: 1 },
							},
						},
					},
				},
			},
			orderBy: { updatedAt: "desc" },
			skip,
			take: pageSize,
		}),
		prisma.emergencyAlert.count({
			where: { donorId: userId, status: "completed" },
		}),
	]);

	const records = alerts.map((a) => ({
		id: a.id,
		date: a.updatedAt.toISOString().split("T")[0],
		hospitalName: a.request.organization?.name ?? "Unknown",
		hospitalLocation: a.request.organization?.hospitalBanks[0]?.location ?? null,
		bloodGroup: a.request.bloodGroup,
		unitsNeeded: a.request.unitsNeeded,
	}));

	return {
		records,
		total,
		page,
		pageSize,
		totalPages: Math.ceil(total / pageSize),
	};
}

export async function getLocalDemandStats(userId: string) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { location: true },
	});

	const startOfMonth = new Date();
	startOfMonth.setDate(1);
	startOfMonth.setHours(0, 0, 0, 0);

	const baseWhere: Record<string, unknown> = {
		createdAt: { gte: startOfMonth },
	};

	if (user?.location) {
		baseWhere.organization = {
			hospitalBanks: {
				some: {
					location: { contains: user.location, mode: "insensitive" },
				},
			},
		};
	}

	const [totalThisMonth, criticalThisMonth] = await Promise.all([
		prisma.emergencyRequest.count({ where: baseWhere as any }),
		prisma.emergencyRequest.count({
			where: { ...baseWhere, urgencyLevel: "critical" } as any,
		}),
	]);

	return {
		totalThisMonth,
		criticalThisMonth,
		location: user?.location ?? "Unknown",
	};
}
