"use server";

import { prisma } from "@/lib/prisma";
import { getCompatibleDonorGroups } from "@/lib/blood-compatibility";
import { ELIGIBILITY_DAYS } from "@/lib/eligibility";
import { ACTIVE_ALERT_STATUSES } from "@/lib/constants";
import { getVerifiedDonorIds } from "./screening";
import {
	INITIAL_RADIUS,
	MAX_ALERTS_PER_REQUEST,
	nextRadius,
	canExpand,
} from "@/lib/radius-expansion";
import type { DonorAlertWithRequest } from "@/lib/donor-types";
import { sendEmergencyAlertEmail } from "./notification";
import { scoreDonorProximity } from "./location";

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
	hospitalId: string,
): Promise<{
	donors: {
		id: string;
		location: string | null;
		locationId: string | null;
		name: string;
		score: number;
	}[];
	hospitalLocation: {
		location: string | null;
		locationId: string | null;
		name: string | null;
	} | null;
}> {
	const compatibleGroups = getCompatibleDonorGroups(bloodGroup);
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - ELIGIBILITY_DAYS);

	const verifiedDonorIds = await getVerifiedDonorIds();

	const [matchedDonors, requestLocation] = await Promise.all([
		prisma.user.findMany({
			where: {
				role: "donor",
				isActive: true,
				bloodGroup: { in: compatibleGroups as any },
				id: { in: verifiedDonorIds },
				OR: [
					{ lastDonationDate: null },
					{ lastDonationDate: { lt: cutoffDate } },
				],
			},
			select: { id: true, location: true, locationId: true, name: true },
		}),
		prisma.user.findUnique({
			where: { id: hospitalId },
			select: { location: true, locationId: true, name: true },
		}),
	]);

	const scored = await Promise.all(
		matchedDonors.map(async (donor) => {
			const score = await scoreDonorProximity(
				donor.locationId,
				donor.location,
				requestLocation?.locationId ?? null,
				requestLocation?.location ?? null,
			);
			return { ...donor, score };
		}),
	);

	scored.sort((a, b) => b.score - a.score);

	return { donors: scored, hospitalLocation: requestLocation };
}

