"use server";

import { prisma } from "@/lib/prisma";
import { getSessionRole } from "@/servers/user";

export type WalkthroughAudience = "donor" | "hospital" | "admin";

export type WalkthroughState = {
	completed: boolean;
	audience: WalkthroughAudience;
};

export async function getWalkthroughState(
	userId: string,
): Promise<WalkthroughState> {
	const [role, user] = await Promise.all([
		getSessionRole(userId),
		prisma.user.findUnique({
			where: { id: userId },
			select: { onboardedAt: true },
		}),
	]);
	if (!user) {
		throw new Error("Account not found");
	}
	return {
		completed: user.onboardedAt != null,
		audience: (role ?? "donor") as WalkthroughAudience,
	};
}

export async function completeWalkthrough(
	userId: string,
): Promise<{ completed: true }> {
	await prisma.user.update({
		where: { id: userId },
		data: { onboardedAt: new Date() },
	});
	return { completed: true };
}

export async function resetWalkthrough(
	userId: string,
): Promise<{ completed: false }> {
	await prisma.user.update({
		where: { id: userId },
		data: { onboardedAt: null },
	});
	return { completed: false };
}
