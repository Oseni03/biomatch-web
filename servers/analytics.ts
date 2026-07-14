"use server";

import { prisma } from "@/lib/prisma";

export async function getHospitalAnalytics(hospitalId: string) {
	const allRequests = await prisma.emergencyRequest.findMany({
		where: { hospitalId },
		include: {
			alerts: {
				select: {
					status: true,
					createdAt: true,
					respondedAt: true,
				},
			},
		},
		orderBy: { createdAt: "asc" },
	});

	const totalRequests = allRequests.length;
	const totalAlerts = allRequests.reduce(
		(sum, r) => sum + r.alerts.length,
		0,
	);
	const acceptedAlerts = allRequests.reduce(
		(sum, r) =>
			sum +
			r.alerts.filter((a) =>
				["accepted", "en_route", "arrived", "completed"].includes(
					a.status,
				),
			).length,
		0,
	);
	const fulfilledRequests = allRequests.filter(
		(r) => r.status === "fulfilled",
	).length;
	const responseTimes = allRequests.flatMap((r) =>
		r.alerts
			.filter(
				(a) =>
					a.respondedAt &&
					["accepted", "en_route", "arrived", "completed"].includes(
						a.status,
					),
			)
			.map((a) =>
				Math.round(
					(a.respondedAt!.getTime() - a.createdAt.getTime()) / 60000,
				),
			),
	);

	const avgResponseTime =
		responseTimes.length > 0
			? Math.round(
					responseTimes.reduce((s, t) => s + t, 0) /
						responseTimes.length,
				)
			: 0;

	const responseRate =
		totalAlerts > 0 ? Math.round((acceptedAlerts / totalAlerts) * 100) : 0;

	const monthlyVolume = allRequests.reduce(
		(acc, r) => {
			const month = r.createdAt.toISOString().slice(0, 7);
			acc[month] = (acc[month] ?? 0) + 1;
			return acc;
		},
		{} as Record<string, number>,
	);

	const coverageGaps: Record<string, number> = {};
	for (const r of allRequests) {
		if (r.status !== "fulfilled") {
			const bg =
				typeof r.bloodGroup === "string" ? r.bloodGroup : "unknown";
			coverageGaps[bg] = (coverageGaps[bg] ?? 0) + 1;
		}
	}

	return {
		avgResponseTime,
		responseRate,
		fulfilledRequests,
		totalRequests,
		monthlyVolume: Object.entries(monthlyVolume).map(([month, count]) => ({
			month,
			count,
		})),
		coverageGaps: Object.entries(coverageGaps).map(([group, count]) => ({
			group,
			count,
		})),
	};
}

export async function exportDonationRecords(hospitalId: string) {
	const requests = await prisma.emergencyRequest.findMany({
		where: { hospitalId, status: "fulfilled" },
		include: {
			alerts: {
				where: { status: "completed" },
				include: {
					donor: {
						select: { name: true, email: true, bloodGroup: true },
					},
				},
			},
		},
		orderBy: { createdAt: "desc" },
	});

	const rows: string[] = ["Date,Hospital,Donor,Email,Blood Group,Units"];
	for (const req of requests) {
		for (const alert of req.alerts) {
			rows.push(
				[
					req.createdAt.toISOString().split("T")[0],
					req.hospitalId,
					alert.donor.name,
					alert.donor.email,
					alert.donor.bloodGroup ?? "N/A",
					req.unitsNeeded,
				].join(","),
			);
		}
	}

	return rows.join("\n");
}
