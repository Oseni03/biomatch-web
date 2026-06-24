"use server";

import { prisma } from "@/lib/prisma";
import { getCompatibleDonorGroups } from "@/lib/blood-compatibility";
import { ELIGIBILITY_DAYS } from "@/lib/eligibility";
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

export async function respondToAlert(
	alertId: string,
	status: "accepted" | "declined",
) {
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
	const alert = await prisma.emergencyAlert.update({
		where: { id: alertId },
		data: {
			status,
			respondedAt: new Date(),
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
