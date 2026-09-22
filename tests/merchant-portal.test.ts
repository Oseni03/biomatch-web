import { randomUUID } from "node:crypto";
import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUniqueDonorCode } from "@/lib/donor-code";
import { recordConsentsForUser } from "@/servers/consent";
import {
	VOUCHER_REDEEM_FAILED_MESSAGE,
	addMerchantStaff,
	createMerchant,
	listMerchantRedemptions,
	previewVoucherCode,
	redeemVoucherCode,
	setMerchantActive,
	setMerchantStaffActive,
} from "@/servers/merchants";
import { getWalletBalance } from "@/servers/wallet";
import { issueVoucher } from "@/servers/vouchers";
import { deleteUsersCompletely } from "./helpers";

const stamp = Date.now();
const password = "PortalTest123!";

let adminId = "";
let staffId = "";
let staffLinkId = "";
let donorId = "";
let donorCode = "";
let merchantAId = "";
let merchantBId = "";
let voucherA = "";
let voucherB = "";

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

async function issueFor(merchantId: string, amountKobo: number): Promise<string> {
	const issued = await issueVoucher(donorId, {
		merchantId,
		amountKobo,
		idempotencyKey: randomUUID(),
	});
	return issued.code;
}

async function failureMessage(run: () => Promise<unknown>): Promise<string> {
	try {
		await run();
	} catch (error) {
		assert.ok(error instanceof Error);
		return error.message;
	}
	assert.fail("expected redemption to fail");
}

