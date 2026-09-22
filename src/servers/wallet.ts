"use server";

import { prisma } from "@/lib/prisma";
import { requireConsentsForUser } from "@/servers/consent";

export interface WalletLedgerEntry {
	id: string;
	entryType: string;
	amountKobo: number;
	description: string | null;
	createdAt: Date;
	donationId: string | null;
	redemptionId: string | null;
}

export interface WalletLedgerResult {
	entries: WalletLedgerEntry[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export async function getWalletBalance(donorUserId: string): Promise<{ balanceKobo: number }> {
	await requireConsentsForUser(donorUserId);
	const wallet = await prisma.donorWallet.findUnique({
		where: { donorId: donorUserId },
		select: { balanceKobo: true },
	});
	return { balanceKobo: wallet ? Number(wallet.balanceKobo) : 0 };
}

export async function getWalletLedger(
	donorUserId: string,
	filters?: { page?: number; pageSize?: number },
): Promise<WalletLedgerResult> {
	await requireConsentsForUser(donorUserId);
	const page = Math.max(1, filters?.page ?? 1);
	const pageSize = Math.min(50, Math.max(1, filters?.pageSize ?? 10));
	const where = { donorId: donorUserId };
	const [total, rows] = await Promise.all([
		prisma.walletTransaction.count({ where }),
		prisma.walletTransaction.findMany({
			where,
			orderBy: { createdAt: "desc" },
			skip: (page - 1) * pageSize,
			take: pageSize,
			select: {
				id: true,
				entryType: true,
				amountKobo: true,
				description: true,
				createdAt: true,
				donationId: true,
				redemptionId: true,
			},
		}),
	]);
	return {
		entries: rows.map((row) => ({
			id: row.id,
			entryType: String(row.entryType),
			amountKobo: Number(row.amountKobo),
			description: row.description,
			createdAt: row.createdAt,
			donationId: row.donationId,
			redemptionId: row.redemptionId,
		})),
		total,
		page,
		pageSize,
		totalPages: Math.max(1, Math.ceil(total / pageSize)),
	};
}
