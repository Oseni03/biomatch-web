"use server";

import { prisma } from "@/lib/prisma";

export type GeocodeResult = {
	latitude: number;
	longitude: number;
	formattedAddress: string;
};

function getProvider() {
	return process.env.BIOMATCH_GEOCODER_PROVIDER ?? "nominatim";
}

function getApiKey() {
	return process.env.BIOMATCH_GEOCODER_API_KEY?.trim();
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
	const trimmed = address.trim();
	if (!trimmed) return null;

	const provider = getProvider();

	if (provider === "google") {
		const apiKey = getApiKey();
		if (!apiKey) {
			console.warn("BIOMATCH_GEOCODER_API_KEY is not configured for Google geocoding.");
			return null;
		}

		const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
		url.searchParams.set("address", trimmed);
		url.searchParams.set("key", apiKey);

		const response = await fetch(url.toString(), { cache: "no-store" });
		if (!response.ok) {
			console.warn(`Google geocoding failed with status ${response.status}: ${trimmed}`);
			return null;
		}

		const payload = (await response.json()) as {
			results?: Array<{ geometry?: { location?: { lat?: number; lng?: number } }; formatted_address?: string }>;
		};
		const result = payload.results?.[0];
		const location = result?.geometry?.location;
		if (!location?.lat || !location?.lng) {
			return null;
		}
		return {
			latitude: Number(location.lat),
			longitude: Number(location.lng),
			formattedAddress: result?.formatted_address ?? trimmed,
		};
	}

	const url = new URL("https://nominatim.openstreetmap.org/search");
	url.searchParams.set("format", "jsonv2");
	url.searchParams.set("q", trimmed);
	url.searchParams.set("limit", "1");
	url.searchParams.set("addressdetails", "1");

	const response = await fetch(url.toString(), {
		cache: "no-store",
		headers: {
			"User-Agent": "BioMatch/1.0",
			Accept: "application/json",
		},
	});

	if (!response.ok) {
		console.warn(`Nominatim geocoding failed with status ${response.status}: ${trimmed}`);
		return null;
	}

	const payload = (await response.json()) as Array<{
			lat?: string;
			lon?: string;
			display_name?: string;
	}>;
	const first = payload[0];
	if (!first?.lat || !first?.lon) {
		return null;
	}

	return {
		latitude: Number(first.lat),
		longitude: Number(first.lon),
		formattedAddress: first.display_name ?? trimmed,
	};
}

export async function persistAddressCoordinates(
	userId: string,
	address: string,
) {
	const trimmed = address.trim();
	if (!trimmed) return { updated: false };

	const coordinates = await geocodeAddress(trimmed);
	if (!coordinates) {
		console.warn(`Geocoding failed for user ${userId}: ${trimmed}`);
		return { updated: false };
	}

	await prisma.user.update({
		where: { id: userId },
		data: {
			address: trimmed,
			latitude: coordinates.latitude,
			longitude: coordinates.longitude,
		},
	});

	return { updated: true, coordinates };
}

export function haversineDistanceKm(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
) {
	const toRadians = (value: number) => (value * Math.PI) / 180;
	const earthRadiusKm = 6371;
	const dLat = toRadians(lat2 - lat1);
	const dLon = toRadians(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRadians(lat1)) *
			Math.cos(toRadians(lat2)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return earthRadiusKm * c;
}
