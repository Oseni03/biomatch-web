"use server";

import { prisma } from "@/lib/prisma";
import type { IncentiveType, ClaimStatus } from "@generated/prisma/enums";

export async function createIncentiveClaim(
	userId: string,
	type: IncentiveType,
	metadata: any = {},
) {
	return prisma.incentiveClaim.create({
		data: {
			userId,
			type,
			metadata,
			status: "pending",
		},
		include: { user: { select: { name: true, email: true } } },
	});
}

export async function getClaimsByUserId(userId: string) {
	return prisma.incentiveClaim.findMany({
		where: { userId },
		orderBy: { createdAt: "desc" },
	});
}

export async function getPendingClaims() {
	return prisma.incentiveClaim.findMany({
		where: { status: "pending" },
		include: {
			user: {
				select: { id: true, name: true, email: true, bloodGroup: true },
			},
		},
		orderBy: { createdAt: "asc" },
	});
}

export async function updateClaimStatus(
	id: string,
	status: ClaimStatus,
	metadata?: any,
) {
	return prisma.incentiveClaim.update({
		where: { id },
		data: { status, ...(metadata && { metadata }) },
	});
}
