"use server";

import { prisma } from "@/lib/prisma";
import type { ScreeningStatus } from "@generated/prisma/enums";

export type VerificationStatus = "unverified" | "pending" | "verified" | "failed";

export async function getDonorVerificationStatus(
	donorId: string,
): Promise<VerificationStatus> {
	const latestResolved = await prisma.donorScreening.findFirst({
		where: { donorId, resolvedAt: { not: null } },
		orderBy: { resolvedAt: "desc" },
		select: { status: true },
	});

	if (latestResolved) {
		return latestResolved.status === "passed" ? "verified" : "failed";
	}

	const hasPending = await prisma.donorScreening.findFirst({
		where: { donorId, status: "pending" },
		select: { id: true },
	});

	return hasPending ? "pending" : "unverified";
}

export async function getVerifiedDonorIds(): Promise<string[]> {
	const resolved = await prisma.donorScreening.findMany({
		where: { resolvedAt: { not: null } },
		orderBy: { resolvedAt: "desc" },
		select: { donorId: true, status: true },
	});

	const latestByDonor = new Map<string, ScreeningStatus>();
	for (const row of resolved) {
		if (!latestByDonor.has(row.donorId)) {
			latestByDonor.set(row.donorId, row.status);
		}
	}

	const verified: string[] = [];
	for (const [donorId, status] of latestByDonor) {
		if (status === "passed") verified.push(donorId);
	}
	return verified;
}
