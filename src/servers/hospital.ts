"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOrgPermission } from "@/servers/organization";

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

export type HospitalDashboardDonation = {
	id: string;
	donorName: string;
	bloodGroup: string;
	status: string;
	completedAt: string | null;
	createdAt: string;
};

export type HospitalDashboardMetrics = {
	activeRequests: number;
	unitsRequired: number;
	unitsAccepted: number;
	unitsOutstanding: number;
	completedDonations: number;
	recentDonations: HospitalDashboardDonation[];
};

export async function getHospitalDashboardMetrics(
	organizationId: string,
	callerUserId: string,
): Promise<HospitalDashboardMetrics> {
	await requireOrgPermission(organizationId, callerUserId, {
		bloodRequest: ["read"],
	});
	const [activeRequests, units, completedDonations, recent] =
		await Promise.all([
			prisma.bloodRequest.count({
				where: { organizationId, status: "active" },
			}),
			prisma.bloodRequest.aggregate({
				where: { organizationId, status: "active" },
				_sum: { unitsRequired: true, unitsAccepted: true },
			}),
			prisma.donation.count({
				where: { organizationId, status: "completed" },
			}),
			prisma.donation.findMany({
				where: { organizationId },
				orderBy: { createdAt: "desc" },
				take: 6,
				select: {
					id: true,
					status: true,
					completedAt: true,
					createdAt: true,
					request: { select: { bloodGroup: true } },
					donor: {
						select: {
							bloodGroup: true,
							user: { select: { name: true } },
						},
					},
				},
			}),
		]);
	const unitsRequired = units._sum.unitsRequired ?? 0;
	const unitsAccepted = units._sum.unitsAccepted ?? 0;
	return {
		activeRequests,
		unitsRequired,
		unitsAccepted,
		unitsOutstanding: Math.max(0, unitsRequired - unitsAccepted),
		completedDonations,
		recentDonations: recent.map((donation) => ({
			id: donation.id,
			donorName: donation.donor.user.name || "Donor",
			bloodGroup: donation.request.bloodGroup,
			status: donation.status,
			completedAt: donation.completedAt?.toISOString() ?? null,
			createdAt: donation.createdAt.toISOString(),
		})),
	};
}

export type OrganizationProfile = {
	name: string;
	phone: string | null;
	address: string;
	state: string;
	lga: string | null;
	verificationStatus: string;
};

const organizationProfileSchema = z.object({
	name: z.string().trim().min(2).max(120),
	phone: z.string().trim().max(32).nullish(),
	address: z.string().trim().min(3).max(240),
	state: z.string().trim().min(2).max(64),
	lga: z.string().trim().max(64).nullish(),
});

function toOrganizationProfile(row: {
	name: string;
	phone: string | null;
	address: string;
	state: string;
	lga: string | null;
	verificationStatus: string;
}): OrganizationProfile {
	return {
		name: row.name,
		phone: row.phone,
		address: row.address,
		state: row.state,
		lga: row.lga,
		verificationStatus: row.verificationStatus,
	};
}

export async function getOrganizationProfile(
	organizationId: string,
	callerUserId: string,
): Promise<OrganizationProfile> {
	await requireOrgPermission(organizationId, callerUserId, {
		bloodRequest: ["read"],
	});
	const organization = await prisma.organization.findUnique({
		where: { id: organizationId },
		select: {
			name: true,
			phone: true,
			address: true,
			state: true,
			lga: true,
			verificationStatus: true,
		},
	});
	if (!organization) {
		throw new Error("Hospital not found");
	}
	return toOrganizationProfile(organization);
}

export async function updateOrganizationProfile(
	organizationId: string,
	callerUserId: string,
	rawInput: unknown,
): Promise<OrganizationProfile> {
	await requireOrgPermission(organizationId, callerUserId, {
		organization: ["update"],
	});
	const input = organizationProfileSchema.parse(rawInput);
	const updated = await prisma.organization.update({
		where: { id: organizationId },
		data: {
			name: input.name,
			phone: input.phone || null,
			address: input.address,
			state: input.state,
			lga: input.lga || null,
		},
		select: {
			name: true,
			phone: true,
			address: true,
			state: true,
			lga: true,
			verificationStatus: true,
		},
	});
	return toOrganizationProfile(updated);
}

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
