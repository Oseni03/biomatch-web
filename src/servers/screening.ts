"use server";

import { prisma } from "@/lib/prisma";
import type { ScreeningStatus } from "@generated/prisma/enums";
import { sendScreeningResultEmail } from "./notification";
import { authorizeOrgAction, getOrganizationOwnerUserId } from "./organization";

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

export async function getActiveScreeningForDonor(donorId: string) {
	return prisma.donorScreening.findFirst({
		where: { donorId, status: "pending" },
		orderBy: { screenedAt: "desc" },
	});
}

export async function getScreeningHistoryForDonor(donorId: string) {
	return prisma.donorScreening.findMany({
		where: { donorId },
		orderBy: { screenedAt: "desc" },
	});
}

export async function createScreening(
	donorId: string,
	organizationId: string,
	staffUserId: string,
) {
	await authorizeOrgAction(organizationId, staffUserId, {
		screening: ["create"],
	});

	const existingPending = await prisma.donorScreening.findFirst({
		where: { donorId, status: "pending" },
	});
	if (existingPending) {
		return existingPending;
	}

	const hospitalId = await getOrganizationOwnerUserId(organizationId);

	return prisma.donorScreening.create({
		data: {
			donorId,
			hospitalId,
			organizationId,
			staffUserId,
			status: "pending",
			screenedAt: new Date(),
		},
	});
}

export async function resolveScreening(
	screeningId: string,
	status: "passed" | "failed",
	callerUserId: string,
	notes?: string,
) {
	const existing = await prisma.donorScreening.findUnique({
		where: { id: screeningId },
	});
	if (!existing) throw new Error("Screening not found");
	if (existing.status !== "pending") {
		throw new Error(
			`Cannot resolve a screening that is already "${existing.status}"`,
		);
	}
	if (!existing.organizationId) {
		throw new Error("Screening has no organization");
	}

	await authorizeOrgAction(existing.organizationId, callerUserId, {
		screening: ["resolve"],
	});

	const updated = await prisma.donorScreening.update({
		where: { id: screeningId },
		data: {
			status,
			notes: notes || existing.notes,
			resolvedAt: new Date(),
		},
	});

	sendScreeningResultEmail(updated.id).catch((err) => {
		console.error("Failed to send screening result email:", err);
	});

	return updated;
}
