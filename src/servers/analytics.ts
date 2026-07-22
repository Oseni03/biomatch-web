"use server";

import { Prisma } from "@generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ACTIVE_ALERT_STATUSES } from "@/lib/constants";

function buildCreatedAtFilter(dateRange?: {
	startDate: string;
	endDate: string;
}): Prisma.DateTimeFilter | undefined {
	if (!dateRange?.startDate && !dateRange?.endDate) return undefined;
	const filter: Prisma.DateTimeFilter = {};
	if (dateRange.startDate) filter.gte = new Date(dateRange.startDate);
	if (dateRange.endDate)
		filter.lte = new Date(dateRange.endDate + "T23:59:59.999Z");
	return filter;
}

export async function getHospitalAnalytics(
	organizationId: string,
	dateRange?: { startDate: string; endDate: string },
) {
	const dateFilter = buildCreatedAtFilter(dateRange);
	const requestWhere = dateFilter
		? { organizationId, createdAt: dateFilter }
		: { organizationId };
	const alertWhere = dateFilter
		? { request: { organizationId, createdAt: dateFilter } }
		: { request: { organizationId } };

	const [
		totalRequests,
		fulfilledRequests,
		totalAlerts,
		acceptedAlerts,
		gapGroups,
		monthlyRows,
		avgResponseTimeResult,
	] = await Promise.all([
		prisma.emergencyRequest.count({ where: requestWhere }),
		prisma.emergencyRequest.count({
			where: { ...requestWhere, status: "fulfilled" },
		}),
		prisma.emergencyAlert.count({ where: alertWhere }),
		prisma.emergencyAlert.count({
			where: {
				...alertWhere,
				status: { in: [...ACTIVE_ALERT_STATUSES] },
			},
		}),
		prisma.emergencyRequest.groupBy({
			by: ["bloodGroup"],
			where: { ...requestWhere, status: { not: "fulfilled" } },
			_count: { bloodGroup: true },
		}),
		prisma.emergencyRequest.findMany({
			where: requestWhere,
			select: { createdAt: true },
			orderBy: { createdAt: "asc" },
		}),
		prisma.$queryRaw<Array<{ avg: number | null }>>(Prisma.sql`
			SELECT
				ROUND(
					AVG(
						EXTRACT(EPOCH FROM (ea."respondedAt" - ea."createdAt")) / 60
					)
				)::integer AS avg
			FROM emergency_alerts ea
			JOIN emergency_requests er ON er.id = ea."requestId"
			WHERE er."organizationId" = ${organizationId}::uuid
				${dateFilter?.gte ? Prisma.sql`AND er."createdAt" >= ${dateFilter.gte}::timestamp` : Prisma.empty}
				${dateFilter?.lte ? Prisma.sql`AND er."createdAt" <= ${dateFilter.lte}::timestamp` : Prisma.empty}
				AND ea."respondedAt" IS NOT NULL
				AND ea.status IN (${Prisma.join(ACTIVE_ALERT_STATUSES)})
		`),
	]);

	const avgResponseTime = avgResponseTimeResult[0]?.avg ?? 0;

	const responseRate =
		totalAlerts > 0 ? Math.round((acceptedAlerts / totalAlerts) * 100) : 0;

	const monthlyVolumeMap = monthlyRows.reduce(
		(acc, r) => {
			const month = r.createdAt.toISOString().slice(0, 7);
			acc[month] = (acc[month] ?? 0) + 1;
			return acc;
		},
		{} as Record<string, number>,
	);

	const monthlyVolume = Object.entries(monthlyVolumeMap).map(
		([month, count]) => ({ month, count }),
	);

	const coverageGaps = gapGroups.map((g) => ({
		group: g.bloodGroup,
		count: g._count.bloodGroup,
	}));

	return {
		avgResponseTime,
		responseRate,
		fulfilledRequests,
		totalRequests,
		monthlyVolume,
		coverageGaps,
	};
}

export async function exportDonationRecords(
	organizationId: string,
	dateRange?: { startDate: string; endDate: string },
) {
	const dateFilter = buildCreatedAtFilter(dateRange);
	const where: Record<string, unknown> = {
		organizationId,
		status: "fulfilled",
		...(dateFilter ? { createdAt: dateFilter } : {}),
	};
	const requests = await prisma.emergencyRequest.findMany({
		where,
		include: {
			hospital: {
				select: { id: true, name: true },
			},
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

	const rows: string[] = ["Date,Hospital Name,Donor,Email,Blood Group,Units"];
	for (const req of requests) {
		for (const alert of req.alerts) {
			rows.push(
				[
					req.createdAt.toISOString().split("T")[0],
					`"${req.hospital.name}"`,
					alert.donor.name,
					alert.donor.email,
					alert.donor.bloodGroup?.replace("_", " ") ?? "N/A",
					req.unitsNeeded,
				].join(","),
			);
		}
	}

	return rows.join("\n");
}
