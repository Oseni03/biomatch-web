"use server";

import { prisma } from "@/lib/prisma";
import { getCompatibleDonorGroups } from "@/lib/blood-compatibility";
import { ELIGIBILITY_DAYS } from "@/lib/eligibility";
import {
	EXPANSION_INCREMENT,
	MAX_RADIUS,
	MAX_ALERTS_PER_REQUEST,
	nextRadius,
	canExpand,
} from "@/lib/radius-expansion";
import type { DonorAlertWithRequest } from "@/lib/donor-types";

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
			searchRadius: data.searchRadius ?? 15,
			status: "pending",
		},
	});

	const compatibleGroups = getCompatibleDonorGroups(data.bloodGroup);
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - ELIGIBILITY_DAYS);

	const matchedDonors = await prisma.user.findMany({
		where: {
			role: "donor",
			isActive: true,
			bloodGroup: { in: compatibleGroups as any },
			OR: [
				{ lastDonationDate: null },
				{ lastDonationDate: { lt: cutoffDate } },
			],
		},
		select: { id: true, location: true, name: true },
	});

	const requestLocation = await prisma.user.findUnique({
		where: { id: data.hospitalId },
		select: { location: true, name: true },
	});

	const hospitalArea = requestLocation?.location ?? "";
	const hospitalAreaNormalized = hospitalArea.toLowerCase();

	const scored = matchedDonors.map((donor) => {
		const donorArea = (donor.location ?? "").toLowerCase();
		let score = 0;
		if (donorArea === hospitalAreaNormalized) {
			score = 2;
		} else if (
			donorArea &&
			hospitalAreaNormalized &&
			(donorArea.includes(hospitalAreaNormalized) ||
				hospitalAreaNormalized.includes(donorArea))
		) {
			score = 1;
		}
		return { ...donor, score };
	});

	scored.sort((a, b) => b.score - a.score);

	if (scored.length > 0) {
		await prisma.emergencyAlert.createMany({
			data: scored.map((donor) => ({
				requestId: request.id,
				donorId: donor.id,
				status: "alerted",
			})),
		});
	}

	return {
		request,
		matchedDonorCount: scored.length,
		hospitalName: requestLocation?.name ?? "Unknown",
	};
}

export async function getActiveEmergencyRequests() {
	return prisma.emergencyRequest.findMany({
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
	});
}

export async function getAlertsForDonor(
	donorId: string,
): Promise<DonorAlertWithRequest[]> {
	return prisma.emergencyAlert.findMany({
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
	});
}

export async function getEmergencyRequestsForHospital(hospitalId: string) {
	return prisma.emergencyRequest.findMany({
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
	});
}

export async function getPendingEmergencyRequestsForHospital(hospitalId: string) {
	return prisma.emergencyRequest.findMany({
		where: {
			hospitalId,
			status: { in: ["pending", "matched"] },
		},
		include: {
			alerts: {
				select: {
					id: true,
					donorId: true,
					status: true,
					donor: {
						select: { id: true, name: true, location: true, bloodGroup: true },
					},
				},
			},
		},
		orderBy: { createdAt: "desc" },
	});
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

	const hasAccepted = request.alerts.some(
		(a) =>
			a.status === "accepted" ||
			a.status === "en_route" ||
			a.status === "arrived" ||
			a.status === "completed",
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

	const compatibleGroups = getCompatibleDonorGroups(request.bloodGroup);
	const hospitalLocation = (request.hospital.location ?? "").toLowerCase();
	const hospitalLocationNormalized = hospitalLocation.toLowerCase();

	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - ELIGIBILITY_DAYS);

	const potentialDonors = await prisma.user.findMany({
		where: {
			role: "donor",
			isActive: true,
			bloodGroup: { in: compatibleGroups as any },
			id: { notIn: alreadyAlertedIds },
			OR: [
				{ lastDonationDate: null },
				{ lastDonationDate: { lt: cutoffDate } },
			],
		},
		select: { id: true, location: true, name: true },
	});

	const newDonors = potentialDonors.filter((donor) => {
		const donorArea = (donor.location ?? "").toLowerCase();
		if (!donorArea) return false;

		if (request.searchRadius <= 5) {
			return donorArea === hospitalLocationNormalized;
		}
		if (request.searchRadius <= 15) {
			return (
				donorArea.includes(hospitalLocationNormalized) ||
				hospitalLocationNormalized.includes(donorArea)
			);
		}
		return true;
	});

	if (newDonors.length > 0) {
		await prisma.emergencyAlert.createMany({
			data: newDonors.map((donor) => ({
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
		newDonorsAdded: newDonors.length,
		totalDonors: request.alerts.length + newDonors.length,
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

	const aggregates = {
		alerted: request.alerts.filter((a) => a.status === "alerted").length,
		opened: request.alerts.filter((a) => a.status === "opened").length,
		accepted: request.alerts.filter((a) => a.status === "accepted").length,
		declined: request.alerts.filter((a) => a.status === "declined").length,
		en_route: request.alerts.filter((a) => a.status === "en_route").length,
		arrived: request.alerts.filter((a) => a.status === "arrived").length,
		completed: request.alerts.filter((a) => a.status === "completed").length,
	};

	return { ...request, aggregates };
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
			...(where.createdAt as Record<string, unknown> ?? {}),
			gte: new Date(filters.dateFrom),
		};
	}
	if (filters?.dateTo) {
		where.createdAt = {
			...(where.createdAt as Record<string, unknown> ?? {}),
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

	const requestsWithAggregates = requests.map((req) => {
		const aggregates = {
			alerted: req.alerts.filter((a) => a.status === "alerted").length,
			opened: req.alerts.filter((a) => a.status === "opened").length,
			accepted: req.alerts.filter((a) => a.status === "accepted").length,
			declined: req.alerts.filter((a) => a.status === "declined").length,
			en_route: req.alerts.filter((a) => a.status === "en_route").length,
			arrived: req.alerts.filter((a) => a.status === "arrived").length,
			completed: req.alerts.filter((a) => a.status === "completed").length,
		};
		return { ...req, aggregates };
	});

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
		const hasAccepted = allAlerts.some(
			(a) =>
				a.status === "accepted" ||
				a.status === "en_route" ||
				a.status === "arrived" ||
				a.status === "completed",
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
