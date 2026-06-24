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
	location?: string;
	availability?: string;
	isActive?: boolean;
}) {
	const { email, password, fullName, role, location, availability, isActive } = formData;
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

			if (location || availability !== undefined || isActive !== undefined) {
				await prisma.user.update({
					where: { id: data.user.id },
					data: {
						...(location && { location }),
						...(availability !== undefined && { availability }),
						...(isActive !== undefined && { isActive }),
					},
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
