"use server";

import { prisma } from "@/lib/prisma";
import {
	BLOOD_GROUPS,
	emptyInventory,
	fromBloodGroupEnum,
	inventorySchema,
	toBloodGroupEnum,
	type Inventory,
} from "@/lib/inventory-schema";
import { BloodGroup } from "@generated/prisma/enums";
import type { InventoryTransactionReason } from "@generated/prisma/enums";

// Current stock is a read-time projection of the append-only
// InventoryTransaction ledger, not the HospitalBank.inventory column —
// summing an insert-only ledger can't lose a concurrent update the way
// read-diff-overwrite on a JSON snapshot can. See issue 64.
async function deriveInventoryForBanks(
	hospitalBankIds: string[],
): Promise<Map<string, Inventory>> {
	const sums = await prisma.inventoryTransaction.groupBy({
		by: ["hospitalBankId", "bloodGroup"],
		where: { hospitalBankId: { in: hospitalBankIds } },
		_sum: { delta: true },
	});

	const result = new Map<string, Inventory>(
		hospitalBankIds.map((id) => [id, emptyInventory()]),
	);

	for (const row of sums) {
		const inventory = result.get(row.hospitalBankId);
		const displayGroup = fromBloodGroupEnum(row.bloodGroup);
		if (inventory && displayGroup) {
			inventory[displayGroup] = row._sum.delta ?? 0;
		}
	}

	return result;
}

async function deriveInventoryForBank(
	hospitalBankId: string,
): Promise<Inventory> {
	const byId = await deriveInventoryForBanks([hospitalBankId]);
	return byId.get(hospitalBankId) ?? emptyInventory();
}

const ORGANIZATION_OWNER_INCLUDE = {
	organization: {
		include: {
			members: {
				where: { role: "owner" },
				include: { user: { select: { id: true, name: true, email: true } } },
				take: 1,
			},
		},
	},
} as const;

export async function getAllHospitalBanks() {
	const banks = await prisma.hospitalBank.findMany({
		include: ORGANIZATION_OWNER_INCLUDE,
		orderBy: { createdAt: "desc" },
	});

	const inventoryByBank = await deriveInventoryForBanks(
		banks.map((b) => b.id),
	);

	return banks.map((bank) => ({
		...bank,
		inventory: inventoryByBank.get(bank.id) ?? emptyInventory(),
	}));
}

export async function getHospitalBankById(id: string) {
	const bank = await prisma.hospitalBank.findUnique({
		where: { id },
		include: ORGANIZATION_OWNER_INCLUDE,
	});
	if (!bank) return null;

	return { ...bank, inventory: await deriveInventoryForBank(id) };
}

export async function getHospitalBankByOrganizationId(organizationId: string) {
	return prisma.hospitalBank.findFirst({
		where: { organizationId },
		select: { id: true, hospitalName: true, sequenceNumber: true },
	});
}

export async function createHospitalBank(data: {
	hospitalName: string;
	location: string;
	locationId?: string;
	organizationId?: string;
}) {
	return prisma.hospitalBank.create({
		data: {
			hospitalName: data.hospitalName,
			location: data.location,
			locationId: data.locationId,
			organizationId: data.organizationId,
			inventory: emptyInventory(),
		},
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
		const sums = await tx.inventoryTransaction.groupBy({
			by: ["bloodGroup"],
			where: { hospitalBankId: id },
			_sum: { delta: true },
		});
		const currentInventory = emptyInventory();
		for (const row of sums) {
			const displayGroup = fromBloodGroupEnum(row.bloodGroup);
			if (displayGroup) currentInventory[displayGroup] = row._sum.delta ?? 0;
		}

		const changedGroups = BLOOD_GROUPS.filter(
			(bg) => currentInventory[bg] !== parsed.data[bg],
		);

		if (changedGroups.length > 0) {
			await tx.inventoryTransaction.createMany({
				data: changedGroups.map((bg) => ({
					hospitalBankId: id,
					bloodGroup: toBloodGroupEnum(bg),
					delta: parsed.data[bg] - currentInventory[bg],
					reason,
				})),
			});
		}

		// Non-authoritative cache — current stock is always read via the
		// ledger (deriveInventoryForBank(s)), never from this column.
		return tx.hospitalBank.update({
			where: { id },
			data: { inventory: parsed.data },
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
