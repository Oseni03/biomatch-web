import { z } from "zod";

export const E164_REGEX = /^\+[1-9][0-9]{7,14}$/;

export function isE164(phoneNumber: string): boolean {
	return E164_REGEX.test(phoneNumber);
}

export function normalizeToE164(raw: string): string {
	const trimmed = raw.trim();
	if (trimmed === "") return "";
	const hasPlus = trimmed.startsWith("+");
	const digits = trimmed.replace(/\D/g, "");
	if (hasPlus) return `+${digits}`;
	if (digits.startsWith("234") && digits.length > 10) return `+${digits}`;
	if (digits.startsWith("0") && digits.length === 11) return `+234${digits.slice(1)}`;
	return digits;
}

export const phoneNumberSchema = z
	.string()
	.transform((value) => normalizeToE164(value))
	.refine((value) => isE164(value), {
		message: "Enter a valid phone number in international format, e.g. +2348012345678",
	});
