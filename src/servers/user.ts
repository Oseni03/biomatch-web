"use server";

import { prisma } from "@/lib/prisma";
import type { Availability, BloodGroup, Role } from "@generated/prisma/enums";
import type { Prisma } from "@generated/prisma/client";
import { buildLocationLabel } from "./location";
import { ELIGIBILITY_DAYS } from "@/lib/constants";

export async function getUserById(id: string) {
	return prisma.user.findUnique({
		where: { id },
		include: {
			wallet: true,
			managedBanks: true,
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
		locationId?: string;
		availability?: Availability;
		isActive?: boolean;
	},
) {
	const updateData: Record<string, unknown> = { ...data };
	delete updateData.locationId;

	if (data.locationId) {
		updateData.locationId = data.locationId;
		updateData.location = await buildLocationLabel(data.locationId);
	}

	return prisma.user.update({
		where: { id },
		data: updateData as any,
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

export async function getWalletByUserId(userId: string) {
	return prisma.wallet.findUnique({
		where: { userId },
	});
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
				locationId: true,
			},
			orderBy: { createdAt: "desc" },
			skip,
			take: pageSize,
		}),
		prisma.user.count({ where }),
	]);

	return { donors, total, page, pageSize };
}
