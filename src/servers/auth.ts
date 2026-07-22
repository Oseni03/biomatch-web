"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { buildLocationLabel } from "./location";
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

export async function signUpWithProfile(formData: {
	email: string;
	password: string;
	fullName: string;
	role: "donor" | "hospital" | "admin";
	locationId?: string;
	availability?: Availability;
	isActive?: boolean;
}) {
	const {
		email,
		password,
		fullName,
		role,
		locationId,
		availability,
		isActive,
	} = formData;
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

			if (locationId) {
				updateData.locationId = locationId;
				updateData.location = await buildLocationLabel(locationId);
			}

			if (availability !== undefined)
				updateData.availability = availability;
			if (isActive !== undefined) updateData.isActive = isActive;

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
			await auth.api.createOrganization({
				body: {
					name: fullName,
					slug,
					userId: data.user.id,
				},
			});
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
