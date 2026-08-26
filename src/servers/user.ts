"use server";

import { prisma } from "@/lib/prisma";
import type { Availability, BloodGroup, Role } from "@generated/prisma/enums";
import type { Prisma } from "@generated/prisma/client";
import { buildLocationLabel } from "./location";
import { ELIGIBILITY_DAYS } from "@/lib/constants";
import { geocodeAddress } from "@/lib/geocoding";
import { getVerifiedDonorIds } from "./screening";

export async function getUserById(id: string) {
	return prisma.user.findUnique({
		where: { id },
		include: {
			wallet: true,
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

export async function isDonorProfileComplete(
	user:
		| (Pick<
				Prisma.UserGetPayload<{}>,
				"name" | "bloodGroup" | "location" | "locationId" | "availability" | "updatedHealthInfo"
		  > & { wallet?: unknown })
		| null
		| undefined,
) {
	if (!user) return false;

	const health = (user.updatedHealthInfo ?? {}) as Record<string, unknown>;
	const requiredHealthKeys = [
		"height_cm",
		"weight_kg",
		"blood_pressure",
		"resting_heart_rate",
	] as const;

	const hasRequiredHealth = requiredHealthKeys.every((key) => {
		const value = health[key];
		return typeof value === "string"
			? value.trim().length > 0
			: value != null && String(value).trim().length > 0;
	});

	return Boolean(
		user.name?.trim() &&
			user.bloodGroup &&
			(user.locationId || user.location?.trim()) &&
			user.availability &&
			hasRequiredHealth,
	);
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

	let resolvedLocation = data.location?.trim();
	if (data.locationId) {
		resolvedLocation = await buildLocationLabel(data.locationId);
		updateData.locationId = data.locationId;
		updateData.location = resolvedLocation;
	}

	if (resolvedLocation) {
		try {
			const geocode = await geocodeAddress(resolvedLocation);
			if (geocode) {
				updateData.address = geocode.formattedAddress;
				updateData.latitude = geocode.latitude;
				updateData.longitude = geocode.longitude;
			}
		} catch (error) {
			console.warn("Geocoding failed while saving donor profile:", {
				userId: id,
				location: resolvedLocation,
				error,
			});
		}
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
		where.id = { in: await getVerifiedDonorIds() };
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
				deferredUntil: true,
				blacklistedAt: true,
			},
			orderBy: { createdAt: "desc" },
			skip,
			take: pageSize,
		}),
		prisma.user.count({ where }),
	]);

	return { donors, total, page, pageSize };
}