describe("Issue 22 merchant portal redeem codes", () => {
	it("sets up an admin, two merchants, linked staff and funded vouchers", async () => {
		const admin = await signUp(`portal-admin-22-${stamp}@example.com`, "Portal Admin");
		adminId = admin.userId;
		await prisma.user.update({ where: { id: adminId }, data: { role: "admin" } });
		await recordConsentsForUser(adminId, {});

		const staff = await signUp(`portal-staff-22-${stamp}@example.com`, "Portal Cashier");
		staffId = staff.userId;
		await recordConsentsForUser(staffId, {});

		const donor = await signUp(`portal-donor-22-${stamp}@example.com`, "Portal Donor");
		donorId = donor.userId;
		await recordConsentsForUser(donorId, {});
		donorCode = await generateUniqueDonorCode(async (candidate) => {
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

		merchantAId = (await createMerchant(adminId, { name: `PortalMart A ${stamp}` })).id;
		merchantBId = (await createMerchant(adminId, { name: `PortalMart B ${stamp}` })).id;
		staffLinkId = (await addMerchantStaff(adminId, merchantAId, staffId)).staffId;

		voucherA = await issueFor(merchantAId, 50_000);
		voucherB = await issueFor(merchantBId, 30_000);
	});

	it("previews the amount and redeems a valid code exactly once", async () => {
		const preview = await previewVoucherCode(staffId, voucherA.toLowerCase());
		assert.equal(preview.amountKobo, 50_000);
		assert.equal(preview.merchantName, `PortalMart A ${stamp}`);

		const balanceBefore = (await getWalletBalance(donorId)).balanceKobo;
		const receipt = await redeemVoucherCode(staffId, `  ${voucherA} `);
		assert.equal(receipt.code, voucherA);
		assert.equal(receipt.amountKobo, 50_000);
		assert.ok(receipt.redeemedAt instanceof Date);
		assert.equal((await getWalletBalance(donorId)).balanceKobo, balanceBefore);

		const row = await prisma.voucherRedemption.findUnique({
			where: { code: voucherA },
			select: { status: true, redeemedAt: true, redeemedByUserId: true },
		});
		assert.equal(String(row?.status), "redeemed");
		assert.ok(row?.redeemedAt instanceof Date);
		assert.equal(row?.redeemedByUserId, staffId);

		assert.equal(
			await failureMessage(() => redeemVoucherCode(staffId, voucherA)),
			VOUCHER_REDEEM_FAILED_MESSAGE,
		);
	});

	it("concurrent redemption of one code lets exactly one claim through", async () => {
		const code = await issueFor(merchantAId, 20_000);
		const outcomes = await Promise.allSettled([
			redeemVoucherCode(staffId, code),
			redeemVoucherCode(staffId, code),
		]);
		assert.equal(outcomes.filter((o) => o.status === "fulfilled").length, 1);
		const rejected = outcomes.filter((o) => o.status === "rejected");
		assert.equal(rejected.length, 1);
		assert.equal(
			((rejected[0] as PromiseRejectedResult).reason as Error).message,
			VOUCHER_REDEEM_FAILED_MESSAGE,
		);
	});

	it("expired, used, unknown and other-merchant codes fail identically", async () => {
		const expiring = await issueFor(merchantAId, 10_000);
		await prisma.voucherRedemption.update({
			where: { code: expiring },
			data: { expiresAt: new Date(Date.now() - 1000) },
		});
		const cases = [expiring, voucherA, "AAAA-2222-BBBB", voucherB];
		for (const code of cases) {
			assert.equal(
				await failureMessage(() => previewVoucherCode(staffId, code)),
				VOUCHER_REDEEM_FAILED_MESSAGE,
			);
			assert.equal(
				await failureMessage(() => redeemVoucherCode(staffId, code)),
				VOUCHER_REDEEM_FAILED_MESSAGE,
			);
		}
	});

	it("non-staff callers get the same generic failure, not a staff oracle", async () => {
		const fresh = await issueFor(merchantAId, 5_000);
		assert.equal(
			await failureMessage(() => previewVoucherCode(donorId, fresh)),
			VOUCHER_REDEEM_FAILED_MESSAGE,
		);
		assert.equal(
			await failureMessage(() => redeemVoucherCode(donorId, fresh)),
			VOUCHER_REDEEM_FAILED_MESSAGE,
		);
	});

	it("access follows the active staff link and active merchant", async () => {
		const fresh = await issueFor(merchantAId, 5_000);
		await setMerchantStaffActive(adminId, staffLinkId, false);
		assert.equal(
			await failureMessage(() => redeemVoucherCode(staffId, fresh)),
			VOUCHER_REDEEM_FAILED_MESSAGE,
		);
		await setMerchantStaffActive(adminId, staffLinkId, true);

		await setMerchantActive(adminId, merchantAId, false);
		assert.equal(
			await failureMessage(() => previewVoucherCode(staffId, fresh)),
			VOUCHER_REDEEM_FAILED_MESSAGE,
		);
		await setMerchantActive(adminId, merchantAId, true);

		const receipt = await redeemVoucherCode(staffId, fresh);
		assert.equal(receipt.code, fresh);
	});

	it("history lists the merchant redemptions with donor code and staff name", async () => {
		const history = await listMerchantRedemptions(staffId, { page: 1, pageSize: 50 });
		assert.ok(history.total >= 3);
		const redeemed = history.redemptions.find((item) => item.code === voucherA);
		assert.ok(redeemed);
		assert.equal(redeemed.amountKobo, 50_000);
		assert.equal(redeemed.status, "redeemed");
		assert.equal(redeemed.donorCode, donorCode);
		assert.equal(redeemed.redeemedByName, "Portal Cashier");

		const stranger = await listMerchantRedemptions(donorId, {});
		assert.equal(stranger.total, 0);
		const otherMerchant = await listMerchantRedemptions(staffId, { merchantId: merchantBId });
		assert.equal(otherMerchant.total, 0);
	});

	it("staff without consents are gated like everyone else", async () => {
		const raw = await signUp(`portal-raw-22-${stamp}@example.com`, "Portal Raw");
		await addMerchantStaff(adminId, merchantAId, raw.userId);
		await assert.rejects(previewVoucherCode(raw.userId, voucherB), /consent/i);
		await assert.rejects(redeemVoucherCode(raw.userId, voucherB), /consent/i);
		await deleteUsersCompletely([raw.userId]);
	});

	after(async () => {
		await deleteUsersCompletely([adminId, staffId, donorId]);
		for (const id of [merchantAId, merchantBId]) {
			await prisma.merchantStaff.deleteMany({ where: { merchantId: id } }).catch(() => undefined);
			await prisma.voucherRedemption.deleteMany({ where: { merchantId: id } }).catch(() => undefined);
			await prisma.merchant.deleteMany({ where: { id } }).catch(() => undefined);
		}
	});
});
