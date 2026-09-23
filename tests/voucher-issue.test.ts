import { randomUUID } from "node:crypto";
import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUniqueDonorCode } from "@/lib/donor-code";
import { recordConsentsForUser } from "@/servers/consent";
import { setMerchantActive, createMerchant } from "@/servers/merchants";
import { getWalletBalance, getWalletLedger } from "@/servers/wallet";
import {
	INSUFFICIENT_BALANCE_MESSAGE,
	MERCHANT_UNAVAILABLE_MESSAGE,
	VOUCHER_CODE_PATTERN,
} from "@/lib/constants";
import {
	issueVoucher,
	listVouchersForAdmin,
	listVouchersForDonor,
} from "@/servers/vouchers";
import { deleteUsersCompletely } from "./helpers";

const stamp = Date.now();
const password = "VoucherTest123!";
const CREDIT_KOBO = 200_000;

let adminId = "";
let donorId = "";
let merchantId = "";
let firstCode = "";

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

async function ledgerSum(userId: string): Promise<number> {
	const ledger = await getWalletLedger(userId, { page: 1, pageSize: 100 });
	return ledger.entries.reduce((sum, entry) => sum + entry.amountKobo, 0);
}

describe("Issue 21 donor redeems voucher", () => {
	it("sets up an admin, a funded donor and a merchant", async () => {
		const admin = await signUp(`voucher-admin-21-${stamp}@example.com`, "Voucher Admin");
		adminId = admin.userId;
		await prisma.user.update({ where: { id: adminId }, data: { role: "admin" } });
		await recordConsentsForUser(adminId, {});

		const donor = await signUp(`voucher-donor-21-${stamp}@example.com`, "Voucher Donor");
		donorId = donor.userId;
		await recordConsentsForUser(donorId, {});
		const code = await generateUniqueDonorCode(async (candidate) => {
			const existing = await prisma.donorProfile.findUnique({
				where: { donorCode: candidate },
				select: { userId: true },
			});
			return !!existing;
		});
		await prisma.donorProfile.create({
			data: {
				userId: donorId,
				donorCode: code,
				bloodGroup: "O_POS",
				state: "Lagos",
				verificationStatus: "verified",
			},
		});
		await prisma.walletTransaction.create({
			data: {
				donorId,
				entryType: "donation_reward",
				amountKobo: BigInt(CREDIT_KOBO),
				description: "Setup credit",
			},
		});

		const merchant = await createMerchant(adminId, {
			name: `VoucherMart ${stamp}`,
			category: "mart",
		});
		merchantId = merchant.id;
		assert.ok(merchantId);
	});

	it("issues a voucher with an unguessable code and debits the wallet", async () => {
		const issued = await issueVoucher(donorId, {
			merchantId,
			amountKobo: 50_000,
			idempotencyKey: randomUUID(),
		});
		firstCode = issued.code;
		assert.match(issued.code, VOUCHER_CODE_PATTERN);
		assert.equal(issued.status, "issued");
		assert.equal(issued.amountKobo, 50_000);
		assert.equal(issued.merchantName, `VoucherMart ${stamp}`);
		const validityMs = issued.expiresAt.getTime() - Date.now();
		assert.ok(validityMs > 89 * 24 * 60 * 60 * 1000 && validityMs <= 90 * 24 * 60 * 60 * 1000);

		const balance = await getWalletBalance(donorId);
		assert.equal(balance.balanceKobo, CREDIT_KOBO - 50_000);

		const ledger = await getWalletLedger(donorId, { page: 1, pageSize: 100 });
		const debit = ledger.entries.find((entry) => entry.redemptionId === issued.id);
		assert.ok(debit);
		assert.equal(debit.amountKobo, -50_000);
		assert.equal(debit.entryType, "redemption");
		assert.equal(balance.balanceKobo, await ledgerSum(donorId));
	});

	it("blocks overspend with a clear message and writes nothing", async () => {
		const before = await getWalletBalance(donorId);
		const vouchersBefore = await prisma.voucherRedemption.count({ where: { donorId } });
		const ledgerBefore = await getWalletLedger(donorId, { page: 1, pageSize: 100 });
		await assert.rejects(
			issueVoucher(donorId, {
				merchantId,
				amountKobo: before.balanceKobo + 100_000,
				idempotencyKey: randomUUID(),
			}),
			(error: unknown) =>
				error instanceof Error && error.message.includes(INSUFFICIENT_BALANCE_MESSAGE),
		);
		assert.equal(await prisma.voucherRedemption.count({ where: { donorId } }), vouchersBefore);
		assert.equal((await getWalletLedger(donorId, { page: 1, pageSize: 100 })).total, ledgerBefore.total);
		assert.equal((await getWalletBalance(donorId)).balanceKobo, before.balanceKobo);
	});

	it("double-submit with the same key yields one voucher and one debit", async () => {
		const key = randomUUID();
		const input = { merchantId, amountKobo: 10_000, idempotencyKey: key };
		const first = await issueVoucher(donorId, input);
		const replay = await issueVoucher(donorId, input);
		assert.equal(replay.id, first.id);
		assert.equal(replay.code, first.code);

		const racingKey = randomUUID();
		const racing = { merchantId, amountKobo: 10_000, idempotencyKey: racingKey };
		const [left, right] = await Promise.all([
			issueVoucher(donorId, racing),
			issueVoucher(donorId, racing),
		]);
		assert.equal(left.id, right.id);

		assert.equal(await prisma.voucherRedemption.count({ where: { donorId, idempotencyKey: key } }), 1);
		assert.equal(
			await prisma.voucherRedemption.count({ where: { donorId, idempotencyKey: racingKey } }),
			1,
		);
		const debits = await prisma.walletTransaction.count({
			where: { donorId, entryType: "redemption", OR: [{ redemptionId: first.id }, { redemptionId: left.id }] },
		});
		assert.equal(debits, 2);
		assert.equal((await getWalletBalance(donorId)).balanceKobo, await ledgerSum(donorId));
	});

	it("concurrent redemptions cannot overdraw; the database check decides", async () => {
		const balance = (await getWalletBalance(donorId)).balanceKobo;
		assert.ok(balance > 0);
		const outcomes = await Promise.allSettled([
			issueVoucher(donorId, { merchantId, amountKobo: balance, idempotencyKey: randomUUID() }),
			issueVoucher(donorId, { merchantId, amountKobo: balance, idempotencyKey: randomUUID() }),
		]);
		const fulfilled = outcomes.filter((outcome) => outcome.status === "fulfilled");
		const rejected = outcomes.filter((outcome) => outcome.status === "rejected");
		assert.equal(fulfilled.length, 1);
		assert.equal(rejected.length, 1);
		const reason = (rejected[0] as PromiseRejectedResult).reason;
		assert.ok(reason instanceof Error && reason.message.includes(INSUFFICIENT_BALANCE_MESSAGE));

		const finalBalance = (await getWalletBalance(donorId)).balanceKobo;
		assert.equal(finalBalance, 0);
		assert.equal(finalBalance, await ledgerSum(donorId));
	});

	it("refuses vouchers for deactivated merchants", async () => {
		await setMerchantActive(adminId, merchantId, false);
		await assert.rejects(
			issueVoucher(donorId, { merchantId, amountKobo: 1_000, idempotencyKey: randomUUID() }),
			(error: unknown) =>
				error instanceof Error && error.message.includes(MERCHANT_UNAVAILABLE_MESSAGE),
		);
		await setMerchantActive(adminId, merchantId, true);
	});

	it("donor sees their vouchers and admin sees them in the report", async () => {
		const mine = await listVouchersForDonor(donorId, { page: 1, pageSize: 50 });
		assert.ok(mine.total >= 3);
		assert.ok(mine.vouchers.some((voucher) => voucher.code === firstCode));
		const first = mine.vouchers.find((voucher) => voucher.code === firstCode);
		assert.equal(first?.merchantName, `VoucherMart ${stamp}`);

		const report = await listVouchersForAdmin(adminId, {});
		assert.ok(report.total >= 3);
		const reported = report.vouchers.find((voucher) => voucher.code === firstCode);
		assert.ok(reported);
		assert.ok(reported.donorEmail.includes("voucher-donor-21-"));
		assert.equal(reported.merchantName, `VoucherMart ${stamp}`);
		await assert.rejects(listVouchersForAdmin(donorId, {}));
	});

	after(async () => {
		await deleteUsersCompletely([adminId, donorId]);
		await prisma.merchantStaff.deleteMany({ where: { merchantId } }).catch(() => undefined);
		await prisma.merchant.deleteMany({ where: { id: merchantId } }).catch(() => undefined);
	});
});
