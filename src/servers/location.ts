"use server";

import { haversineDistanceKm } from "@/lib/geocoding";

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

export async function proximityPassesThreshold(
	score: number,
	searchRadius: number,
): Promise<boolean> {
	if (score > 0) {
		const threshold = searchRadius <= 5 ? 3 : searchRadius <= 15 ? 2 : 1;
		return score >= threshold;
	}
	return true;
}
