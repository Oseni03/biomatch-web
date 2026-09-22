import { after, describe, it } from "node:test";
import assert from "node:assert/strict";

process.env.SMS_PROVIDER = "fake";

import {
	clearSmsOutbox,
	getSmsOutbox,
	sendSms,
} from "@/lib/sms";
import {
	isE164,
	normalizeToE164,
	phoneNumberSchema,
} from "@/lib/phone-validation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordConsentsForUser } from "@/servers/consent";
import {
	getPhoneVerificationState,
	requestPhoneOtp,
	setPhoneNumber,
} from "@/servers/user";

describe("Issue 07 phone normalization", () => {
	it("normalizes Nigerian local formats to E.164", () => {
		assert.equal(normalizeToE164("08031234567"), "+2348031234567");
		assert.equal(normalizeToE164("+234 803 123 4567"), "+2348031234567");
		assert.equal(normalizeToE164("2348031234567"), "+2348031234567");
		assert.equal(normalizeToE164("(0803) 123-4567"), "+2348031234567");
	});

	it("leaves other E.164 numbers untouched", () => {
		assert.equal(normalizeToE164("+15551234567"), "+15551234567");
		assert.equal(isE164("+15551234567"), true);
		assert.equal(isE164("+2348031234567"), true);
	});

	it("accepts valid numbers and rejects the rest", () => {
		assert.equal(phoneNumberSchema.safeParse("+2348031234567").success, true);
		assert.equal(phoneNumberSchema.safeParse("08031234567").success, true);
		for (const bad of ["", "0803", "abc", "12345", "+", "+0123456789"]) {
			assert.equal(phoneNumberSchema.safeParse(bad).success, false, bad);
		}
	});
});

describe("Issue 07 fake SMS provider", () => {
	it("captures outbound SMS to the test outbox", async () => {
		clearSmsOutbox();
		const result = await sendSms({ to: "+2348031234567", message: "hello" });
		assert.equal(result.id, "fake");
		const outbox = getSmsOutbox();
		assert.equal(outbox.length, 1);
		assert.equal(outbox[0].to, "+2348031234567");
		assert.equal(outbox[0].message, "hello");
		clearSmsOutbox();
	});
});

const stamp = String(Date.now() % 100000000).padStart(8, "0");
const phoneA = `+23470${stamp}`;
const phoneB = `+23471${stamp}`;
const phoneC = `+23472${stamp}`;
const phoneD = `+23473${stamp}`;
const emailA = `phone-a-${stamp}@example.com`;
const emailB = `phone-b-${stamp}@example.com`;
const password = "PhoneVerify123!";
const createdUserIds: string[] = [];

async function signUpUser(email: string): Promise<string> {
	const result = await auth.api.signUpEmail({
		body: { email, password, name: "Phone User" },
	});
	assert.ok(result?.user?.id);
	createdUserIds.push(result.user.id);
	await recordConsentsForUser(result.user.id, {}, "127.0.0.1");
	return result.user.id;
}

function latestCodeFor(to: string): string {
	const messages = getSmsOutbox().filter((sms) => sms.to === to);
	assert.ok(messages.length > 0, `no SMS sent to ${to}`);
	const match = messages[messages.length - 1].message.match(/(\d{6})/);
	assert.ok(match, "SMS has no 6-digit code");
	return match[1];
}

describe("Issue 07 phone verification flow", () => {
	it("stores the number unverified and reports state", async () => {
		const userId = await signUpUser(emailA);
		const localA = `0${phoneA.slice(4)}`;
		const saved = await setPhoneNumber(userId, localA);
		assert.equal(saved.phoneNumber, phoneA);
		assert.equal(saved.phoneNumberVerified, false);

		const state = await getPhoneVerificationState(userId);
		assert.equal(state.phoneNumber, phoneA);
		assert.equal(state.phoneNumberVerified, false);
	});

	it("rejects non-E.164 numbers and numbers owned by another user", async () => {
		const userB = await signUpUser(emailB);
		await assert.rejects(() => setPhoneNumber(userB, "not-a-number"));
		await assert.rejects(() => setPhoneNumber(userB, phoneA));
	});

	it("sends an OTP by SMS and verifies the correct code", async () => {
		const userId = createdUserIds[0];
		clearSmsOutbox();
		await requestPhoneOtp(userId);
		const code = latestCodeFor(phoneA);

		const verified = await auth.api.verifyPhoneNumber({
			body: { phoneNumber: phoneA, code, disableSession: true },
		});
		assert.equal(verified.status, true);

		const state = await getPhoneVerificationState(userId);
		assert.equal(state.phoneNumberVerified, true);
	});

	it("rejects a wrong code and keeps the number unverified", async () => {
		const userId = createdUserIds[0];
		await setPhoneNumber(userId, phoneB);
		clearSmsOutbox();
		await requestPhoneOtp(userId);
		latestCodeFor(phoneB);

		await assert.rejects(() =>
			auth.api.verifyPhoneNumber({
				body: { phoneNumber: phoneB, code: "000000", disableSession: true },
			}),
		);
		const state = await getPhoneVerificationState(userId);
		assert.equal(state.phoneNumber, phoneB);
		assert.equal(state.phoneNumberVerified, false);
	});

	it("rejects an expired code", async () => {
		const userId = createdUserIds[1];
		await setPhoneNumber(userId, phoneD);
		clearSmsOutbox();
		await requestPhoneOtp(userId);
		const code = latestCodeFor(phoneD);
		await prisma.verification.updateMany({
			where: { identifier: phoneD },
			data: { expiresAt: new Date(Date.now() - 1000) },
		});

		await assert.rejects(() =>
			auth.api.verifyPhoneNumber({
				body: { phoneNumber: phoneD, code, disableSession: true },
			}),
		);
		const state = await getPhoneVerificationState(userId);
		assert.equal(state.phoneNumberVerified, false);
	});

	it("rate limits back-to-back OTP requests", async () => {
		const userId = createdUserIds[1];
		await setPhoneNumber(userId, phoneC);
		clearSmsOutbox();
		await requestPhoneOtp(userId);
		await assert.rejects(() => requestPhoneOtp(userId));
	});

	it("caps OTP requests per hour per number", async () => {
		const userId = createdUserIds[1];
		const old = new Date(Date.now() - 61 * 1000);
		await prisma.verification.deleteMany({ where: { identifier: phoneC } });
		await prisma.verification.createMany({
			data: Array.from({ length: 5 }, () => ({
				identifier: phoneC,
				value: "000000:0",
				expiresAt: new Date(Date.now() + 5 * 60 * 1000),
				createdAt: old,
				updatedAt: old,
			})),
		});
		await assert.rejects(() => requestPhoneOtp(userId));
	});

	after(async () => {
		for (const identifier of [phoneA, phoneB, phoneC, phoneD]) {
			await prisma.verification.deleteMany({ where: { identifier } }).catch(() => {});
		}
		for (const userId of createdUserIds) {
			await prisma.consentRecord.deleteMany({ where: { userId } }).catch(() => {});
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
