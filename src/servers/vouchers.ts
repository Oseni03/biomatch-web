"use server";

import { randomBytes } from "node:crypto";
import { z } from "zod";
import { Prisma } from "@generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { VOUCHER_VALIDITY_DAYS } from "@/lib/config";
import { requireConsentsForUser } from "@/servers/consent";
import { requireAdmin } from "@/servers/admin";
import { writeAuditLog } from "@/servers/audit";

export const INSUFFICIENT_BALANCE_MESSAGE =
	"Insufficient wallet balance for this voucher amount.";
export const MERCHANT_UNAVAILABLE_MESSAGE =
	"This merchant is no longer accepting vouchers.";

const issueSchema = z.object({
	merchantId: z.string().uuid("Choose a merchant"),
	amountKobo: z.coerce.number().int().min(1, "Enter an amount of at least ₦0.01"),
	idempotencyKey: z.string().min(1).max(64),
});

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export const VOUCHER_CODE_PATTERN = /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/;

function generateVoucherCode(): string {
	const bytes = randomBytes(12);
	const chars = Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]);
	return `${chars.slice(0, 4).join("")}-${chars.slice(4, 8).join("")}-${chars.slice(8, 12).join("")}`;
}

async function generateUniqueCode(): Promise<string> {
	for (let attempt = 0; attempt < 5; attempt += 1) {
		const code = generateVoucherCode();
		const existing = await prisma.voucherRedemption.findUnique({
			where: { code },
			select: { id: true },
		});
		if (!existing) {
			return code;
		}
	}
	throw new Error("Could not generate a unique voucher code. Please try again.");
}

function errorText(error: unknown): string {
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		return `${error.code} ${error.message} ${JSON.stringify(error.meta ?? {})}`;
	}
	return error instanceof Error ? error.message : String(error);
}

function isBalanceCheckViolation(error: unknown): boolean {
	return errorText(error).includes("donor_wallets_balance_chk");
}

function isIdempotencyConflict(error: unknown): boolean {
	return (
		error instanceof Prisma.PrismaClientKnownRequestError &&
		error.code === "P2002" &&
		errorText(error).includes("idempotency")
	);
}

function isCodeConflict(error: unknown): boolean {
	return (
		error instanceof Prisma.PrismaClientKnownRequestError &&
		error.code === "P2002" &&
		!errorText(error).includes("idempotency")
	);
}

export interface IssuedVoucher {
	id: string;
	code: string;
	merchantId: string;
	merchantName: string;
	amountKobo: number;
	status: string;
	issuedAt: Date;
	expiresAt: Date;
}

interface VoucherRow {
	id: string;
	code: string;
	merchantId: string;
	amountKobo: bigint;
	status: unknown;
	issuedAt: Date;
	expiresAt: Date;
	merchant: { name: string };
}

function toIssuedVoucher(row: VoucherRow): IssuedVoucher {
	return {
		id: row.id,
		code: row.code,
		merchantId: row.merchantId,
		merchantName: row.merchant.name,
		amountKobo: Number(row.amountKobo),
		status: String(row.status),
		issuedAt: row.issuedAt,
		expiresAt: row.expiresAt,
	};
}

const voucherSelect = {
	id: true,
	code: true,
	merchantId: true,
	amountKobo: true,
	status: true,
	issuedAt: true,
	expiresAt: true,
	merchant: { select: { name: true } },
} as const;

export async function issueVoucher(
	donorUserId: string,
	rawInput: unknown,
): Promise<IssuedVoucher> {
	await requireConsentsForUser(donorUserId);
	const input = issueSchema.parse(rawInput);

	const merchant = await prisma.merchant.findUnique({
		where: { id: input.merchantId },
		select: { id: true, name: true, isActive: true },
	});
	if (!merchant || !merchant.isActive) {
		throw new Error(MERCHANT_UNAVAILABLE_MESSAGE);
	}

	const replay = await prisma.voucherRedemption.findFirst({
		where: { donorId: donorUserId, idempotencyKey: input.idempotencyKey },
		select: voucherSelect,
	});
	if (replay) {
		if (
			replay.merchantId !== input.merchantId ||
			Number(replay.amountKobo) !== input.amountKobo
		) {
			throw new Error(
				"This redemption was already submitted with different details. Start a new redemption.",
			);
		}
		return toIssuedVoucher(replay);
	}

	const wallet = await prisma.donorWallet.findUnique({
		where: { donorId: donorUserId },
		select: { balanceKobo: true },
	});
	if (!wallet || Number(wallet.balanceKobo) < input.amountKobo) {
		throw new Error(INSUFFICIENT_BALANCE_MESSAGE);
	}

	for (let attempt = 0; attempt < 3; attempt += 1) {
		const code = await generateUniqueCode();
		try {
			const created = await prisma.$transaction(async (tx) => {
				const voucher = await tx.voucherRedemption.create({
					data: {
						donorId: donorUserId,
						merchantId: merchant.id,
						amountKobo: BigInt(input.amountKobo),
						code,
						expiresAt: new Date(Date.now() + VOUCHER_VALIDITY_DAYS * 24 * 60 * 60 * 1000),
						idempotencyKey: input.idempotencyKey,
					},
					select: voucherSelect,
				});
				await tx.walletTransaction.create({
					data: {
						donorId: donorUserId,
						entryType: "redemption",
						amountKobo: BigInt(-input.amountKobo),
						redemptionId: voucher.id,
						description: `Voucher ${code} at ${merchant.name}`,
					},
				});
				return voucher;
			});
			await writeAuditLog({
				actorId: donorUserId,
				action: "voucher.issue",
				entityType: "voucher_redemption",
				entityId: created.id,
				metadata: { merchantId: merchant.id, amountKobo: input.amountKobo },
			});
			return toIssuedVoucher(created);
		} catch (error) {
			if (isIdempotencyConflict(error)) {
				const replayed = await prisma.voucherRedemption.findFirst({
					where: { donorId: donorUserId, idempotencyKey: input.idempotencyKey },
					select: voucherSelect,
				});
				if (replayed) {
					return toIssuedVoucher(replayed);
				}
				throw error;
			}
			if (isBalanceCheckViolation(error)) {
				throw new Error(INSUFFICIENT_BALANCE_MESSAGE);
			}
			if (isCodeConflict(error)) {
				continue;
			}
			throw error;
		}
	}
	throw new Error("Could not issue the voucher. Please try again.");
}

