export const COMPATIBLE_DONORS: Record<string, string[]> = {
	A_PLUS: ["A_PLUS", "A_MINUS", "O_PLUS", "O_MINUS"],
	A_MINUS: ["A_MINUS", "O_MINUS"],
	B_PLUS: ["B_PLUS", "B_MINUS", "O_PLUS", "O_MINUS"],
	B_MINUS: ["B_MINUS", "O_MINUS"],
	AB_PLUS: [
		"A_PLUS",
		"A_MINUS",
		"B_PLUS",
		"B_MINUS",
		"AB_PLUS",
		"AB_MINUS",
		"O_PLUS",
		"O_MINUS",
	],
	AB_MINUS: ["A_MINUS", "B_MINUS", "AB_MINUS", "O_MINUS"],
	O_PLUS: ["O_PLUS", "O_MINUS"],
	O_MINUS: ["O_MINUS"],
};

export function getCompatibleDonorGroups(bloodGroup: string): string[] {
	return COMPATIBLE_DONORS[bloodGroup] ?? [];
}
