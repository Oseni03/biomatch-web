"use server";

import { prisma } from "@/lib/prisma";

export async function getWalletByUserId(userId: string) {
	return prisma.wallet.findUnique({
		where: { userId },
	});
}

export async function awardPoints(userId: string, points: number) {
	return prisma.wallet.update({
		where: { userId },
		data: {
			points: { increment: points },
			lifetimeDonations: { increment: 1 },
		},
	});
}

export async function deductPoints(userId: string, points: number) {
	return prisma.wallet.update({
		where: { userId },
		data: { points: { decrement: points } },
	});
}
