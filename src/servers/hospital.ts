"use server";

import { prisma } from "@/lib/prisma";

type HospitalSidebarContext = {
	hospitalName: string;
	hospitalLocation: string;
	bloodBankStatus: "operational" | "limited" | "offline";
	bloodBankMessage: string;
};

export type HospitalVerificationState = {
	organizationId: string;
	hospitalName: string;
	verificationStatus: string;
};

export async function getHospitalVerificationState(
	organizationId: string,
): Promise<HospitalVerificationState | null> {
	const organization = await prisma.organization.findUnique({
		where: { id: organizationId },
		select: { id: true, name: true, verificationStatus: true },
	});
	if (!organization) {
		return null;
	}
	return {
		organizationId: organization.id,
		hospitalName: organization.name,
		verificationStatus: organization.verificationStatus,
	};
}

export async function getHospitalSidebarContext(
	organizationId: string,
): Promise<HospitalSidebarContext> {
	const organization = await prisma.organization.findUnique({
		where: { id: organizationId },
		select: {
			name: true,
			address: true,
			state: true,
			lga: true,
			verificationStatus: true,
		},
	});
	if (!organization) {
		return {
			hospitalName: "",
			hospitalLocation: "",
			bloodBankStatus: "offline",
			bloodBankMessage: "Hospital not found",
		};
	}
	const location = [organization.address, organization.lga, organization.state]
		.filter(Boolean)
		.join(", ");
	switch (organization.verificationStatus) {
		case "approved":
			return {
				hospitalName: organization.name,
				hospitalLocation: location,
				bloodBankStatus: "operational",
				bloodBankMessage: "Verified facility node",
			};
		case "pending":
			return {
				hospitalName: organization.name,
				hospitalLocation: location,
				bloodBankStatus: "limited",
				bloodBankMessage: "Awaiting approval — dispatch disabled",
			};
		case "rejected":
			return {
				hospitalName: organization.name,
				hospitalLocation: location,
				bloodBankStatus: "offline",
				bloodBankMessage: "Application rejected — see verification state",
			};
		default:
			return {
				hospitalName: organization.name,
				hospitalLocation: location,
				bloodBankStatus: "offline",
				bloodBankMessage: "Account suspended — contact support",
			};
	}
}
