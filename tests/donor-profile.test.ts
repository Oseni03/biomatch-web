import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
	DONOR_CODE_ALPHABET,
	DONOR_CODE_REGEX,
	generateDonorCode,
	generateUniqueDonorCode,
	isValidDonorCode,
} from "@/lib/donor-code";
import {
	donorProfileInputSchema,
	lastKnownLocationSchema,
} from "@/lib/donor-profile-validation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordConsentsForUser } from "@/servers/consent";
import {
	getDonorProfile,
	saveDonorProfile,
	updateDonorProfile,
	updateLastKnownLocation,
} from "@/servers/user";

describe("Issue 06 donor code format", () => {
	it("uses BM- plus 6 chars from the unambiguous alphabet", () => {
		assert.match(generateDonorCode(), DONOR_CODE_REGEX);
		assert.ok(isValidDonorCode("BM-7K3Q9X"));
		assert.equal(isValidDonorCode("BM-ABCDEF"), true);
	});

	it("rejects ambiguous letters, wrong prefix and wrong length", () => {
		for (const bad of [
			"BM-ABCDE1I",
			"BM-ABCDE1L",
			"BM-ABCDE1O",
			"BM-ABCDE1U",
			"XM-ABCDEF",
			"BM-ABCDE",
			"BM-ABCDEFG",
			"BM-abcdef",
			"BM_ABCDEF",
			"",
		]) {
			assert.equal(isValidDonorCode(bad), false, bad);
		}
		assert.equal(isValidDonorCode("BM-IIIIII"), false);
		assert.equal(isValidDonorCode("BM-LLLLLL"), false);
		assert.equal(isValidDonorCode("BM-OOOOOO"), false);
		assert.equal(isValidDonorCode("BM-UUUUUU"), false);
	});

	it("alphabet excludes I, L, O and U", () => {
		for (const letter of ["I", "L", "O", "U"]) {
			assert.equal(DONOR_CODE_ALPHABET.includes(letter), false, letter);
		}
	});

	it("generates unique codes across a batch", () => {
		const codes = new Set(Array.from({ length: 500 }, () => generateDonorCode()));
		assert.equal(codes.size, 500);
		for (const code of codes) {
			assert.match(code, DONOR_CODE_REGEX);
		}
	});

	it("retries on collision and gives up after max attempts", async () => {
		let calls = 0;
		const code = await generateUniqueDonorCode(async () => {
			calls++;
			return calls <= 2;
		});
		assert.equal(calls, 3);
		assert.match(code, DONOR_CODE_REGEX);

		await assert.rejects(() =>
			generateUniqueDonorCode(async () => true, Math.random, 3),
		);
	});
});

describe("Issue 06 donor profile validation", () => {
	it("accepts a complete profile", () => {
		const result = donorProfileInputSchema.safeParse({
			bloodGroup: "O_POS",
			dateOfBirth: "1995-04-12",
			homeAddress: "14 Allen Avenue, Ikeja",
			state: "Lagos",
			lga: "Ikeja",
			homeLatitude: 6.5244,
			homeLongitude: 3.3792,
			isAvailable: true,
		});
		assert.equal(result.success, true);
	});

	it("rejects invalid coordinates", () => {
		const lat = donorProfileInputSchema.safeParse({
			bloodGroup: "A_POS",
			dateOfBirth: "1990-01-01",
			state: "Lagos",
			homeLatitude: 100,
			homeLongitude: 3.3,
			isAvailable: true,
		});
		assert.equal(lat.success, false);

		const lng = donorProfileInputSchema.safeParse({
			bloodGroup: "A_POS",
			dateOfBirth: "1990-01-01",
			state: "Lagos",
			homeLatitude: 6.5,
			homeLongitude: 200,
			isAvailable: true,
		});
		assert.equal(lng.success, false);

		const halfPin = donorProfileInputSchema.safeParse({
			bloodGroup: "A_POS",
			dateOfBirth: "1990-01-01",
			state: "Lagos",
			homeLatitude: 6.5,
			isAvailable: true,
		});
		assert.equal(halfPin.success, false);
	});

	it("rejects a future date of birth", () => {
		const result = donorProfileInputSchema.safeParse({
			bloodGroup: "A_POS",
			dateOfBirth: "2999-01-01",
			state: "Lagos",
			homeLatitude: 6.5,
			homeLongitude: 3.3,
			isAvailable: true,
		});
		assert.equal(result.success, false);
	});

	it("rejects invalid last-known locations", () => {
		assert.equal(
			lastKnownLocationSchema.safeParse({ latitude: 91, longitude: 0 }).success,
			false,
		);
		assert.equal(
			lastKnownLocationSchema.safeParse({ latitude: 0, longitude: -181 })
				.success,
			false,
		);
		assert.equal(
			lastKnownLocationSchema.safeParse({ latitude: 6.5, longitude: 3.3 })
				.success,
			true,
		);
	});
});

