"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { Prisma } from "@generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/servers/admin";
import { requireConsentsForUser } from "@/servers/consent";
import { writeAuditLog } from "@/servers/audit";

const appUrl = process.env.APP_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

const merchantSchema = z.object({
	name: z.string().trim().min(1, "A merchant name is required").max(120),
	category: z.string().trim().max(60).optional(),
	address: z.string().trim().max(500).optional(),
});

const merchantUpdateSchema = merchantSchema.partial();

const staffSchema = z.object({
	name: z.string().trim().min(1, "A staff name is required").max(120),
	email: z.string().trim().email("A valid email is required").max(255),
});

export interface MerchantListItem {
	id: string;
	name: string;
	category: string | null;
	address: string | null;
	isActive: boolean;
	createdAt: Date;
	staffCount: number;
	issuedCount: number;
}

export interface MerchantListResult {
	merchants: MerchantListItem[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export interface MerchantStaffItem {
	id: string;
	userId: string;
	name: string;
	email: string;
	isActive: boolean;
	createdAt: Date;
}

export async function listMerchants(
	callerUserId: string,
	rawFilters?: unknown,
): Promise<MerchantListResult> {
	await requireAdmin(callerUserId);
	const filters = z
		.object({
			includeInactive: z.coerce.boolean().default(false),
			page: z.coerce.number().int().min(1).default(1),
			pageSize: z.coerce.number().int().min(1).max(100).default(20),
		})
		.parse(rawFilters ?? {});
	const where = filters.includeInactive ? {} : { isActive: true };
	const [total, rows] = await Promise.all([
		prisma.merchant.count({ where }),
		prisma.merchant.findMany({
			where,
			orderBy: { createdAt: "desc" },
			skip: (filters.page - 1) * filters.pageSize,
			take: filters.pageSize,
			select: {
				id: true,
				name: true,
				category: true,
				address: true,
				isActive: true,
				createdAt: true,
				_count: { select: { staff: true, redemptions: true } },
			},
		}),
	]);
	return {
		merchants: rows.map((row) => ({
			id: row.id,
			name: row.name,
			category: row.category,
			address: row.address,
			isActive: row.isActive,
			createdAt: row.createdAt,
			staffCount: row._count.staff,
			issuedCount: row._count.redemptions,
		})),
		total,
		page: filters.page,
		pageSize: filters.pageSize,
		totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
	};
}

export async function listActiveMerchants(
	callerUserId: string,
): Promise<{ id: string; name: string; category: string | null }[]> {
	await requireConsentsForUser(callerUserId);
	return prisma.merchant.findMany({
		where: { isActive: true },
		orderBy: { name: "asc" },
		select: { id: true, name: true, category: true },
	});
}

export async function getMerchantDetail(
	callerUserId: string,
	merchantId: string,
): Promise<{ merchant: MerchantListItem; staff: MerchantStaffItem[] } | null> {
	await requireAdmin(callerUserId);
	const merchant = await prisma.merchant.findUnique({
		where: { id: merchantId },
		select: {
			id: true,
			name: true,
			category: true,
			address: true,
			isActive: true,
			createdAt: true,
			_count: { select: { staff: true, redemptions: true } },
			staff: {
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					userId: true,
					isActive: true,
					createdAt: true,
					user: { select: { name: true, email: true } },
				},
			},
		},
	});
	if (!merchant) return null;
	return {
		merchant: {
			id: merchant.id,
			name: merchant.name,
			category: merchant.category,
			address: merchant.address,
			isActive: merchant.isActive,
			createdAt: merchant.createdAt,
			staffCount: merchant._count.staff,
			issuedCount: merchant._count.redemptions,
		},
		staff: merchant.staff.map((row) => ({
			id: row.id,
			userId: row.userId,
			name: row.user.name,
			email: row.user.email,
			isActive: row.isActive,
			createdAt: row.createdAt,
		})),
	};
}

export async function createMerchant(
	callerUserId: string,
	rawInput: unknown,
): Promise<{ id: string }> {
	await requireAdmin(callerUserId);
	const input = merchantSchema.parse(rawInput);
	const merchant = await prisma.merchant.create({
		data: {
			name: input.name,
			category: input.category || undefined,
			address: input.address || undefined,
		},
		select: { id: true },
	});
	await writeAuditLog({
		actorId: callerUserId,
		action: "merchant.create",
		entityType: "merchant",
		entityId: merchant.id,
		metadata: { name: input.name },
	});
	return { id: merchant.id };
}

export async function updateMerchant(
	callerUserId: string,
	merchantId: string,
	rawInput: unknown,
): Promise<void> {
	await requireAdmin(callerUserId);
	const input = merchantUpdateSchema.parse(rawInput);
	await prisma.merchant.update({
		where: { id: merchantId },
		data: {
			...(input.name !== undefined ? { name: input.name } : {}),
			...(input.category !== undefined ? { category: input.category || null } : {}),
			...(input.address !== undefined ? { address: input.address || null } : {}),
		},
	});
	await writeAuditLog({
		actorId: callerUserId,
		action: "merchant.update",
		entityType: "merchant",
		entityId: merchantId,
		metadata: input as Record<string, unknown>,
	});
}

export async function setMerchantActive(
	callerUserId: string,
	merchantId: string,
	isActive: boolean,
): Promise<void> {
	await requireAdmin(callerUserId);
	await prisma.merchant.update({ where: { id: merchantId }, data: { isActive } });
	await writeAuditLog({
		actorId: callerUserId,
		action: isActive ? "merchant.activate" : "merchant.deactivate",
		entityType: "merchant",
		entityId: merchantId,
	});
}

export async function addMerchantStaff(
	callerUserId: string,
	merchantId: string,
	userId: string,
): Promise<{ staffId: string }> {
	await requireAdmin(callerUserId);
	const merchant = await prisma.merchant.findUnique({
		where: { id: merchantId },
		select: { id: true },
	});
	if (!merchant) {
		throw new Error("Merchant not found");
	}
	try {
		const link = await prisma.merchantStaff.create({
			data: { merchantId, userId },
			select: { id: true },
		});
		await writeAuditLog({
			actorId: callerUserId,
			action: "merchant.staff_add",
			entityType: "merchant_staff",
			entityId: link.id,
			metadata: { merchantId, userId },
		});
		return { staffId: link.id };
	} catch (caught) {
		if (caught instanceof Prisma.PrismaClientKnownRequestError && caught.code === "P2002") {
			throw new Error("This account is already staff of this merchant");
		}
		throw caught;
	}
}

export async function createMerchantStaff(
	callerUserId: string,
	merchantId: string,
	rawInput: unknown,
): Promise<{ userId: string; created: boolean }> {
	await requireAdmin(callerUserId);
	const input = staffSchema.parse(rawInput);
	const merchant = await prisma.merchant.findUnique({
		where: { id: merchantId },
		select: { id: true, name: true },
	});
	if (!merchant) {
		throw new Error("Merchant not found");
	}
	const existing = await prisma.user.findUnique({
		where: { email: input.email },
		select: { id: true },
	});
	if (existing) {
		await addMerchantStaff(callerUserId, merchantId, existing.id);
		return { userId: existing.id, created: false };
	}
	const created = (await auth.api.createUser({
		body: {
			email: input.email,
			password: `${crypto.randomUUID()}Aa1!`,
			name: input.name,
			role: "user",
		},
		headers: await headers(),
	} as Parameters<typeof auth.api.createUser>[0])) as { user?: { id?: string } };
	const userId = created?.user?.id;
	if (!userId) {
		throw new Error("Could not create the staff account");
	}
	await addMerchantStaff(callerUserId, merchantId, userId);
	await auth.api
		.requestPasswordReset({
			body: { email: input.email, redirectTo: `${appUrl}/auth/reset-password` },
			headers: await headers(),
		})
		.catch(() => undefined);
	return { userId, created: true };
}

export async function setMerchantStaffActive(
	callerUserId: string,
	staffId: string,
	isActive: boolean,
): Promise<void> {
	await requireAdmin(callerUserId);
	const updated = await prisma.merchantStaff.update({
		where: { id: staffId },
		data: { isActive },
		select: { id: true, merchantId: true, userId: true },
	});
	await writeAuditLog({
		actorId: callerUserId,
		action: isActive ? "merchant.staff_enable" : "merchant.staff_disable",
		entityType: "merchant_staff",
		entityId: updated.id,
		metadata: { merchantId: updated.merchantId, userId: updated.userId },
	});
}

export async function getMerchantPortalContext(
	callerUserId: string,
): Promise<{ merchantId: string; merchantName: string } | null> {
	await requireConsentsForUser(callerUserId);
	const link = await prisma.merchantStaff.findFirst({
		where: { userId: callerUserId, isActive: true, merchant: { isActive: true } },
		orderBy: { createdAt: "asc" },
		select: { merchantId: true, merchant: { select: { name: true } } },
	});
	if (!link) return null;
	return { merchantId: link.merchantId, merchantName: link.merchant.name };
}
