import type { ConsentType } from "@generated/prisma/client";

export const CONSENT_POLICY_VERSION =
	process.env.CONSENT_POLICY_VERSION ?? "v1";

export const REQUIRED_CONSENT_TYPES = [
	"terms",
	"privacy_policy",
	"data_processing",
] as const satisfies readonly ConsentType[];

export const MARKETING_CONSENT_TYPE = "marketing" as const satisfies ConsentType;

export type RequiredConsentType = (typeof REQUIRED_CONSENT_TYPES)[number];

export const CONSENT_REQUIRED_CODE = "CONSENT_REQUIRED";

export const CONSENT_REQUIRED_MESSAGE =
	"Please accept the current terms, privacy policy and data processing consent to continue.";

export const REQUIRED_WITHDRAWAL_MESSAGE =
	"Terms, privacy policy and data processing consents cannot be withdrawn while your account is active. To stop processing, delete your account.";

export class ConsentRequiredError extends Error {
	code = CONSENT_REQUIRED_CODE;
	missing: RequiredConsentType[];

	constructor(missing: RequiredConsentType[]) {
		super(CONSENT_REQUIRED_MESSAGE);
		this.name = "ConsentRequiredError";
		this.missing = missing;
	}
}

export function requiredWithdrawalError(consentType: string): string | null {
	return (REQUIRED_CONSENT_TYPES as readonly string[]).includes(consentType)
		? REQUIRED_WITHDRAWAL_MESSAGE
		: null;
}

export interface GrantedConsent {
	consentType: string;
	policyVersion: string;
	revokedAt: Date | null;
}

export function missingRequiredConsents(
	granted: GrantedConsent[],
	policyVersion: string = CONSENT_POLICY_VERSION,
): RequiredConsentType[] {
	const active = new Set(
		granted
			.filter(
				(g) => g.policyVersion === policyVersion && g.revokedAt === null,
			)
			.map((g) => g.consentType),
	);
	return REQUIRED_CONSENT_TYPES.filter((type) => !active.has(type));
}

export function hasSatisfiedRequiredConsents(
	granted: GrantedConsent[],
	policyVersion: string = CONSENT_POLICY_VERSION,
): boolean {
	return missingRequiredConsents(granted, policyVersion).length === 0;
}

export function isMarketingGranted(
	granted: GrantedConsent[],
	policyVersion: string = CONSENT_POLICY_VERSION,
): boolean {
	return granted.some(
		(g) =>
			g.consentType === MARKETING_CONSENT_TYPE &&
			g.policyVersion === policyVersion &&
			g.revokedAt === null,
	);
}

export function isConsentRequiredError(error: unknown): boolean {
	return (
		typeof error === "object" &&
		error !== null &&
		(error as { code?: unknown }).code === CONSENT_REQUIRED_CODE
	);
}

export const CONSENT_LABELS: Record<string, { title: string; detail: string }> = {
	terms: {
		title: "Terms of service",
		detail: "The rules for using BioMatch as a donor or hospital partner.",
	},
	privacy_policy: {
		title: "Privacy policy",
		detail: "How BioMatch collects, uses and protects your personal data.",
	},
	data_processing: {
		title: "Data processing consent",
		detail:
			"Permission to process your health-adjacent profile data for emergency matching, as required by NDPR.",
	},
	marketing: {
		title: "Product updates (optional)",
		detail: "Occasional messages about new BioMatch features. You can opt out anytime.",
	},
};
