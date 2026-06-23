"use server";

import { prisma } from "@/lib/prisma";
import type { BloodGroup, Role } from "@prisma/client";

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

export async function listDonors(filters?: { bloodGroup?: BloodGroup }) {
	return prisma.user.findMany({
		where: {
			role: "donor",
			...(filters?.bloodGroup && { bloodGroup: filters.bloodGroup }),
		},
		include: { wallet: true },
		orderBy: { createdAt: "desc" },
	});
}
