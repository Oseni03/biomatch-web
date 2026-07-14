export const INITIAL_RADIUS = 5;
export const EXPANSION_INCREMENT = 5;
export const MAX_RADIUS = 25;
export const EXPANSION_TIMEOUT_MS = 300_000;
export const MAX_ALERTS_PER_REQUEST = 50;

export function getExpansionLevel(currentRadius: number): number {
	return Math.floor((currentRadius - INITIAL_RADIUS) / EXPANSION_INCREMENT) + 1;
}

export function canExpand(currentRadius: number): boolean {
	return currentRadius < MAX_RADIUS;
}

export function nextRadius(currentRadius: number): number {
	return Math.min(currentRadius + EXPANSION_INCREMENT, MAX_RADIUS);
}

export function getRadiusTier(radius: number): "exact" | "partial" | "broad" {
	if (radius <= INITIAL_RADIUS) return "exact";
	if (radius <= MAX_RADIUS / 2) return "partial";
	return "broad";
}
