import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUniqueDonorCode } from "@/lib/donor-code";
import { formatKoboToNaira } from "@/lib/money";
import { recordConsentsForUser } from "@/servers/consent";
import { getWalletBalance, getWalletLedger } from "@/servers/wallet";
import { deleteUsersCompletely } from "./helpers";

const stamp = Date.now();
const password = "RewardsTest123!";

const donors: Record<string, string> = {};

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

async function makeDonor(key: string): Promise<string> {
	const signed = await signUp(`rewards-${key}-19-${stamp}@example.com`, `Donor ${key}`);
	await recordConsentsForUser(signed.userId, {});
	const code = await generateUniqueDonorCode(async (candidate) => {
		const existing = await prisma.donorProfile.findUnique({
			where: { donorCode: candidate },
			select: { userId: true },
		});
		return !!existing;
	});
	await prisma.donorProfile.create({
		data: {
			userId: signed.userId,
			donorCode: code,
			bloodGroup: "O_POS",
			state: "Lagos",
			verificationStatus: "verified",
		},
	});
	donors[key] = signed.userId;
	return signed.userId;
}

describe("Issue 19 rewards wallet screen", () => {
	it("formats kobo to naira with no rounding errors", () => {
		assert.equal(formatKoboToNaira(100_000), "₦1,000.00");
		assert.equal(formatKoboToNaira(0), "₦0.00");
		assert.equal(formatKoboToNaira(5), "₦0.05");
		assert.equal(formatKoboToNaira(-250), "-₦2.50");
		assert.equal(formatKoboToNaira(123_456_789), "₦1,234,567.89");
	});

	it("returns a zero balance and empty ledger for a new donor", async () => {
		const donorId = await makeDonor("fresh");
		const balance = await getWalletBalance(donorId);
		assert.equal(balance.balanceKobo, 0);
		const ledger = await getWalletLedger(donorId);
		assert.equal(ledger.total, 0);
		assert.deepEqual(ledger.entries, []);
	});

	it("shows donation credits with date and description", async () => {
		const donorId = await makeDonor("earner");
		await prisma.walletTransaction.create({
			data: {
				donorId,
				entryType: "donation_reward",
				amountKobo: BigInt(100_000),
				description: "Reward for a completed blood donation",
			},
		});
		const balance = await getWalletBalance(donorId);
		assert.equal(balance.balanceKobo, 100_000);
		const ledger = await getWalletLedger(donorId);
		assert.equal(ledger.total, 1);
		assert.equal(ledger.entries[0]?.amountKobo, 100_000);
		assert.equal(ledger.entries[0]?.description, "Reward for a completed blood donation");
		assert.ok(ledger.entries[0]?.createdAt instanceof Date);
	});

	it("paginates the ledger", async () => {
		const donorId = await makeDonor("pager");
		await prisma.walletTransaction.create({
			data: {
				donorId,
				entryType: "donation_reward",
				amountKobo: BigInt(100_000),
				description: "First reward",
			},
		});
			data: {
				donorId,
				entryType: "donation_reward",
				amountKobo: BigInt(100_000),
				description: "Second reward",
			},
		});
		const first = await getWalletLedger(donorId, { page: 1, pageSize: 1 });
		assert.equal(first.total, 2);
		assert.equal(first.totalPages, 2);
		assert.equal(first.entries.length, 1);
		const second = await getWalletLedger(donorId, { page: 2, pageSize: 1 });
		assert.equal(second.entries.length, 1);
		assert.notEqual(second.entries[0]?.id, first.entries[0]?.id);
	});

	after(async () => {
		await deleteUsersCompletely(Object.values(donors));
	});
});
