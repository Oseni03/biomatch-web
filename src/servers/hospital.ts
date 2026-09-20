"use server";

import { prisma } from "@/lib/prisma";
import { geocodeAddress } from "@/lib/geocoding";

type Inventory = Record<string, number>;

async function emptyInventory(): Promise<Inventory> {
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

type HospitalSidebarContext = {
	hospitalName: string;
	hospitalLocation: string;
	bloodBankStatus: "operational" | "limited" | "offline";
	bloodBankMessage: string;
};

export async function getHospitalSidebarContext(
	organizationId: string,
): Promise<HospitalSidebarContext> {
	const bank = await prisma.hospitalBank.findFirst({
		where: { organizationId },
		select: { hospitalName: true, location: true, inventory: true },
		orderBy: { createdAt: "asc" },
	});

	if (!bank) {
		return {
			hospitalName: "",
			hospitalLocation: "",
			bloodBankStatus: "offline",
			bloodBankMessage: "No blood bank on file",
		};
	}

	const inventory = (bank.inventory ?? {}) as Record<string, number>;
	const totalUnits = Object.values(inventory).reduce(
		(sum, value) => sum + (typeof value === "number" ? value : 0),
		0,
	);

	if (totalUnits <= 0) {
		return {
			hospitalName: bank.hospitalName,
			hospitalLocation: bank.location,
			bloodBankStatus: "offline",
			bloodBankMessage: "No blood stock — set up a drive",
		};
	}

	if (totalUnits < 20) {
		return {
			hospitalName: bank.hospitalName,
			hospitalLocation: bank.location,
			bloodBankStatus: "limited",
			bloodBankMessage: `${totalUnits} units in stock — restock advised`,
		};
	}

	return {
		hospitalName: bank.hospitalName,
		hospitalLocation: bank.location,
		bloodBankStatus: "operational",
		bloodBankMessage: `${totalUnits} units in stock — ready for dispatch`,
	};
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
