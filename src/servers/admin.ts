"use server";

import { z } from "zod";
import { Prisma } from "@generated/prisma/client";
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

const partnerSchema = z.object({
	organizationId: z.string().uuid(),
	isScreeningPartner: z.boolean(),
});

export async function setScreeningPartner(
	callerUserId: string,
	rawInput: unknown,
): Promise<{ organizationId: string; isScreeningPartner: boolean }> {
	await requireAdmin(callerUserId);
	const input = partnerSchema.parse(rawInput);
	const organization = await prisma.organization.findUnique({
		where: { id: input.organizationId },
		select: { verificationStatus: true },
	});
	if (!organization) {
		throw new Error("Hospital not found");
	}
	if (input.isScreeningPartner && organization.verificationStatus !== "approved") {
		throw new Error("Only an approved hospital can become a screening partner");
	}
	const updated = await prisma.organization.update({
		where: { id: input.organizationId },
		data: { isScreeningPartner: input.isScreeningPartner },
	});
	await writeAuditLog({
		actorId: callerUserId,
		organizationId: input.organizationId,
		action: "hospital.screening_partner",
		entityType: "organization",
		entityId: input.organizationId,
		metadata: { isScreeningPartner: input.isScreeningPartner },
	});
	return {
		organizationId: updated.id,
		isScreeningPartner: updated.isScreeningPartner,
	};
}

