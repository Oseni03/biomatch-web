"use server";

import { prisma } from "@/lib/prisma";
import type { BloodGroup, Role } from "@/generated/prisma/enums";

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
	page?: number;
	pageSize?: number;
}

export async function listDonors(filters?: ListDonorsFilters) {
	const page = filters?.page ?? 1;
	const pageSize = filters?.pageSize ?? 50;
	const skip = (page - 1) * pageSize;

	const where: Record<string, unknown> = {
		role: "donor",
	};

	if (filters?.bloodGroup) {
		where.bloodGroup = filters.bloodGroup;
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

	return prisma.user.findMany({
		where,
		include: { wallet: true },
		orderBy: { createdAt: "desc" },
		skip,
		take: pageSize,
	});
}
