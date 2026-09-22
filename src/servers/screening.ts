"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isValidDonorCode } from "@/lib/donor-code";
import { requireConsentsForUser } from "@/servers/consent";
import { requireOrgPermission } from "@/servers/organization";
import { writeAuditLog } from "@/servers/audit";

const RECORD_SCREENING = { donor: ["recordScreening"] };

const LOOKUP_LIMIT = 60;
const LOOKUP_WINDOW_MS = 10 * 60 * 1000;

export interface DonorLookupResult {
	donorCode: string;
	name: string;
	bloodGroup: string;
	verificationStatus: string;
	verifiedAt: Date | null;
	state: string | null;
}

export interface ScreeningRecord {
	screeningId: string;
	verificationStatus: string;
	verifiedAt: Date | null;
}

export interface RecentScreening {
	id: string;
	donorCode: string;
	donorName: string;
	result: string;
	screenedAt: Date;
	recordedBy: string;
	notes: string | null;
}

async function requireScreeningPartner(
	organizationId: string,
	callerUserId: string,
): Promise<void> {
	await requireOrgPermission(organizationId, callerUserId, RECORD_SCREENING);
	const organization = await prisma.organization.findUnique({
		where: { id: organizationId },
		select: { verificationStatus: true, isScreeningPartner: true },
	});
	if (
		!organization ||
		organization.verificationStatus !== "approved" ||
		!organization.isScreeningPartner
	) {
		throw new Error(
			"Screenings can only be recorded by an approved screening-partner hospital",
		);
	}
}

export async function checkScreeningLookupRateLimit(
	callerUserId: string,
	max = LOOKUP_LIMIT,
	windowMs = LOOKUP_WINDOW_MS,
): Promise<void> {
	const since = new Date(Date.now() - windowMs);
	const count = await prisma.auditLog.count({
		where: {
			actorId: callerUserId,
			action: "hospital.donor_lookup",
			createdAt: { gt: since },
		},
	});
	if (count >= max) {
		throw new Error("Too many lookups. Wait a few minutes and try again.");
	}
}

function normalizeDonorCode(rawCode: unknown): string {
	const code = z.string().trim().toUpperCase().parse(rawCode);
	if (!isValidDonorCode(code)) {
		throw new Error("No donor found for this code");
	}
	return code;
}

export async function lookupDonorByCode(
	organizationId: string,
	callerUserId: string,
	rawCode: unknown,
): Promise<DonorLookupResult> {
	await requireScreeningPartner(organizationId, callerUserId);
	await checkScreeningLookupRateLimit(callerUserId);
	const code = normalizeDonorCode(rawCode);
	const profile = await prisma.donorProfile.findUnique({
		where: { donorCode: code },
		select: {
			donorCode: true,
			bloodGroup: true,
			verificationStatus: true,
			verifiedAt: true,
			state: true,
			userId: true,
			user: { select: { name: true } },
		},
	});
	await writeAuditLog({
		actorId: callerUserId,
		organizationId,
		action: "hospital.donor_lookup",
		entityType: "donor_profile",
		entityId: profile?.userId,
		metadata: { found: !!profile },
	});
	if (!profile) {
		throw new Error("No donor found for this code");
	}
	return {
		donorCode: profile.donorCode,
		name: profile.user.name,
		bloodGroup: String(profile.bloodGroup),
		verificationStatus: String(profile.verificationStatus),
		verifiedAt: profile.verifiedAt,
		state: profile.state,
	};
}

const recordSchema = z.object({
	donorCode: z.string().trim().toUpperCase(),
	result: z.enum(["passed", "failed"]),
	notes: z.string().trim().max(2000).optional(),
});

export async function recordScreening(
	organizationId: string,
	callerUserId: string,
	rawInput: unknown,
): Promise<ScreeningRecord> {
	const input = recordSchema.parse(rawInput);
	const code = normalizeDonorCode(input.donorCode);
	await requireScreeningPartner(organizationId, callerUserId);
	const profile = await prisma.donorProfile.findUnique({
		where: { donorCode: code },
		select: { userId: true },
	});
	if (!profile) {
		throw new Error("No donor found for this code");
	}
	let screeningId: string;
	try {
		const screening = await prisma.donorScreening.create({
			data: {
				donorId: profile.userId,
				organizationId,
				recordedById: callerUserId,
				result: input.result,
				notes: input.notes,
			},
		});
		screeningId = screening.id;
	} catch (error) {
		if (
			error instanceof Error &&
			error.message.includes("not an approved screening partner")
		) {
			throw new Error(
				"Screenings can only be recorded by an approved screening-partner hospital",
			);
		}
		throw error;
	}
	const updated = await prisma.donorProfile.findUnique({
		where: { userId: profile.userId },
		select: { verificationStatus: true, verifiedAt: true },
	});
	await writeAuditLog({
		actorId: callerUserId,
		organizationId,
		action: "hospital.screening_record",
		entityType: "donor_screening",
		entityId: screeningId,
		metadata: { donorId: profile.userId, result: input.result },
	});
	return {
		screeningId,
		verificationStatus: String(updated?.verificationStatus ?? "unverified"),
		verifiedAt: updated?.verifiedAt ?? null,
	};
}

export async function listRecentScreenings(
	organizationId: string,
	callerUserId: string,
	page = 1,
	pageSize = 20,
): Promise<{ screenings: RecentScreening[]; total: number }> {
	await requireConsentsForUser(callerUserId);
	const membership = await prisma.member.findUnique({
		where: { organizationId_userId: { organizationId, userId: callerUserId } },
		select: { id: true },
	});
	if (!membership) {
		throw new Error("Caller is not a member of this organization");
	}
	const safePage = Math.max(1, page);
	const safePageSize = Math.min(100, Math.max(1, pageSize));
	const [total, rows] = await Promise.all([
		prisma.donorScreening.count({ where: { organizationId } }),
		prisma.donorScreening.findMany({
			where: { organizationId },
			orderBy: { screenedAt: "desc" },
			skip: (safePage - 1) * safePageSize,
			take: safePageSize,
			select: {
				id: true,
				result: true,
				screenedAt: true,
				notes: true,
				donor: {
					select: { donorCode: true, user: { select: { name: true } } },
				},
				recordedBy: { select: { name: true } },
			},
		}),
	]);
	return {
		total,
		screenings: rows.map((row) => ({
			id: row.id,
			donorCode: row.donor.donorCode,
			donorName: row.donor.user.name,
			result: String(row.result),
			screenedAt: row.screenedAt,
			recordedBy: row.recordedBy.name,
			notes: row.notes,
		})),
	};
}