export async function createEmergencyRequest(data: {
	hospitalId: string;
	bloodGroup: string;
	unitsNeeded: number;
	urgencyLevel: "standard" | "critical";
	searchRadius?: number;
}) {
	const request = await prisma.emergencyRequest.create({
		data: {
			hospitalId: data.hospitalId,
			bloodGroup: data.bloodGroup as any,
			unitsNeeded: data.unitsNeeded,
			urgencyLevel: data.urgencyLevel as any,
			searchRadius: data.searchRadius ?? INITIAL_RADIUS,
			status: "pending",
		},
	});

	const { donors: scored, hospitalLocation } = await matchDonors(
		data.bloodGroup,
		data.hospitalId,
	);

	if (scored.length > 0) {
		await prisma.emergencyAlert.createMany({
			data: scored.map((donor) => ({
				requestId: request.id,
				donorId: donor.id,
				status: "alerted",
			})),
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
				hospital: {
					select: { id: true, name: true, location: true },
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

	const [alerts, total] = await Promise.all([
		prisma.emergencyAlert.findMany({
			where: { donorId },
			include: {
				request: {
					include: {
						hospital: {
							select: { id: true, name: true, location: true },
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
	};
}

export async function getEmergencyRequestsForHospital(
	hospitalId: string,
	filters?: { page?: number; pageSize?: number },
) {
	const page = filters?.page ?? 1;
	const pageSize = filters?.pageSize ?? 10;

	const [requests, total] = await Promise.all([
		prisma.emergencyRequest.findMany({
			where: { hospitalId },
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
		prisma.emergencyRequest.count({ where: { hospitalId } }),
	]);
	return {
		requests,
		total,
		page,
		pageSize,
		totalPages: Math.ceil(total / pageSize),
	};
}

export async function getPendingEmergencyRequestsForHospital(
	hospitalId: string,
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
				hospitalId,
				status: { in: ["pending", "matched"] },
			},
			include: {
				hospital: {
					select: { id: true, name: true, location: true },
				},
				alerts: {
					select: {
						id: true,
						donorId: true,
						status: true,
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
				hospitalId,
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
		include: {
			hospital: { select: { id: true, location: true, name: true } },
			alerts: {
				select: { id: true, donorId: true, status: true },
			},
		},
	});

	if (!request) {
		throw new Error("Emergency request not found");
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

	const { donors: potential } = await matchDonors(
		request.bloodGroup,
		request.hospital.id,
	);

	const filteredNewDonors = potential
		.filter((donor) => !alreadyAlertedIds.includes(donor.id))
		.filter((donor) => {
			if (donor.score === 0) {
				const donorArea = (donor.location ?? "").toLowerCase();
				const hospitalArea = (
					request.hospital.location ?? ""
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
			hospital: {
				select: { id: true, name: true, location: true },
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
	hospitalId: string,
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
		hospitalId,
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

export async function respondToAlert(
	alertId: string,
	status: "accepted" | "declined",
) {
	const existing = await prisma.emergencyAlert.findUnique({
		where: { id: alertId },
	});

	if (!existing) {
		throw new Error("Alert not found");
	}

	const allowed = VALID_RESPOND_TRANSITIONS[existing.status];
	if (!allowed || !allowed.includes(status)) {
		throw new Error(
			`Cannot transition from "${existing.status}" to "${status}". Allowed: ${(allowed ?? []).join(", ") || "none"}`,
		);
	}

	const alert = await prisma.emergencyAlert.update({
		where: { id: alertId },
		data: {
			status,
			respondedAt: new Date(),
		},
	});

	if (status === "accepted") {
		const allAlerts = await prisma.emergencyAlert.findMany({
			where: { requestId: alert.requestId },
		});
		const hasAccepted = allAlerts.some((a) =>
			(ACTIVE_ALERT_STATUSES as readonly string[]).includes(a.status),
		);
		if (hasAccepted) {
			await prisma.emergencyRequest.update({
				where: { id: alert.requestId },
				data: { status: "matched" },
			});
		}
	}

	return alert;
}

export async function updateAlertStatus(
	alertId: string,
	status: "en_route" | "arrived" | "completed",
) {
	const existing = await prisma.emergencyAlert.findUnique({
		where: { id: alertId },
	});

	if (!existing) {
		throw new Error("Alert not found");
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

	if (status === "completed") {
		await prisma.emergencyRequest.update({
			where: { id: alert.requestId },
			data: { status: "fulfilled" },
		});
	}

	return alert;
}

export async function confirmDonation(alertId: string) {
	const alert = await prisma.emergencyAlert.findUnique({
		where: { id: alertId },
		include: {
			request: {
				select: { id: true, unitsNeeded: true, bloodGroup: true, hospitalId: true },
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

	return prisma.$transaction(async (tx) => {
		const updatedAlert = await tx.emergencyAlert.update({
			where: { id: alertId },
			data: { status: "completed" },
		});

		await tx.user.update({
			where: { id: alert.donor.id },
			data: { lastDonationDate: new Date() },
		});

		await tx.wallet.upsert({
			where: { userId: alert.donor.id },
			create: {
				userId: alert.donor.id,
				points: 100,
				lifetimeDonations: 1,
			},
			update: {
				points: { increment: 100 },
				lifetimeDonations: { increment: 1 },
			},
		});

		const hospitalBank = await tx.hospitalBank.findFirst({
			where: { managedById: alert.request.hospitalId },
			select: { id: true },
		});

		await tx.donation.create({
			data: {
				donorId: alert.donor.id,
				hospitalBankId: hospitalBank?.id,
				emergencyRequestId: alert.requestId,
				bloodGroup: alert.request.bloodGroup,
			},
		});

		// Re-test accompanying this donation. Opening a fresh `pending` row here
		// does not affect the donor's derived verification status -- that always
		// reads the latest *resolved* screening (see servers/screening.ts), so a
		// prior "passed" result keeps them matchable while this one is pending.
		await tx.donorScreening.create({
			data: {
				donorId: alert.donor.id,
				hospitalId: alert.request.hospitalId,
				staffUserId: alert.request.hospitalId,
				status: "pending",
				screenedAt: new Date(),
			},
		});

		const completedCount = await tx.emergencyAlert.count({
			where: {
				requestId: alert.requestId,
				status: "completed",
			},
		});

		if (completedCount >= alert.request.unitsNeeded) {
			await tx.emergencyRequest.update({
				where: { id: alert.requestId },
				data: { status: "fulfilled" },
			});
		}

		return {
			success: true,
			donorName: alert.donor.name,
			requestId: alert.requestId,
			completedCount,
			unitsNeeded: alert.request.unitsNeeded,
		};
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
						hospital: {
							select: { name: true, location: true },
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
		hospitalName: a.request.hospital.name,
		hospitalLocation: a.request.hospital.location,
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
		select: { location: true, locationId: true },
	});

	const startOfMonth = new Date();
	startOfMonth.setDate(1);
	startOfMonth.setHours(0, 0, 0, 0);

	const baseWhere: Record<string, unknown> = {
		createdAt: { gte: startOfMonth },
	};

	if (user?.locationId) {
		const state = await prisma.location.findUnique({
			where: { id: user.locationId },
			select: { parentId: true },
		});
		const stateId = state?.parentId;

		baseWhere.hospital = {
			locationRel: stateId
				? { parentId: stateId }
				: { id: user.locationId },
		};
	} else if (user?.location) {
		baseWhere.hospital = {
			location: { contains: user.location, mode: "insensitive" },
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