export interface VoucherListItem {
	id: string;
	code: string;
	merchantName: string;
	amountKobo: number;
	status: string;
	issuedAt: Date;
	expiresAt: Date;
	redeemedAt: Date | null;
}

export interface VoucherListResult {
	vouchers: VoucherListItem[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export async function listVouchersForDonor(
	donorUserId: string,
	filters?: { page?: number; pageSize?: number },
): Promise<VoucherListResult> {
	await requireConsentsForUser(donorUserId);
	const page = Math.max(1, filters?.page ?? 1);
	const pageSize = Math.min(50, Math.max(1, filters?.pageSize ?? 10));
	const where = { donorId: donorUserId };
	const [total, rows] = await Promise.all([
		prisma.voucherRedemption.count({ where }),
		prisma.voucherRedemption.findMany({
			where,
			orderBy: { issuedAt: "desc" },
			skip: (page - 1) * pageSize,
			take: pageSize,
			select: {
				id: true,
				code: true,
				amountKobo: true,
				status: true,
				issuedAt: true,
				expiresAt: true,
				redeemedAt: true,
				merchant: { select: { name: true } },
			},
		}),
	]);
	return {
		vouchers: rows.map((row) => ({
			id: row.id,
			code: row.code,
			merchantName: row.merchant.name,
			amountKobo: Number(row.amountKobo),
			status: String(row.status),
			issuedAt: row.issuedAt,
			expiresAt: row.expiresAt,
			redeemedAt: row.redeemedAt,
		})),
		total,
		page,
		pageSize,
		totalPages: Math.max(1, Math.ceil(total / pageSize)),
	};
}

export interface AdminVoucherListItem extends VoucherListItem {
	donorName: string;
	donorEmail: string;
	merchantId: string;
}

export interface AdminVoucherListResult {
	vouchers: AdminVoucherListItem[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export async function listVouchersForAdmin(
	callerUserId: string,
	rawFilters?: unknown,
): Promise<AdminVoucherListResult> {
	await requireAdmin(callerUserId);
	const filters = z
		.object({
			merchantId: z.string().uuid().optional(),
			status: z.enum(["issued", "redeemed", "expired", "cancelled"]).optional(),
			page: z.coerce.number().int().min(1).default(1),
			pageSize: z.coerce.number().int().min(1).max(100).default(20),
		})
		.parse(rawFilters ?? {});
	const where = {
		...(filters.merchantId ? { merchantId: filters.merchantId } : {}),
		...(filters.status ? { status: filters.status } : {}),
	};
	const [total, rows] = await Promise.all([
		prisma.voucherRedemption.count({ where }),
		prisma.voucherRedemption.findMany({
			where,
			orderBy: { issuedAt: "desc" },
			skip: (filters.page - 1) * filters.pageSize,
			take: filters.pageSize,
			select: {
				id: true,
				code: true,
				merchantId: true,
				amountKobo: true,
				status: true,
				issuedAt: true,
				expiresAt: true,
				redeemedAt: true,
				merchant: { select: { name: true } },
				donor: { select: { user: { select: { name: true, email: true } } } },
			},
		}),
	]);
	return {
		vouchers: rows.map((row) => ({
			id: row.id,
			code: row.code,
			merchantId: row.merchantId,
			merchantName: row.merchant.name,
			donorName: row.donor.user.name ?? "",
			donorEmail: row.donor.user.email,
			amountKobo: Number(row.amountKobo),
			status: String(row.status),
			issuedAt: row.issuedAt,
			expiresAt: row.expiresAt,
			redeemedAt: row.redeemedAt,
		})),
		total,
		page: filters.page,
		pageSize: filters.pageSize,
		totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
	};
}
