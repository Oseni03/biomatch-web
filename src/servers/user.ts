"use server";

import { Prisma } from "@generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireConsentsForUser } from "@/servers/consent";
import {
	DONOR_CODE_MAX_ATTEMPTS,
	generateDonorCode,
} from "@/lib/donor-code";
import {
	donorProfileInputSchema,
	lastKnownLocationSchema,
	type DonorProfileInput,
} from "@/lib/donor-profile-validation";
import { phoneNumberSchema } from "@/lib/phone-validation";
import {
	PHONE_OTP_MAX_PER_HOUR,
	PHONE_OTP_RESEND_SECONDS,
} from "@/lib/constants";
import { auth } from "@/lib/auth";

export async function getUserById(id: string) {
	await requireConsentsForUser(id);
	return prisma.user.findUnique({
		where: { id },
		include: {
			donorProfile: true,
			members: {
				select: { organizationId: true, role: true },
			},
		},
	});
}

export async function getDonorProfile(userId: string) {
	await requireConsentsForUser(userId);
	return prisma.donorProfile.findUnique({
		where: { userId },
	});
}

function validationMessage(error: unknown): string {
	if (error !== null && typeof error === "object" && "issues" in error) {
		const issues = (error as { issues: { message?: string }[] }).issues;
		const first = issues.find((i) => typeof i.message === "string");
		if (first?.message) return first.message;
	}
	return "Please check your profile details and try again";
}

function toProfileData(input: DonorProfileInput) {
	return {
		bloodGroup: input.bloodGroup,
		dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
		homeAddress: input.homeAddress ?? null,
		state: input.state ?? null,
		lga: input.lga ?? null,
		homeLatitude: input.homeLatitude ?? null,
		homeLongitude: input.homeLongitude ?? null,
		isAvailable: input.isAvailable,
	};
}

export async function updateDonorProfile(userId: string, rawInput: unknown) {
	await requireConsentsForUser(userId);
	const parsed = donorProfileInputSchema.safeParse(rawInput);
	if (!parsed.success) {
		throw new Error(validationMessage(parsed.error));
	}
	const input = parsed.data;
	const data = toProfileData(input);

	const existing = await prisma.donorProfile.findUnique({
		where: { userId },
	});
	if (existing) {
		return prisma.donorProfile.update({
			where: { userId },
			data,
		});
	}

	let lastError: unknown = null;
	for (let attempt = 0; attempt < DONOR_CODE_MAX_ATTEMPTS; attempt++) {
		const donorCode = generateDonorCode();
		try {
			return await prisma.donorProfile.create({
				data: {
					userId,
					donorCode,
					...data,
					bloodGroup: data.bloodGroup,
				},
			});
		} catch (err) {
			if (
				err instanceof Prisma.PrismaClientKnownRequestError &&
				err.code === "P2002"
			) {
				lastError = err;
				continue;
			}
			throw err;
		}
	}
	throw new Error(
		lastError instanceof Error
			? lastError.message
			: "Could not generate a unique donor code. Please try again",
	);
}

export async function saveDonorProfile(
	userId: string,
	rawInput: { name?: unknown; profile: unknown },
) {
	await requireConsentsForUser(userId);
	const name =
		rawInput.name === undefined
			? undefined
			: typeof rawInput.name === "string" && rawInput.name.trim()
				? rawInput.name.trim()
				: null;
	if (name === null) {
		throw new Error("Please enter your full name");
	}

	const parsed = donorProfileInputSchema.safeParse(rawInput.profile);
	if (!parsed.success) {
		throw new Error(validationMessage(parsed.error));
	}
	const data = toProfileData(parsed.data);

	const result = await prisma.$transaction(async (tx) => {
		if (name !== undefined) {
			await tx.user.update({
				where: { id: userId },
				data: { name },
			});
		}
		const existing = await tx.donorProfile.findUnique({
			where: { userId },
		});
		if (existing) {
			return tx.donorProfile.update({
				where: { userId },
				data,
			});
		}
		let lastError: unknown = null;
		for (let attempt = 0; attempt < DONOR_CODE_MAX_ATTEMPTS; attempt++) {
			const donorCode = generateDonorCode();
			try {
				return await tx.donorProfile.create({
					data: {
						userId,
						donorCode,
						...data,
						bloodGroup: data.bloodGroup,
					},
				});
			} catch (err) {
				if (
					err instanceof Prisma.PrismaClientKnownRequestError &&
					err.code === "P2002"
				) {
					lastError = err;
					continue;
				}
				throw err;
			}
		}
		throw new Error(
			lastError instanceof Error
				? lastError.message
				: "Could not generate a unique donor code. Please try again",
		);
	});

	return result;
}