export async function reapplyForVerification(	organizationId: string,
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

const BLOOD_GROUPS = ["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"] as const;
const DONOR_VERIFICATION_STATUSES = ["unverified", "verified", "failed"] as const;
const DONOR_ACCOUNT_STATUSES = ["active", "restricted"] as const;

const listDonorsSchema = z.object({
	search: z.string().trim().max(120).optional(),
	bloodGroup: z.enum(BLOOD_GROUPS).optional(),
	verificationStatus: z.enum(DONOR_VERIFICATION_STATUSES).optional(),
	state: z.string().trim().max(60).optional(),
	donorStatus: z.enum(DONOR_ACCOUNT_STATUSES).optional(),
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export interface AdminDonorListItem {
	userId: string;
	name: string;
	email: string;
	donorCode: string;
	bloodGroup: string;
	state: string | null;
	verificationStatus: string;
	donorStatus: string;
	lastDonatedAt: Date | null;
	createdAt: Date;
}

export interface AdminDonorListResult {
	donors: AdminDonorListItem[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export async function listDonors(
	callerUserId: string,
	rawFilters?: unknown,
): Promise<AdminDonorListResult> {
	await requireAdmin(callerUserId);
	const filters = listDonorsSchema.parse(rawFilters ?? {});
	const where: Prisma.DonorProfileWhereInput = {};
	if (filters.bloodGroup) where.bloodGroup = filters.bloodGroup;
	if (filters.verificationStatus) where.verificationStatus = filters.verificationStatus;
	if (filters.donorStatus) where.donorStatus = filters.donorStatus;
	if (filters.state) where.state = { contains: filters.state, mode: "insensitive" };
	if (filters.search) {
		const contains = { contains: filters.search, mode: "insensitive" as const };
		where.OR = [
			{ donorCode: contains },
			{ user: { name: contains } },
			{ user: { email: contains } },
		];
	}
	const [total, rows] = await Promise.all([
		prisma.donorProfile.count({ where }),
		prisma.donorProfile.findMany({
			where,
			orderBy: { createdAt: "desc" },
			skip: (filters.page - 1) * filters.pageSize,
			take: filters.pageSize,
			select: {
				userId: true,
				donorCode: true,
				bloodGroup: true,
				state: true,
				verificationStatus: true,
				donorStatus: true,
				lastDonatedAt: true,
				createdAt: true,
				user: { select: { name: true, email: true } },
			},
		}),
	]);
	return {
		donors: rows.map((row) => ({
			userId: row.userId,
			name: row.user.name ?? "",
			email: row.user.email,
			donorCode: row.donorCode,
			bloodGroup: String(row.bloodGroup),
			state: row.state,
			verificationStatus: String(row.verificationStatus),
			donorStatus: String(row.donorStatus),
			lastDonatedAt: row.lastDonatedAt,
			createdAt: row.createdAt,
		})),
		total,
		page: filters.page,
		pageSize: filters.pageSize,
		totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
	};
}

export interface AdminDonorDetail {
	userId: string;
	name: string;
	email: string;
	donorCode: string;
	bloodGroup: string;
	state: string | null;
	lga: string | null;
	verificationStatus: string;
	verifiedAt: Date | null;
	donorStatus: string;
	restrictedReason: string | null;
	restrictedByName: string | null;
	restrictedAt: Date | null;
	isAvailable: boolean;
	lastDonatedAt: Date | null;
	cooldownUntil: Date | null;
	createdAt: Date;
	donationCount: number;
	completedDonationCount: number;
	recentDonations: {
		id: string;
		status: string;
		completedAt: Date | null;
		hospitalName: string;
	}[];
}

export async function getDonorDetail(
	callerUserId: string,
	donorUserId: string,
): Promise<AdminDonorDetail | null> {
	await requireAdmin(callerUserId);
	const profile = await prisma.donorProfile.findUnique({
		where: { userId: donorUserId },
		select: {
			userId: true,
			donorCode: true,
			bloodGroup: true,
			state: true,
			lga: true,
			verificationStatus: true,
			verifiedAt: true,
			donorStatus: true,
			restrictedReason: true,
			restrictedBy: true,
			restrictedAt: true,
			isAvailable: true,
			lastDonatedAt: true,
			cooldownUntil: true,
			createdAt: true,
			user: { select: { name: true, email: true } },
			donations: {
				orderBy: { createdAt: "desc" },
				take: 10,
				select: {
					id: true,
					status: true,
					completedAt: true,
					organization: { select: { name: true } },
				},
			},
			_count: { select: { donations: true } },
		},
	});
	if (!profile) return null;
	const completedDonationCount = await prisma.donation.count({
		where: { donorId: donorUserId, status: "completed" },
	});
	const restrictedByName = profile.restrictedBy
		? (
				await prisma.user.findUnique({
					where: { id: profile.restrictedBy },
					select: { name: true },
				})
			)?.name ?? null
		: null;
	return {
		userId: profile.userId,
		name: profile.user.name ?? "",
		email: profile.user.email,
		donorCode: profile.donorCode,
		bloodGroup: String(profile.bloodGroup),
		state: profile.state,
		lga: profile.lga,
		verificationStatus: String(profile.verificationStatus),
		verifiedAt: profile.verifiedAt,
		donorStatus: String(profile.donorStatus),
		restrictedReason: profile.restrictedReason,
		restrictedByName,
		restrictedAt: profile.restrictedAt,
		isAvailable: profile.isAvailable,
		lastDonatedAt: profile.lastDonatedAt,
		cooldownUntil: profile.cooldownUntil,
		createdAt: profile.createdAt,
		donationCount: profile._count.donations,
		completedDonationCount,
		recentDonations: profile.donations.map((donation) => ({
			id: donation.id,
			status: String(donation.status),
			completedAt: donation.completedAt,
			hospitalName: donation.organization.name,
		})),
	};
}

const restrictDonorSchema = z.object({
	reason: z.string().trim().min(1, "A reason is required to restrict a donor").max(500),
});

export async function restrictDonor(
	callerUserId: string,
	donorUserId: string,
	rawInput: unknown,
): Promise<void> {
	await requireAdmin(callerUserId);
	const input = restrictDonorSchema.parse(rawInput);
	const profile = await prisma.donorProfile.findUnique({
		where: { userId: donorUserId },
		select: { userId: true },
	});
	if (!profile) {
		throw new Error("Donor not found");
	}
	await prisma.donorProfile.update({
		where: { userId: donorUserId },
		data: {
			donorStatus: "restricted",
			restrictedReason: input.reason,
			restrictedBy: callerUserId,
			restrictedAt: new Date(),
		},
	});
	await writeAuditLog({
		actorId: callerUserId,
		action: "donor.restrict",
		entityType: "donor_profile",
		entityId: donorUserId,
		metadata: { reason: input.reason },
	});
}

export async function liftDonorRestriction(
	callerUserId: string,
	donorUserId: string,
): Promise<void> {
	await requireAdmin(callerUserId);
	const profile = await prisma.donorProfile.findUnique({
		where: { userId: donorUserId },
		select: { userId: true, donorStatus: true },
	});
	if (!profile) {
		throw new Error("Donor not found");
	}
	await prisma.donorProfile.update({
		where: { userId: donorUserId },
		data: {
			donorStatus: "active",
			restrictedReason: null,
			restrictedBy: null,
			restrictedAt: null,
		},
	});
	await writeAuditLog({
		actorId: callerUserId,
		action: "donor.lift_restriction",
		entityType: "donor_profile",
		entityId: donorUserId,
	});
}
