"use server";

import { prisma } from "@/lib/prisma";

export type StaffRole = "admin" | "requester" | "viewer";

interface StaffMember {
	id: string;
	name: string;
	email: string;
	role: StaffRole;
	isActive: boolean;
	createdAt: Date;
}

export async function getStaffMembers(
	hospitalId: string,
): Promise<StaffMember[]> {
	const staff = await prisma.user.findMany({
		where: {
			role: "hospital",
			managedBanks: {
				some: { managedById: hospitalId },
			},
		},
		select: {
			id: true,
			name: true,
			email: true,
			isActive: true,
			createdAt: true,
			updatedHealthInfo: true,
		},
		orderBy: { createdAt: "asc" },
	});

	return staff.map((s) => ({
		id: s.id,
		name: s.name,
		email: s.email,
		role: ((s.updatedHealthInfo as Record<string, unknown>)
			?.staffRole as StaffRole) ?? "viewer",
		isActive: s.isActive,
		createdAt: s.createdAt,
	}));
}

export async function inviteStaffMember(
	hospitalId: string,
	email: string,
	name: string,
	role: StaffRole,
) {
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) {
		await prisma.user.update({
			where: { email },
			data: {
				role: "hospital",
				name,
				updatedHealthInfo: {
					...(existing.updatedHealthInfo as Record<string, unknown>),
					staffRole: role,
				},
			},
		});
		return { success: true, userId: existing.id };
	}

	const newUser = await prisma.user.create({
		data: {
			email,
			name,
			role: "hospital",
			updatedHealthInfo: { staffRole: role },
		},
	});

	return { success: true, userId: newUser.id };
}

export async function updateStaffRole(userId: string, role: StaffRole) {
	const user = await prisma.user.findUnique({ where: { id: userId } });
	if (!user) throw new Error("Staff member not found");

	await prisma.user.update({
		where: { id: userId },
		data: {
			updatedHealthInfo: {
				...(user.updatedHealthInfo as Record<string, unknown>),
				staffRole: role,
			},
		},
	});

	return { success: true };
}

export async function removeStaffMember(userId: string) {
	await prisma.user.update({
		where: { id: userId },
		data: { isActive: false },
	});

	return { success: true };
}