export async function updateLastKnownLocation(
	userId: string,
	rawInput: unknown,
) {
	await requireConsentsForUser(userId);
	const parsed = lastKnownLocationSchema.safeParse(rawInput);
	if (!parsed.success) {
		throw new Error(validationMessage(parsed.error));
	}
	return prisma.donorProfile.update({
		where: { userId },
		data: {
			lastKnownLatitude: parsed.data.latitude,
			lastKnownLongitude: parsed.data.longitude,
			lastKnownAt: new Date(),
		},
	});
}

export async function getSessionRole(userId: string) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			role: true,
			donorProfile: { select: { userId: true } },
			members: { select: { organizationId: true }, take: 1 },
		},
	});
	if (!user) return null;
	if (user.role === "admin") return "admin";
	if (user.members.length > 0) return "hospital";
	return "donor";
}

export async function getPhoneVerificationState(userId: string) {
	await requireConsentsForUser(userId);
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { phoneNumber: true, phoneNumberVerified: true },
	});
	if (!user) throw new Error("Account not found");
	return user;
}

export async function setPhoneNumber(userId: string, rawPhone: unknown) {
	await requireConsentsForUser(userId);
	const parsed = phoneNumberSchema.safeParse(rawPhone);
	if (!parsed.success) {
		throw new Error(validationMessage(parsed.error));
	}
	const phoneNumber = parsed.data;
	const taken = await prisma.user.findUnique({
		where: { phoneNumber },
		select: { id: true },
	});
	if (taken && taken.id !== userId) {
		throw new Error("This phone number is already registered to another account");
	}
	try {
		return await prisma.user.update({
			where: { id: userId },
			data: { phoneNumber, phoneNumberVerified: false },
			select: { phoneNumber: true, phoneNumberVerified: true },
		});
	} catch (err) {
		if (
			err instanceof Prisma.PrismaClientKnownRequestError &&
			err.code === "P2002"
		) {
			throw new Error("This phone number is already registered to another account");
		}
		throw err;
	}
}

export async function requestPhoneOtp(userId: string) {
	await requireConsentsForUser(userId);
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { phoneNumber: true },
	});
	if (!user) throw new Error("Account not found");
	if (!user.phoneNumber) {
		throw new Error("Add a phone number before requesting a code");
	}
	const phoneNumber = user.phoneNumber;
	const now = new Date();
	const [recent, sentLastHour] = await Promise.all([
		prisma.verification.findFirst({
			where: { identifier: phoneNumber },
			orderBy: { createdAt: "desc" },
			select: { createdAt: true },
		}),
		prisma.verification.count({
			where: {
				identifier: phoneNumber,
				createdAt: { gt: new Date(now.getTime() - 60 * 60 * 1000) },
			},
		}),
	]);
	if (
		recent &&
		now.getTime() - recent.createdAt.getTime() < PHONE_OTP_RESEND_SECONDS * 1000
	) {
		throw new Error(
			`A code was just sent. Wait ${PHONE_OTP_RESEND_SECONDS} seconds before requesting another`,
		);
	}
	if (sentLastHour >= PHONE_OTP_MAX_PER_HOUR) {
		throw new Error("Too many codes requested. Try again in an hour");
	}
	await auth.api.sendPhoneNumberOTP({ body: { phoneNumber } });
	return { phoneNumber };
}
