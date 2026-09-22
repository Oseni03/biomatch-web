import { randomUUID } from "node:crypto";
import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUniqueDonorCode } from "@/lib/donor-code";
import { recordConsentsForUser } from "@/servers/consent";
import { createMerchant } from "@/servers/merchants";
import { getWalletBalance, getWalletLedger } from "@/servers/wallet";
import { issueVoucher, sweepExpiredVouchers } from "@/servers/vouchers";
import { GET as expireVouchers } from "@/app/api/cron/expire-vouchers/route";
import { deleteUsersCompletely } from "./helpers";

const stamp = Date.now();
const password = "ExpiryTest123!";

let adminId = "";
let donorId = "";
let merchantId = "";
let pastDueCode = "";
let freshCode = "";
let usedCode = "";

async function signUp(email: string, name: string): Promise<{ userId: string }> {
	const response = await auth.api.signUpEmail({
		body: { email, password, name },
		headers: new Headers(),
		asResponse: true,
	});
	assert.equal(response.status, 200);
	const data = (await response.json()) as { user?: { id?: string } };
	assert.ok(data?.user?.id);
	return { userId: data.user.id as string };
}

async function statusOf(code: string): Promise<string> {
	const row = await prisma.voucherRedemption.findUnique({
		where: { code },
		select: { status: true },
	});
	return String(row?.status);
}

describe("Issue 23 voucher expiry policy and sweep", () => {
	it("sets up an admin, a merchant and a funded donor with three vouchers", async () => {
		const admin = await signUp(`expiry-admin-23-${stamp}@example.com`, "Expiry Admin");
		adminId = admin.userId;
		await prisma.user.update({ where: { id: adminId }, data: { role: "admin" } });
		await recordConsentsForUser(adminId, {});

		const donor = await signUp(`expiry-donor-23-${stamp}@example.com`, "Expiry Donor");
		donorId = donor.userId;
		await recordConsentsForUser(donorId, {});
		const donorCode = await generateUniqueDonorCode(async (candidate) => {
			const existing = await prisma.donorProfile.findUnique({
				where: { donorCode: candidate },
				select: { userId: true },
			});
			return !!existing;
		});
		await prisma.donorProfile.create({
			data: {
				userId: donorId,
				donorCode,
				bloodGroup: "O_POS",
				state: "Lagos",
				verificationStatus: "verified",
			},
		});
		await prisma.walletTransaction.create({
			data: {
				donorId,
				entryType: "donation_reward",
				amountKobo: BigInt(300_000),
				description: "Setup credit",
			},
		});

		merchantId = (await createMerchant(adminId, { name: `ExpiryMart ${stamp}` })).id;
		for (const [key, amount] of [["past", 40_000], ["fresh", 40_000], ["used", 40_000]] as const) {
			const issued = await issueVoucher(donorId, {
				merchantId,
				amountKobo: amount,
				idempotencyKey: randomUUID(),
			});
			if (key === "past") pastDueCode = issued.code;
			if (key === "fresh") freshCode = issued.code;
			if (key === "used") usedCode = issued.code;
		}
		await prisma.voucherRedemption.update({
			where: { code: pastDueCode },
			data: { expiresAt: new Date(Date.now() - 60_000) },
		});
		await prisma.voucherRedemption.update({
			where: { code: usedCode },
			data: {
				status: "redeemed",
				redeemedAt: new Date(),
				redeemedByUserId: adminId,
			},
		});
	});

	it("expires only past-due issued vouchers and is idempotent", async () => {
		const first = await sweepExpiredVouchers();
		assert.equal(first.expiredCount, 1);
		assert.equal(await statusOf(pastDueCode), "expired");
		assert.equal(await statusOf(freshCode), "issued");
		assert.equal(await statusOf(usedCode), "redeemed");

		const second = await sweepExpiredVouchers();
		assert.equal(second.expiredCount, 0);
		assert.equal(await statusOf(pastDueCode), "expired");
	});

	it("forfeits with no refund: balance and ledger untouched", async () => {
		const balance = await getWalletBalance(donorId);
		assert.equal(balance.balanceKobo, 300_000 - 3 * 40_000);
		const ledger = await getWalletLedger(donorId, { page: 1, pageSize: 100 });
		assert.equal(ledger.total, 4);
		assert.ok(
			ledger.entries.every(
				(entry) => entry.entryType === "donation_reward" || entry.entryType === "redemption",
			),
		);
	});

	it("the cron route requires the bearer secret", async () => {
		const previous = process.env.CRON_SECRET;
		process.env.CRON_SECRET = `test-secret-23-${stamp}`;
		try {
			const denied = await expireVouchers(new Request("http://localhost/api/cron/expire-vouchers"));
			assert.equal(denied.status, 401);
			const wrong = await expireVouchers(
				new Request("http://localhost/api/cron/expire-vouchers", {
					headers: { authorization: "Bearer wrong" },
				}),
			);
			assert.equal(wrong.status, 401);
			const allowed = await expireVouchers(
				new Request("http://localhost/api/cron/expire-vouchers", {
					headers: { authorization: `Bearer test-secret-23-${stamp}` },
				}),
			);
			assert.equal(allowed.status, 200);
			const body = (await allowed.json()) as { expiredCount?: number };
			assert.equal(typeof body.expiredCount, "number");
		} finally {
			if (previous === undefined) {
				delete process.env.CRON_SECRET;
			} else {
				process.env.CRON_SECRET = previous;
			}
		}
	});

	after(async () => {
		await deleteUsersCompletely([adminId, donorId]);
		await prisma.merchantStaff.deleteMany({ where: { merchantId } }).catch(() => undefined);
		await prisma.voucherRedemption.deleteMany({ where: { merchantId } }).catch(() => undefined);
		await prisma.merchant.deleteMany({ where: { id: merchantId } }).catch(() => undefined);
	});
});
