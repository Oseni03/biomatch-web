"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { buildLocationLabel } from "./location";
import type { Availability } from "@generated/prisma/enums";

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

		return { success: true, userId: data.user.id };
	} catch (err: any) {
		console.error("Profile creation failed:", err);
		return {
			error: err.message ?? "Account created but profile setup failed",
		};
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
