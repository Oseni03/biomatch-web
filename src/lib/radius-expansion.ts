export const INITIAL_RADIUS = 5;
export const EXPANSION_INCREMENT = 10;
export const MAX_RADIUS = 25;
export const MAX_ALERTS_PER_REQUEST = 50;

export function canExpand(currentRadius: number): boolean {
	return currentRadius < MAX_RADIUS;
}

export function nextRadius(currentRadius: number): number {
	return Math.min(currentRadius + EXPANSION_INCREMENT, MAX_RADIUS);
}
