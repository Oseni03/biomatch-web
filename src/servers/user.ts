"use server";

import { prisma } from "@/lib/prisma";
import type { Availability, BloodGroup } from "@generated/prisma/enums";
import { geocodeAddress } from "@/lib/geocoding";

export async function getUserById(id: string) {
	return prisma.user.findUnique({
		where: { id },
		include: {
			wallet: true,
		},
	});
}

export async function updateUserProfile(
	id: string,
	data: {
		name?: string;
		bloodGroup?: BloodGroup;
		genotype?: string;
		phone?: string;
		updatedHealthInfo?: any;
		lastDonationDate?: Date;
		location?: string;
		availability?: Availability;
		isActive?: boolean;
	},
) {
	const updateData: Record<string, unknown> = { ...data };

	if (data.location?.trim()) {
		try {
			const geocode = await geocodeAddress(data.location);
			if (geocode) {
				updateData.address = geocode.formattedAddress;
				updateData.latitude = geocode.latitude;
				updateData.longitude = geocode.longitude;
			}
		} catch (error) {
			console.warn("Geocoding failed while saving donor profile:", {
				userId: id,
				location: data.location,
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
