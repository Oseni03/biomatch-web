import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordConsentsForUser } from "@/servers/consent";
import { approveHospital, setScreeningPartner } from "@/servers/admin";
import { eraseAccountForUser } from "@/servers/erasure";
import { deleteOrganizationCompletely, deleteUsersCompletely } from "./helpers";

const stamp = Date.now();
const password = "HospitalTest123!";

let donorId = "";
let donorEmail = "";
let adminId = "";
let ownerId = "";
let secondOwnerId = "";
let organizationId = "";
let donationId = "";

async function signUp(email: string, name: string): Promise<string> {
	const response = await auth.api.signUpEmail({
		body: { email, password, name },
		headers: new Headers(),
		asResponse: true,
	});
	assert.equal(response.status, 200);
	const data = (await response.json()) as { user?: { id?: string } };
	assert.ok(data?.user?.id);
	return data.user.id as string;
}

describe("Issue 28 NDPR erasure", () => {
	it("sets up a donor with history and a sole-owner hospital", async () => {
		donorEmail = `erase-donor-28-${stamp}@example.com`;
		donorId = await signUp(donorEmail, "Erase Donor");
		await recordConsentsForUser(donorId, {});
		await prisma.user.update({
			where: { id: donorId },
			data: {
				phoneNumber: `+23480028${String(stamp).slice(-4)}`,
				phoneNumberVerified: true,
			},
		});
		await prisma.donorProfile.create({
			data: {
				userId: donorId,
				donorCode: `BM-${String(stamp).slice(-6)}`,
				bloodGroup: "O_POS",
				dateOfBirth: new Date("1990-05-17"),
				homeAddress: "14 Allen Avenue, Ikeja",
				state: "Lagos",
				lga: "Ikeja",
				homeLatitude: 6.6018,
				homeLongitude: 3.3515,
				verificationStatus: "verified",
			},
		});

		ownerId = await signUp(`erase-owner-28-${stamp}@example.com`, "Erase Owner");
		await recordConsentsForUser(ownerId, {});
		const ownerSignIn = await auth.api.signInEmail({
			body: { email: `erase-owner-28-${stamp}@example.com`, password },
			headers: new Headers(),
			asResponse: true,
		});
		const ownerHeaders = new Headers();
		for (const setCookie of ownerSignIn.headers.getSetCookie()) {
			const pair = setCookie.split(";")[0]?.trim();
			if (pair) ownerHeaders.append("cookie", pair);
		}
		const organization = await auth.api.createOrganization({
			body: {
				name: `Erase Hospital ${stamp}`,
				slug: `erase-hospital-28-${stamp}`,
				officialEmail: `official-28-${stamp}@example.com`,
				registrationNumber: `RC-28-${stamp}`,
				address: "1 Erase Street, Yaba",
				state: "Lagos",
				latitude: 6.5244,
				longitude: 3.3792,
			},
			headers: ownerHeaders,
		} as Parameters<typeof auth.api.createOrganization>[0]);
		assert.ok(organization?.id);
		organizationId = organization.id as string;

		adminId = await signUp(`erase-admin-28-${stamp}@example.com`, "Erase Admin");
		await prisma.user.update({
			where: { id: adminId },
			data: { role: "admin" },
		});
		await recordConsentsForUser(adminId, {});
		await approveHospital(adminId, { organizationId });
		await setScreeningPartner(adminId, {
			organizationId,
			isScreeningPartner: true,
		});

		await prisma.donorScreening.create({
			data: {
				donorId,
				organizationId,
				recordedById: ownerId,
				result: "passed",
				notes: "No disqualifying conditions observed",
			},
		});

		const request = await prisma.bloodRequest.create({
			data: {
				organizationId,
				createdById: ownerId,
				bloodGroup: "O_POS",
				unitsRequired: 1,
				unitsAccepted: 1,
				status: "fulfilled",
				locationName: "Erase Hospital, Yaba",
				latitude: 6.5244,
				longitude: 3.3792,
				currentRadiusKm: 5,
			},
			select: { id: true },
		});
		const match = await prisma.requestMatch.create({
			data: {
				requestId: request.id,
				donorId,
				status: "completed",
				distanceKm: 2.5,
			},
			select: { id: true },
		});
		const donation = await prisma.donation.create({
			data: {
				matchId: match.id,
				requestId: request.id,
				donorId,
				organizationId,
				status: "completed",
				donorConfirmedAt: new Date(),
				hospitalConfirmedAt: new Date(),
				hospitalConfirmedBy: ownerId,
				completedAt: new Date(),
			},
			select: { id: true },
		});
		donationId = donation.id;
	});

	it("rejects wrong passwords and unconfirmed requests", async () => {
		await assert.rejects(
			eraseAccountForUser(donorId, {
				password: "wrong-password",
				confirmation: "DELETE",
			}),
			/incorrect/,
		);
		await assert.rejects(
			eraseAccountForUser(donorId, { password, confirmation: "delete" }),
		);
		const stillThere = await prisma.user.findUnique({
			where: { id: donorId },
			select: { anonymisedAt: true },
		});
		assert.equal(stillThere?.anonymisedAt, null);
	});

	it("blocks sole hospital owners with transfer guidance", async () => {
		await assert.rejects(
			eraseAccountForUser(ownerId, { password, confirmation: "DELETE" }),
			/sole owner/,
		);

		secondOwnerId = await signUp(
			`erase-owner2-28-${stamp}@example.com`,
			"Erase Owner Two",
		);
		await recordConsentsForUser(secondOwnerId, {});
		await prisma.member.create({
			data: { organizationId, userId: secondOwnerId, role: "owner" },
		});

		const erased = await eraseAccountForUser(ownerId, {
			password,
			confirmation: "DELETE",
		});
		assert.deepEqual(erased, { anonymised: true });
	});

	it("wipes personal data while keeping de-identified history", async () => {
		const erased = await eraseAccountForUser(donorId, {
			password,
			confirmation: "DELETE",
		});
		assert.deepEqual(erased, { anonymised: true });

		const user = await prisma.user.findUnique({
			where: { id: donorId },
		});
		assert.ok(user);
		assert.equal(user.name, "Anonymised user");
		assert.match(user.email, /^anonymised\+.*@anonymised\.invalid$/);
		assert.equal(user.phoneNumber, null);
		assert.equal(user.banned, true);
		assert.ok(user.anonymisedAt instanceof Date);
		assert.equal(user.notifyEmail, false);
		assert.equal(user.notifySms, false);

		const profile = await prisma.donorProfile.findUnique({
			where: { userId: donorId },
		});
		assert.ok(profile);
		assert.equal(profile.dateOfBirth, null);
		assert.equal(profile.homeAddress, null);
		assert.equal(profile.homeLatitude, null);
		assert.equal(profile.homeLongitude, null);
		assert.equal(profile.lastKnownLatitude, null);
		assert.equal(profile.isAvailable, false);

		const screening = await prisma.donorScreening.findFirst({
			where: { donorId },
			select: { notes: true },
		});
		assert.equal(screening?.notes, null);

		const consents = await prisma.consentRecord.findMany({
			where: { userId: donorId },
			select: { revokedAt: true },
		});
		assert.ok(consents.length > 0);
		for (const consent of consents) {
			assert.ok(consent.revokedAt instanceof Date);
		}

		assert.equal(
			await prisma.session.count({ where: { userId: donorId } }),
			0,
		);
		assert.equal(
			await prisma.account.count({ where: { userId: donorId } }),
			0,
		);
		assert.equal(
			await prisma.notification.count({ where: { userId: donorId } }),
			0,
		);

		const donation = await prisma.donation.findUnique({
			where: { id: donationId },
			select: { id: true, donorId: true, status: true },
		});
		assert.ok(donation, "donation history remains");
		assert.equal(donation.donorId, donorId);

		const audit = await prisma.auditLog.findFirst({
			where: { entityId: donorId, action: "user.erasure" },
			select: { id: true },
		});
		assert.ok(audit, "erasure is audit logged");
	});

	it("makes sign-in impossible after deletion", async () => {
		const retry = await auth.api.signInEmail({
			body: { email: donorEmail, password },
			headers: new Headers(),
			asResponse: true,
		});
		assert.notEqual(retry.status, 200);
		await assert.rejects(
			eraseAccountForUser(donorId, { password, confirmation: "DELETE" }),
			/already been deleted/,
		);
	});

	after(async () => {
		if (organizationId) {
			await deleteOrganizationCompletely(organizationId);
		}
		await deleteUsersCompletely([donorId, ownerId, secondOwnerId, adminId]);
	});
});
