"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { requireConsentsForUser } from "@/servers/consent";
import { writeAuditLog } from "@/servers/audit";
import HospitalApprovedEmail from "@/emails/hospital-approved";
import HospitalRejectedEmail from "@/emails/hospital-rejected";

const HOSPITAL_STATUSES = ["pending", "approved", "rejected", "suspended"] as const;

export type HospitalStatus = (typeof HOSPITAL_STATUSES)[number];

export interface HospitalListItem {
	id: string;
	name: string;
	officialEmail: string;
	registrationNumber: string | null;
	state: string;
	lga: string | null;
	verificationStatus: string;
	isScreeningPartner: boolean;
	approvedAt: Date | null;
	createdAt: Date;
	memberCount: number;
	pendingSince: Date | null;
}

export interface HospitalListResult {
	hospitals: HospitalListItem[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export interface VerificationQueueItem {
	id: string;
	submittedAt: Date;
	submittedBy: string | null;
	organization: {
		id: string;
		name: string;
		officialEmail: string;
		registrationNumber: string | null;
		state: string;
		lga: string | null;
	};
}

const listHospitalsSchema = z.object({
	status: z.enum(HOSPITAL_STATUSES).optional(),
	search: z.string().trim().max(120).optional(),
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const reviewSchema = z.object({
	organizationId: z.string().uuid(),
	notes: z.string().trim().max(2000).optional(),
});

const rejectSchema = reviewSchema.extend({
	reason: z.string().trim().min(1, "A rejection reason is required").max(2000),
});

export async function requireAdmin(callerUserId: string): Promise<void> {
	await requireConsentsForUser(callerUserId);
	const user = await prisma.user.findUnique({
		where: { id: callerUserId },
		select: { role: true, banned: true },
	});
	if (!user || user.role !== "admin" || user.banned) {
		throw new Error("Admin access required");
	}
}

export async function getAdminOverviewCounts(callerUserId: string): Promise<{
	totalHospitals: number;
	pendingApplications: number;
	approvedHospitals: number;
	totalDonors: number;
}> {
	await requireAdmin(callerUserId);
	const [totalHospitals, pendingApplications, approvedHospitals, totalDonors] =
		await Promise.all([
			prisma.organization.count(),
			prisma.hospitalVerification.count({ where: { decision: "pending" } }),
			prisma.organization.count({ where: { verificationStatus: "approved" } }),
			prisma.donorProfile.count(),
		]);
	return { totalHospitals, pendingApplications, approvedHospitals, totalDonors };
}

export async function listHospitals(
	callerUserId: string,
	rawFilters?: unknown,
): Promise<HospitalListResult> {
	await requireAdmin(callerUserId);
	const filters = listHospitalsSchema.parse(rawFilters ?? {});
	const where: {
		verificationStatus?: string;
		OR?: Array<Record<string, { contains: string; mode: "insensitive" }>>;
	} = {};
	if (filters.status) {
		where.verificationStatus = filters.status;
	}
	if (filters.search) {
		const contains = { contains: filters.search, mode: "insensitive" as const };
		where.OR = [{ name: contains }, { officialEmail: contains }, { registrationNumber: contains }];
	}
	const [total, rows] = await Promise.all([
		prisma.organization.count({ where }),
		prisma.organization.findMany({
			where,
			orderBy: { createdAt: "desc" },
			skip: (filters.page - 1) * filters.pageSize,
			take: filters.pageSize,
			select: {
				id: true,
				name: true,
				officialEmail: true,
				registrationNumber: true,
				state: true,
				lga: true,
				verificationStatus: true,
				isScreeningPartner: true,
				approvedAt: true,
				createdAt: true,
				_count: { select: { members: true } },
				verifications: {
					where: { decision: "pending" },
					orderBy: { submittedAt: "asc" },
					take: 1,
					select: { submittedAt: true },
				},
			},
		}),
	]);
	return {
		hospitals: rows.map((row) => ({
			id: row.id,
			name: row.name,
			officialEmail: row.officialEmail,
			registrationNumber: row.registrationNumber,
			state: row.state,
			lga: row.lga,
			verificationStatus: row.verificationStatus,
			isScreeningPartner: row.isScreeningPartner,
			approvedAt: row.approvedAt,
			createdAt: row.createdAt,
			memberCount: row._count.members,
			pendingSince: row.verifications[0]?.submittedAt ?? null,
		})),
		total,
		page: filters.page,
		pageSize: filters.pageSize,
		totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
	};
}

export async function getVerificationQueue(
	callerUserId: string,
): Promise<VerificationQueueItem[]> {
	await requireAdmin(callerUserId);
	const rows = await prisma.hospitalVerification.findMany({
		where: { decision: "pending" },
		orderBy: { submittedAt: "asc" },
		select: {
			id: true,
			submittedAt: true,
			submittedBy: true,
			organization: {
				select: {
					id: true,
					name: true,
					officialEmail: true,
					registrationNumber: true,
					state: true,
					lga: true,
				},
			},
		},
	});
	return rows;
}

export interface HospitalDetail {
	id: string;
	name: string;
	officialEmail: string;
	phone: string | null;
	registrationNumber: string | null;
	address: string;
	state: string;
	lga: string | null;
	verificationStatus: string;
	isScreeningPartner: boolean;
	approvedAt: Date | null;
	createdAt: Date;
	members: { userId: string; name: string; email: string; role: string }[];
	applications: {
		id: string;
		decision: string;
		submittedAt: Date;
		reviewedAt: Date | null;
		rejectionReason: string | null;
		notes: string | null;
	}[];
	requestCount: number;
	donationCount: number;
}

export async function getHospitalDetail(
	callerUserId: string,
	organizationId: string,
): Promise<HospitalDetail> {
	await requireAdmin(callerUserId);
	const organization = await prisma.organization.findUnique({
		where: { id: organizationId },
		select: {
			id: true,
			name: true,
			officialEmail: true,
			phone: true,
			registrationNumber: true,
			address: true,
			state: true,
			lga: true,
			verificationStatus: true,
			isScreeningPartner: true,
			approvedAt: true,
			createdAt: true,
			members: {
				select: {
					role: true,
					user: { select: { id: true, name: true, email: true } },
				},
			},
			verifications: {
				orderBy: { submittedAt: "desc" },
				select: {
					id: true,
					decision: true,
					submittedAt: true,
					reviewedAt: true,
					rejectionReason: true,
					notes: true,
				},
			},
			_count: { select: { bloodRequests: true, donations: true } },
		},
	});
	if (!organization) {
		throw new Error("Hospital not found");
	}
	return {
		id: organization.id,
		name: organization.name,
		officialEmail: organization.officialEmail,
		phone: organization.phone,
		registrationNumber: organization.registrationNumber,
		address: organization.address,
		state: organization.state,
		lga: organization.lga,
		verificationStatus: organization.verificationStatus,
		isScreeningPartner: organization.isScreeningPartner,
		approvedAt: organization.approvedAt,
		createdAt: organization.createdAt,
		members: organization.members.map((member) => ({
			userId: member.user.id,
			name: member.user.name,
			email: member.user.email,
			role: member.role,
		})),
		applications: organization.verifications.map((application) => ({
			...application,
			decision: String(application.decision),
		})),
		requestCount: organization._count.bloodRequests,
		donationCount: organization._count.donations,
	};
}

export async function approveHospital(
	callerUserId: string,
	rawInput: unknown,
): Promise<{ organizationId: string; verificationStatus: string }> {
	await requireAdmin(callerUserId);
	const input = reviewSchema.parse(rawInput);
	const decidedAt = new Date();
	const outcome = await prisma.$transaction(async (tx) => {
		const pending = await tx.hospitalVerification.findFirst({
			where: { organizationId: input.organizationId, decision: "pending" },
			include: {
				organization: {
					select: { id: true, name: true, officialEmail: true },
				},
			},
		});
		if (!pending) {
			throw new Error("No pending application for this hospital");
		}
		const [application, organization] = await Promise.all([
			tx.hospitalVerification.update({
				where: { id: pending.id },
				data: {
					decision: "approved",
					reviewedBy: callerUserId,
					reviewedAt: decidedAt,
					notes: input.notes,
				},
			}),
			tx.organization.update({
				where: { id: input.organizationId },
				data: { verificationStatus: "approved", approvedAt: decidedAt },
			}),
		]);
		await tx.auditLog.create({
			data: {
				actorId: callerUserId,
				organizationId: input.organizationId,
				action: "hospital.approve",
				entityType: "hospital_verification",
				entityId: application.id,
				metadata: { notes: input.notes ?? null },
			},
		});
		return { application, organization };
	});
	await sendEmail({
		to: outcome.organization.officialEmail,
		subject: "Your BioMatch hospital application was approved",
		react: HospitalApprovedEmail({ hospitalName: outcome.organization.name }),
	});
	return {
		organizationId: outcome.organization.id,
		verificationStatus: outcome.organization.verificationStatus,
	};
}

export async function rejectHospital(
	callerUserId: string,
	rawInput: unknown,
): Promise<{ organizationId: string; verificationStatus: string }> {
	await requireAdmin(callerUserId);
	const input = rejectSchema.parse(rawInput);
	const decidedAt = new Date();
	const outcome = await prisma.$transaction(async (tx) => {
		const pending = await tx.hospitalVerification.findFirst({
			where: { organizationId: input.organizationId, decision: "pending" },
			include: {
				organization: {
					select: { id: true, name: true, officialEmail: true },
				},
			},
		});
		if (!pending) {
			throw new Error("No pending application for this hospital");
		}
		const [application, organization] = await Promise.all([
			tx.hospitalVerification.update({
				where: { id: pending.id },
				data: {
					decision: "rejected",
					reviewedBy: callerUserId,
					reviewedAt: decidedAt,
					rejectionReason: input.reason,
					notes: input.notes,
				},
			}),
			tx.organization.update({
				where: { id: input.organizationId },
				data: { verificationStatus: "rejected", approvedAt: null },
			}),
		]);
		await tx.auditLog.create({
			data: {
				actorId: callerUserId,
				organizationId: input.organizationId,
				action: "hospital.reject",
				entityType: "hospital_verification",
				entityId: application.id,
				metadata: { reason: input.reason, notes: input.notes ?? null },
			},
		});
		return { application, organization };
	});
	await sendEmail({
		to: outcome.organization.officialEmail,
		subject: "Update on your BioMatch hospital application",
		react: HospitalRejectedEmail({
			hospitalName: outcome.organization.name,
			reason: input.reason,
		}),
	});
	return {
		organizationId: outcome.organization.id,
		verificationStatus: outcome.organization.verificationStatus,
	};
}

export async function suspendHospital(
	callerUserId: string,
	rawInput: unknown,
): Promise<{ organizationId: string; verificationStatus: string }> {
	await requireAdmin(callerUserId);
	const input = reviewSchema.parse(rawInput);
	const organization = await prisma.organization.findUnique({
		where: { id: input.organizationId },
		select: { verificationStatus: true },
	});
	if (!organization) {
		throw new Error("Hospital not found");
	}
	if (organization.verificationStatus !== "approved") {
		throw new Error("Only an approved hospital can be suspended");
	}
	const updated = await prisma.organization.update({
		where: { id: input.organizationId },
		data: { verificationStatus: "suspended" },
	});
	await writeAuditLog({
		actorId: callerUserId,
		organizationId: input.organizationId,
		action: "hospital.suspend",
		entityType: "organization",
		entityId: input.organizationId,
		metadata: { notes: input.notes ?? null },
	});
	return { organizationId: updated.id, verificationStatus: updated.verificationStatus };
}

export async function reinstateHospital(
	callerUserId: string,
	rawInput: unknown,
): Promise<{ organizationId: string; verificationStatus: string }> {
	await requireAdmin(callerUserId);
	const input = reviewSchema.parse(rawInput);
	const organization = await prisma.organization.findUnique({
		where: { id: input.organizationId },
		select: { verificationStatus: true },
	});
	if (!organization) {
		throw new Error("Hospital not found");
	}
	if (organization.verificationStatus !== "suspended") {
		throw new Error("Only a suspended hospital can be reinstated");
	}
	const updated = await prisma.organization.update({
		where: { id: input.organizationId },
		data: { verificationStatus: "approved" },
	});
	await writeAuditLog({
		actorId: callerUserId,
		organizationId: input.organizationId,
		action: "hospital.reinstate",
		entityType: "organization",
		entityId: input.organizationId,
		metadata: { notes: input.notes ?? null },
	});
	return { organizationId: updated.id, verificationStatus: updated.verificationStatus };
}

export async function reapplyForVerification(
	organizationId: string,
	callerUserId: string,
): Promise<{ applicationId: string }> {
	await requireConsentsForUser(callerUserId);
	const membership = await prisma.member.findUnique({
		where: { organizationId_userId: { organizationId, userId: callerUserId } },
		select: { role: true },
	});
	const roles = (membership?.role ?? "").split(",").map((role) => role.trim());
	if (!roles.includes("owner") && !roles.includes("admin")) {
		throw new Error("Only a hospital owner or admin can reapply for verification");
	}
	const organization = await prisma.organization.findUnique({
		where: { id: organizationId },
		select: { verificationStatus: true },
	});
	if (!organization) {
		throw new Error("Hospital not found");
	}
	if (organization.verificationStatus !== "rejected") {
		throw new Error("Only a rejected hospital can reapply for verification");
	}
	try {
		const application = await prisma.hospitalVerification.create({
			data: { organizationId, submittedBy: callerUserId },
		});
		return { applicationId: application.id };
	} catch (error) {
		if ((error as { code?: string }).code === "P2002") {
			throw new Error("This hospital already has a pending application");
		}
		throw error;
	}
}
