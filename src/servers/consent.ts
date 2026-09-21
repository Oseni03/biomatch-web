"use server";

import { headers } from "next/headers";
import type { ConsentType } from "@generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
	CONSENT_POLICY_VERSION,
	ConsentRequiredError,
	MARKETING_CONSENT_TYPE,
	REQUIRED_CONSENT_TYPES,
	isMarketingGranted,
	missingRequiredConsents,
	requiredWithdrawalError,
	type RequiredConsentType,
} from "@/lib/consent";

async function requestIp(): Promise<string | null> {
	const h = await headers();
	return (
		h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
		h.get("x-real-ip")?.trim() ||
		null
	);
}

async function sessionUserId(): Promise<string> {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user?.id) {
		throw new Error("Not authenticated");
	}
	return session.user.id;
}

export interface ConsentStatus {
	policyVersion: string;
	required: RequiredConsentType[];
	granted: RequiredConsentType[];
	missing: RequiredConsentType[];
	marketingGranted: boolean;
}

export async function getConsentStatus(): Promise<ConsentStatus> {
	const userId = await sessionUserId();
	return getConsentStatusForUser(userId);
}

export async function getConsentStatusForUser(
	userId: string,
): Promise<ConsentStatus> {
	const rows = await prisma.consentRecord.findMany({
		where: { userId },
		select: { consentType: true, policyVersion: true, revokedAt: true },
	});
	const missing = missingRequiredConsents(rows, CONSENT_POLICY_VERSION);
	const granted = REQUIRED_CONSENT_TYPES.filter((t) => !missing.includes(t));
	return {
		policyVersion: CONSENT_POLICY_VERSION,
		required: [...REQUIRED_CONSENT_TYPES],
		granted,
		missing,
		marketingGranted: isMarketingGranted(rows, CONSENT_POLICY_VERSION),
	};
}

export async function hasSatisfiedConsents(userId: string): Promise<boolean> {
	const rows = await prisma.consentRecord.findMany({
		where: {
			userId,
			policyVersion: CONSENT_POLICY_VERSION,
			revokedAt: null,
			consentType: { in: [...REQUIRED_CONSENT_TYPES] },
		},
		select: { id: true },
	});
	return rows.length === REQUIRED_CONSENT_TYPES.length;
}

export async function requireConsentsForUser(
	userId: string,
): Promise<void> {
	const rows = await prisma.consentRecord.findMany({
		where: { userId },
		select: { consentType: true, policyVersion: true, revokedAt: true },
	});
	const missing = missingRequiredConsents(rows, CONSENT_POLICY_VERSION);
	if (missing.length > 0) {
		throw new ConsentRequiredError(missing);
	}
}

export async function requireSessionConsents(): Promise<string> {
	const userId = await sessionUserId();
	await requireConsentsForUser(userId);
	return userId;
}

export async function acceptConsents(input?: {
	marketing?: boolean;
}): Promise<ConsentStatus> {
	const userId = await sessionUserId();
	const ip = await requestIp();
	await recordConsentsForUser(userId, { marketing: input?.marketing }, ip);
	return getConsentStatusForUser(userId);
}

export async function recordConsentsForUser(
	userId: string,
	input?: { marketing?: boolean },
	ipAddress: string | null = null,
): Promise<void> {
	const types: ConsentType[] = [...REQUIRED_CONSENT_TYPES];
	if (input?.marketing) {
		types.push(MARKETING_CONSENT_TYPE);
	}

	const existing = await prisma.consentRecord.findMany({
		where: {
			userId,
			policyVersion: CONSENT_POLICY_VERSION,
			revokedAt: null,
			consentType: { in: types },
		},
		select: { consentType: true },
	});
	const have = new Set(existing.map((r) => r.consentType));
	const toCreate = types.filter((t) => !have.has(t));
	if (toCreate.length > 0) {
		await prisma.$transaction(
			toCreate.map((consentType) =>
				prisma.consentRecord.create({
					data: {
						userId,
						consentType,
						policyVersion: CONSENT_POLICY_VERSION,
						ipAddress,
					},
				}),
			),
		);
	}
}

export async function updateMarketingConsent(input: {
	granted: boolean;
}): Promise<ConsentStatus> {
	const userId = await sessionUserId();
	const ip = await requestIp();
	await setMarketingForUser(userId, input.granted, ip);
	return getConsentStatusForUser(userId);
}

export async function setMarketingForUser(
	userId: string,
	granted: boolean,
	ipAddress: string | null = null,
): Promise<void> {
	if (granted) {
		const existing = await prisma.consentRecord.findFirst({
			where: {
				userId,
				consentType: MARKETING_CONSENT_TYPE,
				policyVersion: CONSENT_POLICY_VERSION,
				revokedAt: null,
			},
			select: { id: true },
		});
		if (!existing) {
			await prisma.consentRecord.create({
				data: {
					userId,
					consentType: MARKETING_CONSENT_TYPE,
					policyVersion: CONSENT_POLICY_VERSION,
					ipAddress,
				},
			});
		}
	} else {
		await prisma.consentRecord.updateMany({
			where: {
				userId,
				consentType: MARKETING_CONSENT_TYPE,
				revokedAt: null,
			},
			data: { revokedAt: new Date() },
		});
	}
}

export async function withdrawConsent(input: {
	consentType: ConsentType;
}): Promise<{ error: string } | ConsentStatus> {
	const refusal = requiredWithdrawalError(input.consentType);
	if (refusal) {
		return { error: refusal };
	}
	if (input.consentType === MARKETING_CONSENT_TYPE) {
		return updateMarketingConsent({ granted: false });
	}
	return { error: `Unknown consent type "${input.consentType}"` };
}
