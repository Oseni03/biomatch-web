"use server";

import { prisma } from "@/lib/prisma";
import type { BloodGroup, Role } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";

const ELIGIBILITY_DAYS = 56;

export async function getUserById(id: string) {
	return prisma.user.findUnique({
		where: { id },
		include: {
			wallet: true,
			managedBanks: true,
			claims: true,
		},
	});
}

export async function getUserBasicById(id: string) {
	return prisma.user.findUnique({
		where: { id },
		select: {
			id: true,
			name: true,
			email: true,
			bloodGroup: true,
			genotype: true,
			role: true,
			lastDonationDate: true,
		},
	});
}

export async function getUserByEmail(email: string) {
	return prisma.user.findUnique({
		where: { email },
		include: { wallet: true },
	});
}

export async function updateUserProfile(
	id: string,
	data: {
		name?: string;
		bloodGroup?: BloodGroup;
		genotype?: string;
		updatedHealthInfo?: any;
		lastDonationDate?: Date;
		location?: string;
		availability?: string;
		isActive?: boolean;
	},
) {
	return prisma.user.update({
		where: { id },
		data,
		include: { wallet: true },
	});
}

export async function updateUserRole(id: string, role: Role) {
	return prisma.user.update({
		where: { id },
		data: { role },
	});
}

export interface ListDonorsFilters {
	bloodGroup?: BloodGroup;
	eligibleOnly?: boolean;
	search?: string;
	location?: string;
	page?: number;
	pageSize?: number;
}

export async function getDonorHistory(userId: string, page = 1, pageSize = 10) {
	const skip = (page - 1) * pageSize;

	const [alerts, total] = await Promise.all([
		prisma.emergencyAlert.findMany({
			where: { donorId: userId, status: "completed" },
			include: {
				request: {
					select: {
						bloodGroup: true,
						unitsNeeded: true,
						createdAt: true,
						hospital: {
							select: { name: true, location: true },
						},
					},
				},
			},
			orderBy: { updatedAt: "desc" },
			skip,
			take: pageSize,
		}),
		prisma.emergencyAlert.count({
			where: { donorId: userId, status: "completed" },
		}),
	]);

	const records = alerts.map((a) => ({
		id: a.id,
		date: a.updatedAt.toISOString().split("T")[0],
		hospitalName: a.request.hospital.name,
		hospitalLocation: a.request.hospital.location,
		bloodGroup: a.request.bloodGroup,
		unitsNeeded: a.request.unitsNeeded,
	}));

	return {
		records,
		total,
		page,
		pageSize,
		totalPages: Math.ceil(total / pageSize),
	};
}

export async function getLocalDemandStats(userId: string) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { location: true },
	});

	const startOfMonth = new Date();
	startOfMonth.setDate(1);
	startOfMonth.setHours(0, 0, 0, 0);

	const baseWhere: Record<string, unknown> = {
		createdAt: { gte: startOfMonth },
	};

	if (user?.location) {
		baseWhere.hospital = {
			location: { contains: user.location, mode: "insensitive" },
		};
	}

	const [totalThisMonth, criticalThisMonth] = await Promise.all([
		prisma.emergencyRequest.count({ where: baseWhere as any }),
		prisma.emergencyRequest.count({
			where: { ...baseWhere, urgencyLevel: "critical" } as any,
		}),
	]);

	return {
		totalThisMonth,
		criticalThisMonth,
		location: user?.location ?? "Unknown",
	};
}

export async function listDonors(filters?: ListDonorsFilters) {
	const page = filters?.page ?? 1;
	const pageSize = filters?.pageSize ?? 50;
	const skip = (page - 1) * pageSize;

	const where: Prisma.UserWhereInput = {
		role: "donor",
	};

	if (filters?.bloodGroup) {
		where.bloodGroup = filters.bloodGroup;
	}

	if (filters?.location) {
		where.location = { contains: filters.location, mode: "insensitive" };
	}

	if (filters?.eligibleOnly) {
		const cutoff = new Date();
		cutoff.setDate(cutoff.getDate() - ELIGIBILITY_DAYS);
		where.OR = [
			{ lastDonationDate: null },
			{ lastDonationDate: { lt: cutoff } },
		];
	}

	if (filters?.search) {
		where.name = { contains: filters.search, mode: "insensitive" };
	}

	const [donors, total] = await Promise.all([
		prisma.user.findMany({
			where,
			select: {
				id: true,
				name: true,
				email: true,
				bloodGroup: true,
				genotype: true,
				lastDonationDate: true,
				location: true,
			},
			orderBy: { createdAt: "desc" },
			skip,
			take: pageSize,
		}),
		prisma.user.count({ where }),
	]);

	return { donors, total, page, pageSize };
}
