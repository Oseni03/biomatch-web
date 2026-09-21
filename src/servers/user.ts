"use server";

import { prisma } from "@/lib/prisma";
import { requireConsentsForUser } from "@/servers/consent";

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

export async function updateUserProfile(
	id: string,
	data: {
		name?: string;
	},
) {
	await requireConsentsForUser(id);
	return prisma.user.update({
		where: { id },
		data: {
			...(data.name !== undefined ? { name: data.name } : {}),
		},
		include: {
			donorProfile: true,
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
