"use server";

import { prisma } from "@/lib/prisma";

type LocationWithChildren = {
	id: string;
	name: string;
	type: string;
	parentId: string | null;
	children: LocationWithChildren[];
};

export async function getLocations(parentId?: string | null) {
	return prisma.location.findMany({
		where: parentId ? { parentId } : { parentId: null },
		orderBy: { name: "asc" },
	});
}

export async function getLocation(id: string) {
	return prisma.location.findUnique({ where: { id } });
}

export async function getAncestors(locationId: string) {
	const result: { id: string; name: string; type: string }[] = [];
	let current = await prisma.location.findUnique({
		where: { id: locationId },
	});

	while (current) {
		result.unshift({
			id: current.id,
			name: current.name,
			type: current.type,
		});
		if (current.parentId) {
			current = await prisma.location.findUnique({
				where: { id: current.parentId },
			});
		} else {
			current = null;
		}
	}

	return result;
}

export async function buildLocationLabel(locationId: string): Promise<string> {
	const ancestors = await getAncestors(locationId);
	const parts = ancestors
		.filter((a) => a.type !== "region")
		.map((a) => a.name);
	return parts.join(", ") || "Unknown";
}

export async function getCommonAncestorDepth(
	id1: string,
	id2: string,
): Promise<number> {
	const [ancestors1, ancestors2] = await Promise.all([
		getAncestors(id1),
		getAncestors(id2),
	]);

	let depth = 0;
	for (let i = 0; i < Math.min(ancestors1.length, ancestors2.length); i++) {
		if (ancestors1[i].id === ancestors2[i].id) {
			depth = i + 1;
		} else {
			break;
		}
	}

	return depth;
}

export async function getAllCityLabels(): Promise<string[]> {
	const cities = await prisma.location.findMany({
		where: { type: "city" },
		include: { parent: true },
		orderBy: { name: "asc" },
	});
	return cities
		.filter((c) => c.parent !== null)
		.map((c) => `${c.name}, ${c.parent!.name}`);
}

export async function getLocationTree(): Promise<LocationWithChildren[]> {
	const all = await prisma.location.findMany({ orderBy: { name: "asc" } });
	const map = new Map<string, LocationWithChildren>();
	const roots: LocationWithChildren[] = [];

	for (const loc of all) {
		map.set(loc.id, { ...loc, children: [] });
	}

	for (const loc of all) {
		const node = map.get(loc.id)!;
		if (loc.parentId && map.has(loc.parentId)) {
			map.get(loc.parentId)!.children.push(node);
		} else if (!loc.parentId) {
			roots.push(node);
		}
	}

	return roots;
}
