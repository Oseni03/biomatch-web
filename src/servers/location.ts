"use server";

import { geocodeAddress, haversineDistanceKm } from "@/lib/geocoding";

export interface GeocodedAddress {
	latitude: number;
	longitude: number;
	formattedAddress: string;
}

export async function geocodeAddressAction(
	address: string,
): Promise<{ ok: true; result: GeocodedAddress } | { ok: false; error: string }> {
	const result = await geocodeAddress(address);
	if (!result) {
		return {
			ok: false,
			error:
				"We couldn't locate that address. Please add more detail (street, area, state).",
		};
	}
	return { ok: true, result };
}

export async function scoreDonorProximity(
	donorLatitude?: number | null,
	donorLongitude?: number | null,
	hospitalLatitude?: number | null,
	hospitalLongitude?: number | null,
): Promise<number> {
	if (
		donorLatitude == null ||
		donorLongitude == null ||
		hospitalLatitude == null ||
		hospitalLongitude == null
	) {
		return 0;
	}

	const distanceKm = haversineDistanceKm(
		donorLatitude,
		donorLongitude,
		hospitalLatitude,
		hospitalLongitude,
	);

	if (distanceKm <= 10) return 4;
	if (distanceKm <= 25) return 3;
	if (distanceKm <= 50) return 2;
	return 0;
}
