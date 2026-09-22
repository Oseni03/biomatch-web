"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/servers/audit";

const erasureSchema = z.object({
	password: z.string().min(1),
	confirmation: z.literal("DELETE"),
});

function splitRoles(role: string): string[] {
	return role
		.split(",")
		.map((entry) => entry.trim())
		.filter(Boolean);
}

export async function requestAccountDeletion(
	rawInput: unknown,
): Promise<{ anonymised: true }> {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user?.id) {
		throw new Error("Not authenticated");
	}
	return eraseAccountForUser(session.user.id, rawInput);
}

export async function eraseAccountForUser(
	userId: string,
	rawInput: unknown,
): Promise<{ anonymised: true }> {
	const input = erasureSchema.parse(rawInput);
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { id: true, email: true, anonymisedAt: true },
	});
	if (!user) {
		throw new Error("Account not found");
	}
	if (user.anonymisedAt) {
		throw new Error("This account has already been deleted");
	}

	const signIn = await auth.api.signInEmail({
		body: { email: user.email, password: input.password },
		headers: new Headers(),
		asResponse: true,
	});
	if (signIn.status !== 200) {
		throw new Error("The password you entered is incorrect");
	}

	const memberships = await prisma.member.findMany({
		where: { userId },
		select: { organizationId: true, role: true },
	});
	for (const membership of memberships) {
		if (!splitRoles(membership.role).includes("owner")) {
			continue;
		}
		const siblings = await prisma.member.findMany({
			where: {
				organizationId: membership.organizationId,
				NOT: { userId },
			},
			select: { role: true },
		});
		const hasOtherOwner = siblings.some((sibling) =>
			splitRoles(sibling.role).includes("owner"),
		);
		if (!hasOtherOwner) {
			throw new Error(
				"You are the sole owner of a hospital workspace. Transfer ownership to another staff member before deleting your account.",
			);
		}
	}

	await prisma.$executeRaw`SELECT anonymise_user(${userId}::uuid)`;

	await writeAuditLog({
		actorId: userId,
		action: "user.erasure",
		entityType: "user",
		entityId: userId,
	});

	return { anonymised: true };
}
