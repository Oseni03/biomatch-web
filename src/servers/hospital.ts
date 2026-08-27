"use server";

import { prisma } from "@/lib/prisma";
import { BloodGroup } from "@generated/prisma/enums";
import { geocodeAddress } from "@/lib/geocoding";

export type Inventory = Record<string, number>;

export async function emptyInventory(): Promise<Inventory> {
	return {
		"A+": 0,
		"A-": 0,
		"B+": 0,
		"B-": 0,
		"AB+": 0,
		"AB-": 0,
		"O+": 0,
		"O-": 0,
	};
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

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
	return prisma.hospitalBank.findMany({
		include: ORGANIZATION_OWNER_INCLUDE,
		orderBy: { createdAt: "desc" },
	});
}

export async function getHospitalBankById(id: string) {
	return prisma.hospitalBank.findUnique({
		where: { id },
		include: ORGANIZATION_OWNER_INCLUDE,
	});
}

export async function getHospitalBankByOrganizationId(organizationId: string) {
	return prisma.hospitalBank.findFirst({
		where: { organizationId },
		select: { id: true, hospitalName: true },
	});
}

export async function createHospitalBank(data: {
	hospitalName: string;
	location: string;
	organizationId?: string;
}) {
	const fallbackLocation = data.location?.trim();
	const geocode = fallbackLocation
		? await geocodeAddress(fallbackLocation).catch(() => null)
		: null;

	return prisma.hospitalBank.create({
		data: {
			hospitalName: data.hospitalName,
			location: data.location,
			address: geocode?.formattedAddress ?? data.location,
			latitude: geocode?.latitude ?? null,
			longitude: geocode?.longitude ?? null,
		organizationId: data.organizationId,
		inventory: await emptyInventory(),
	},
	});
}

export async function updateHospitalBankInventory(
	id: string,
	inventory: Record<string, number>,
) {
	const parsed: Inventory = await emptyInventory();
	for (const bg of BLOOD_GROUPS) {
		const val = inventory[bg];
		if (typeof val === "number" && val >= 0) {
			parsed[bg] = val;
		}
	}

	return prisma.hospitalBank.update({
		where: { id },
		data: { inventory: parsed },
	});
}

export async function getBloodGroupUsageSummary() {
	const now = new Date();
	const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

	const banks = await prisma.hospitalBank.findMany({
		select: { inventory: true },
	});

	const totalInventory: Inventory = await emptyInventory();
	for (const bank of banks) {
		const inv = bank.inventory as Record<string, number>;
		for (const bg of BLOOD_GROUPS) {
			totalInventory[bg] += inv[bg] ?? 0;
		}
	}

	const bloodGroupToDisplay: Record<string, string> = {
		A_PLUS: "A+",
		A_MINUS: "A-",
		B_PLUS: "B+",
		B_MINUS: "B-",
		AB_PLUS: "AB+",
		AB_MINUS: "AB-",
		O_PLUS: "O+",
		O_MINUS: "O-",
	};

	return Object.values(BloodGroup).map((bloodGroup) => {
		const displayGroup = bloodGroupToDisplay[bloodGroup] ?? null;
		return {
			bloodGroup,
			currentMonthUsage: displayGroup ? totalInventory[displayGroup] : 0,
			previousMonthUsage: 0,
		};
	});
}
