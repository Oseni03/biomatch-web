"use server";

import { prisma } from "@/lib/prisma";

export async function getDonationsForDonor(donorId: string) {
	return prisma.donation.findMany({
		where: { donorId },
		include: {
			hospitalBank: { select: { hospitalName: true } },
		},
		orderBy: { donatedAt: "desc" },
	});
}
