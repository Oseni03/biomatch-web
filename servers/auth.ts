"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function signUpWithProfile(formData: {
	email: string;
	password: string;
	fullName: string;
	role: "donor" | "hospital" | "admin";
}) {
	const { email, password, fullName, role } = formData;
	try {
		// 1. BetterAuth sign up
		const data = await auth.api.signUpEmail({
			body: {
				email,
				password,
				role,
				name: fullName,
				// role is usually not passed directly to BetterAuth unless you customized the schema
				// If you added role to BetterAuth user, pass it here
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
		}

		return { success: true, userId: data.user.id };
	} catch (err: any) {
		// Optional: cleanup BetterAuth user if profile creation fails
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
