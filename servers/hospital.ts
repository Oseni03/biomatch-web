"use server";

import { prisma } from "@/lib/prisma";

export async function getAllHospitalBanks() {
	return prisma.hospitalBank.findMany({
		include: {
			managedBy: {
				select: { id: true, name: true, email: true },
			},
		},
		orderBy: { createdAt: "desc" },
	});
}

export async function getHospitalBankById(id: string) {
	return prisma.hospitalBank.findUnique({
		where: { id },
		include: { managedBy: true },
	});
}

export async function createHospitalBank(data: {
	hospitalName: string;
	location: string;
	managedById?: string;
}) {
	return prisma.hospitalBank.create({
		data: {
			...data,
			inventory: {
				"A+": 0,
				"A-": 0,
				"B+": 0,
				"B-": 0,
				"AB+": 0,
				"AB-": 0,
				"O+": 0,
				"O-": 0,
			},
		},
		include: { managedBy: true },
	});
}

export async function updateHospitalBankInventory(
	id: string,
	inventory: Record<string, number>,
) {
	return prisma.hospitalBank.update({
		where: { id },
		data: { inventory },
		include: { managedBy: true },
	});
}
