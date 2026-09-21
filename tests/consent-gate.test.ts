import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
	getConsentStatusForUser,
	hasSatisfiedConsents,
	recordConsentsForUser,
	requireConsentsForUser,
	setMarketingForUser,
} from "@/servers/consent";
import {
	CONSENT_REQUIRED_CODE,
	ConsentRequiredError,
	missingRequiredConsents,
	requiredWithdrawalError,
} from "@/lib/consent";

const stamp = Date.now();
const emailA = `consent-a-${stamp}@example.com`;
const emailB = `consent-b-${stamp}@example.com`;
const password = "ConsentTest123!";
let userA = "";
let userB = "";

async function signUp(email: string): Promise<string> {
	const result = await auth.api.signUpEmail({
		body: { email, password, name: "Consent Donor" },
	});
	assert.ok(result?.user?.id);
	return result.user.id;
}

describe("Issue 04 NDPR consent gate", () => {
	it("a fresh user is missing every required consent (gate)", async () => {
		userA = await signUp(emailA);
		assert.equal(await hasSatisfiedConsents(userA), false);

		const status = await getConsentStatusForUser(userA);
		assert.equal(status.missing.length, 3);

		await assert.rejects(() => requireConsentsForUser(userA), (err) => {
			assert.ok(err instanceof ConsentRequiredError);
			assert.equal(
				(err as ConsentRequiredError).code,
				CONSENT_REQUIRED_CODE,
			);
			assert.equal((err as ConsentRequiredError).missing.length, 3);
			return true;
		});
	});

	it("accepting consents twice creates no duplicate rows (idempotent)", async () => {
		await recordConsentsForUser(userA, { marketing: true }, "127.0.0.1");
		await recordConsentsForUser(userA, { marketing: true }, "127.0.0.1");

		const rows = await prisma.consentRecord.findMany({
			where: { userId: userA },
		});
		assert.equal(rows.length, 4);
		assert.equal(
			rows.filter((r) => r.revokedAt === null).length,
			4,
		);
		assert.ok(rows.every((r) => r.ipAddress === "127.0.0.1"));

		await requireConsentsForUser(userA);
		assert.equal(await hasSatisfiedConsents(userA), true);
	});

	it("withdrawing marketing keeps the row; re-granting appends", async () => {
		await setMarketingForUser(userA, false);
		const status = await getConsentStatusForUser(userA);
		assert.equal(status.marketingGranted, false);
		await requireConsentsForUser(userA);

		const afterRevoke = await prisma.consentRecord.findMany({
			where: { userId: userA },
		});
		assert.equal(afterRevoke.length, 4);
		assert.equal(
			afterRevoke.filter((r) => r.revokedAt !== null).length,
			1,
		);

		await setMarketingForUser(userA, true);
		const reganted = await getConsentStatusForUser(userA);
		assert.equal(reganted.marketingGranted, true);
		const afterRegrant = await prisma.consentRecord.findMany({
			where: { userId: userA },
		});
		assert.equal(afterRegrant.length, 5);
	});

	it("stale policy versions force re-consent (version bump)", async () => {
		userB = await signUp(emailB);
		await recordConsentsForUser(userB, {}, null);
		await requireConsentsForUser(userB);

		await prisma.consentRecord.updateMany({
			where: { userId: userB },
			data: { policyVersion: "v0-test" },
		});

		assert.equal(await hasSatisfiedConsents(userB), false);
		const status = await getConsentStatusForUser(userB);
		assert.equal(status.missing.length, 3);
		await assert.rejects(() => requireConsentsForUser(userB));

		assert.equal(missingRequiredConsents([], "v9-future").length, 3);
	});

	it("withdrawing a required consent is rejected", () => {
		const refusal = requiredWithdrawalError("terms");
		assert.ok(refusal);
		assert.match(refusal, /delete your account/);
		assert.equal(requiredWithdrawalError("privacy_policy") !== null, true);
		assert.equal(requiredWithdrawalError("data_processing") !== null, true);
		assert.equal(requiredWithdrawalError("marketing"), null);
	});

	after(async () => {
		for (const userId of [userA, userB].filter(Boolean)) {
			await prisma.consentRecord
				.deleteMany({ where: { userId } })
				.catch(() => {});
			await prisma.session.deleteMany({ where: { userId } });
			await prisma.account.deleteMany({ where: { userId } });
			await prisma.user.delete({ where: { id: userId } }).catch(() => {});
		}
		for (const email of [emailA, emailB]) {
			await prisma.verification
				.deleteMany({ where: { identifier: { contains: email } } })
				.catch(() => {});
		}
	});
});