const stamp = Date.now();
const emailA = `donor-profile-a-${stamp}@example.com`;
const emailB = `donor-profile-b-${stamp}@example.com`;
const password = "DonorProfile123!";
const createdUserIds: string[] = [];

async function signUpDonor(email: string): Promise<string> {
	const result = await auth.api.signUpEmail({
		body: { email, password, name: "Profile Donor" },
	});
	assert.ok(result?.user?.id);
	createdUserIds.push(result.user.id);
	await recordConsentsForUser(result.user.id, {}, "127.0.0.1");
	return result.user.id;
}

function validProfile() {
	return {
		bloodGroup: "O_POS",
		dateOfBirth: "1995-04-12",
		homeAddress: "14 Allen Avenue, Ikeja",
		state: "Lagos",
		lga: "Ikeja",
		homeLatitude: 6.5244,
		homeLongitude: 3.3792,
		isAvailable: true,
	};
}

describe("Issue 06 donor profile persistence", () => {
	it("creates a profile with a unique donor code and unverified status", async () => {
		const userId = await signUpDonor(emailA);
		assert.equal(await getDonorProfile(userId), null);

		const created = await saveDonorProfile(userId, {
			name: "Profile Donor",
			profile: validProfile(),
		});
		assert.match(created.donorCode, DONOR_CODE_REGEX);
		assert.equal(created.verificationStatus, "unverified");
		assert.equal(created.bloodGroup, "O_POS");
		assert.equal(created.state, "Lagos");
		assert.equal(created.homeLatitude, 6.5244);
		assert.equal(created.isAvailable, true);
	});

	it("a second donor gets a different code and the toggle persists", async () => {
		const userId = await signUpDonor(emailB);
		const created = await saveDonorProfile(userId, {
			name: "Second Donor",
			profile: { ...validProfile(), bloodGroup: "A_NEG", isAvailable: false },
		});
		assert.match(created.donorCode, DONOR_CODE_REGEX);
		assert.equal(created.isAvailable, false);

		const first = await getDonorProfile(createdUserIds[0]);
		assert.ok(first);
		assert.notEqual(first.donorCode, created.donorCode);
	});

	it("edits keep the same donor code", async () => {
		const userId = createdUserIds[0];
		const before = await getDonorProfile(userId);
		assert.ok(before);
		const updated = await updateDonorProfile(userId, {
			...validProfile(),
			state: "Ogun",
		});
		assert.equal(updated.donorCode, before.donorCode);
		assert.equal(updated.state, "Ogun");
	});

	it("rejects invalid coordinates at the server", async () => {
		await assert.rejects(() =>
			updateDonorProfile(createdUserIds[0], {
				...validProfile(),
				homeLatitude: 100,
			}),
		);
	});

	it("updates the last-known location", async () => {
		const updated = await updateLastKnownLocation(createdUserIds[0], {
			latitude: 6.6,
			longitude: 3.4,
		});
		assert.equal(updated.lastKnownLatitude, 6.6);
		assert.equal(updated.lastKnownLongitude, 3.4);
		assert.ok(updated.lastKnownAt);

		await assert.rejects(() =>
			updateLastKnownLocation(createdUserIds[0], {
				latitude: 200,
				longitude: 0,
			}),
		);
	});

	after(async () => {
		for (const userId of createdUserIds) {
			await prisma.donorProfile.deleteMany({ where: { userId } }).catch(() => {});
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
