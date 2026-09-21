"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function signUpWithProfile(formData: {
	email: string;
	password: string;
	fullName: string;
}) {
	const { email, password, fullName } = formData;

	try {
		const data = await auth.api.signUpEmail({
			body: {
				email,
				password,
				name: fullName,
			},
		});

		if (!data?.user) {
			return { error: "Failed to create account" };
		}

		return { success: true, userId: data.user.id };
	} catch (err: unknown) {
		return {
			error: err instanceof Error ? err.message : "Account creation failed",
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
					role: invitation.role ?? "member",
				},
			}),
			prisma.invitation.update({
				where: { id: invitation.id },
				data: { status: "accepted" },
			}),
		]);

		return { success: true };
	} catch (err: unknown) {
		return {
			error: err instanceof Error ? err.message : "Failed to accept invitation",
		};
	}
}
