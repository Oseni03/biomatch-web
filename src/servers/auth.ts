"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createHospitalBank } from "./hospital";
import type { Availability } from "@generated/prisma/enums";

function slugify(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

async function generateUniqueOrgSlug(name: string): Promise<string> {
	const base = slugify(name) || "hospital";
	let slug = base;
	let suffix = 0;
	while (await prisma.organization.findUnique({ where: { slug } })) {
		suffix += 1;
		slug = `${base}-${suffix}`;
	}
	return slug;
}

type DonorProfile = {
	phone: string;
	/** "A+" | "A-" | ... | "O-", or "unknown" when the donor hasn't been screened */
	bloodGroup: string;
	preferredHospital: string;
	emergencyOnly: boolean;
};

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const BLOOD_GROUP_UNKNOWN = "unknown";
const PHONE_PATTERN = /^\+?[0-9\s-]{10,15}$/;
const BG_ENUM: Record<string, string> = {
	"A+": "A_PLUS",
	"A-": "A_MINUS",
	"B+": "B_PLUS",
	"B-": "B_MINUS",
	"AB+": "AB_PLUS",
	"AB-": "AB_MINUS",
	"O+": "O_PLUS",
	"O-": "O_MINUS",
};

// The client validates too, but server actions are public endpoints, so re-check here.
function validateDonorProfile(profile: DonorProfile): string | null {
	if (!PHONE_PATTERN.test(profile.phone.trim())) {
		return "Enter a valid phone number";
	}
	if (
		profile.bloodGroup !== BLOOD_GROUP_UNKNOWN &&
		!BLOOD_GROUPS.includes(profile.bloodGroup)
	) {
		return "Select a valid blood group";
	}
	if (!profile.preferredHospital.trim()) {
		return "Select a screening hospital";
	}
	return null;
}

export async function signUpWithProfile(formData: {
	email: string;
	password: string;
	fullName: string;
	role: "donor" | "hospital" | "admin";
	location?: string;
	availability?: Availability;
	isActive?: boolean;
	donorProfile?: DonorProfile;
}) {
	const {
		email,
		password,
		fullName,
		role,
		location,
		availability,
		isActive,
		donorProfile,
	} = formData;

	// Validate before creating the account so a bad profile can't leave a half-created user.
	if (role === "donor" && donorProfile) {
		const message = validateDonorProfile(donorProfile);
		if (message) return { error: message };
	}

	try {
		const data = await auth.api.signUpEmail({
			body: {
				email,
				password,
				role,
				name: fullName,
			},
		});

		if (!data?.user) {
			return { error: "Failed to create account" };
		}

		if (role === "donor") {
			await prisma.wallet.create({
				data: {
					userId: data.user.id,
				},
			});

			const updateData: Record<string, unknown> = {};

			if (location) updateData.location = location;
			if (availability !== undefined)
				updateData.availability = availability;
			if (isActive !== undefined) updateData.isActive = isActive;

			if (donorProfile) {
				updateData.phone = donorProfile.phone.trim();
				// Unknown blood group is stored as null until a hospital screens the donor.
				updateData.bloodGroup =
					donorProfile.bloodGroup === BLOOD_GROUP_UNKNOWN
						? null
						: BG_ENUM[donorProfile.bloodGroup];
				updateData.preferredHospital = donorProfile.preferredHospital.trim();
				updateData.emergencyOnly = donorProfile.emergencyOnly;
			}

			if (Object.keys(updateData).length > 0) {
				await prisma.user.update({
					where: { id: data.user.id },
					data: updateData as any,
				});
			}
		}

		if (role === "hospital") {
			const existingMembership = await prisma.member.findFirst({
				where: { userId: data.user.id },
			});
			if (existingMembership) {
				return { error: "Account is already part of an organization" };
			}

			const slug = await generateUniqueOrgSlug(fullName);
			const organization = await auth.api.createOrganization({
				body: {
					name: fullName,
					slug,
					userId: data.user.id,
				},
			});

			if (organization) {
				await createHospitalBank({
					hospitalName: fullName,
					location: "",
					organizationId: organization.id,
				});
			}
		}

		return { success: true, userId: data.user.id };
	} catch (err: any) {
		console.error("Profile creation failed:", err);
		return {
			error: err.message ?? "Account created but profile setup failed",
		};
	}
}

export async function acceptInvitationSignUp(formData: {
	invitationId: string;
	fullName: string;
	password: string;
}) {
	const { invitationId, fullName, password } = formData;

	const invitation = await prisma.invitation.findUnique({
		where: { id: invitationId },
	});

	if (
		!invitation ||
		invitation.status !== "pending" ||
		invitation.expiresAt < new Date()
	) {
		return { error: "This invitation is no longer valid" };
	}

	const existingUser = await prisma.user.findUnique({
		where: { email: invitation.email },
	});
	if (existingUser) {
		return {
			error: "An account with this email already exists. Log in to accept this invitation.",
		};
	}

	try {
		const data = await auth.api.signUpEmail({
			body: {
				email: invitation.email,
				password,
				role: "hospital",
				name: fullName,
			},
		});

		if (!data?.user) {
			return { error: "Failed to create account" };
		}

		await prisma.$transaction([
			prisma.member.create({
				data: {
					organizationId: invitation.organizationId,
					userId: data.user.id,
					role: invitation.role,
				},
			}),
			prisma.invitation.update({
				where: { id: invitation.id },
				data: { status: "accepted" },
			}),
		]);

		return { success: true };
	} catch (err: any) {
		console.error("Accepting invitation failed:", err);
		return { error: err.message ?? "Failed to accept invitation" };
	}
}

export async function loginWithRole(email: string, password: string) {
	const { user } = await auth.api.signInEmail({
		body: {
			email,
			password,
		},
		headers: await headers(),
	});

	if (!user) {
		return { error: "Invalid credentials" };
	}

	// Redirect based on role (server-side)
	redirect(`/${user.role}`);
}
