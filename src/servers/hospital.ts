"use server";

import { prisma } from "@/lib/prisma";
import { BLOOD_GROUPS, inventorySchema, toBloodGroupEnum } from "@/lib/inventory-schema";
import { BloodGroup } from "@generated/prisma/enums";
import type { InventoryTransactionReason } from "@generated/prisma/enums";

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

export async function getHospitalBankByManagedById(userId: string) {
	return prisma.hospitalBank.findFirst({
		where: { managedById: userId },
		select: { id: true, hospitalName: true, sequenceNumber: true },
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
	reason: InventoryTransactionReason = "manual_adjustment",
) {
	const parsed = inventorySchema.safeParse(inventory);
	if (!parsed.success) {
		throw new Error(
			`Invalid inventory data: ${parsed.error.issues
				.map((issue: { message: string }) => issue.message)
				.join(", ")}`,
		);
	}

	return prisma.$transaction(async (tx) => {
		const current = await tx.hospitalBank.findUnique({
			where: { id },
			select: { inventory: true },
		});
		const currentInventory = (current?.inventory ?? {}) as Record<
			string,
			number
		>;

		const changedGroups = BLOOD_GROUPS.filter(
			(bg) => (currentInventory[bg] ?? 0) !== parsed.data[bg],
		);

		if (changedGroups.length > 0) {
			await tx.inventoryTransaction.createMany({
				data: changedGroups.map((bg) => ({
					hospitalBankId: id,
					bloodGroup: toBloodGroupEnum(bg),
					delta: parsed.data[bg] - (currentInventory[bg] ?? 0),
					reason,
				})),
			});
		}

		return tx.hospitalBank.update({
			where: { id },
			data: { inventory: parsed.data },
			include: { managedBy: true },
		});
	});
}

export async function getBloodGroupUsageSummary() {
	const now = new Date();
	const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

	const [thisMonth, lastMonth] = await Promise.all([
		prisma.inventoryTransaction.groupBy({
			by: ["bloodGroup"],
			where: { delta: { lt: 0 }, createdAt: { gte: startOfThisMonth } },
			_sum: { delta: true },
		}),
		prisma.inventoryTransaction.groupBy({
			by: ["bloodGroup"],
			where: {
				delta: { lt: 0 },
				createdAt: { gte: startOfLastMonth, lt: startOfThisMonth },
			},
			_sum: { delta: true },
		}),
	]);

	const toUsageMap = (rows: typeof thisMonth) =>
		Object.fromEntries(
			rows.map((r) => [r.bloodGroup, Math.abs(r._sum.delta ?? 0)]),
		) as Record<string, number>;

	const thisMonthUsage = toUsageMap(thisMonth);
	const lastMonthUsage = toUsageMap(lastMonth);

	return Object.values(BloodGroup).map((bloodGroup) => ({
		bloodGroup,
		currentMonthUsage: thisMonthUsage[bloodGroup] ?? 0,
		previousMonthUsage: lastMonthUsage[bloodGroup] ?? 0,
	}));
}
