"use server";

import { prisma } from "@/lib/prisma";
import { inventorySchema } from "@/lib/inventory-schema";

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
	locationId?: string;
	managedById?: string;
}) {
	return prisma.hospitalBank.create({
		data: {
			hospitalName: data.hospitalName,
			location: data.location,
			locationId: data.locationId,
			managedById: data.managedById,
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
	const parsed = inventorySchema.safeParse(inventory);
	if (!parsed.success) {
		throw new Error(
			`Invalid inventory data: ${parsed.error.issues
				.map((issue: { message: string }) => issue.message)
				.join(", ")}`,
		);
	}

	return prisma.hospitalBank.update({
		where: { id },
		data: { inventory: parsed.data },
		include: { managedBy: true },
	});
}
