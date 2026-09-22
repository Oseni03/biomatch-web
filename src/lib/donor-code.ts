export const DONOR_CODE_PREFIX = "BM-";
export const DONOR_CODE_LENGTH = 6;
export const DONOR_CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export const DONOR_CODE_REGEX = /^BM-[0-9A-HJKMNP-TV-Z]{6}$/;
export const DONOR_CODE_MAX_ATTEMPTS = 10;

export function generateDonorCode(
	randomFn: () => number = Math.random,
): string {
	let suffix = "";
	for (let i = 0; i < DONOR_CODE_LENGTH; i++) {
		const index = Math.floor(randomFn() * DONOR_CODE_ALPHABET.length);
		suffix += DONOR_CODE_ALPHABET[index];
	}
	return `${DONOR_CODE_PREFIX}${suffix}`;
}

export function isValidDonorCode(code: string): boolean {
	return DONOR_CODE_REGEX.test(code);
}

export async function generateUniqueDonorCode(
	exists: (code: string) => Promise<boolean>,
	randomFn: () => number = Math.random,
	maxAttempts: number = DONOR_CODE_MAX_ATTEMPTS,
): Promise<string> {
	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		const code = generateDonorCode(randomFn);
		if (!(await exists(code))) {
			return code;
		}
	}
	throw new Error(
		`Could not generate a unique donor code after ${maxAttempts} attempts`,
	);
}
