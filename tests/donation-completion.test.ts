import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUniqueDonorCode } from "@/lib/donor-code";
import { REWARD_CREDIT_KOBO } from "@/lib/config";
import { recordConsentsForUser } from "@/servers/consent";
import { approveHospital } from "@/servers/admin";
import { createBloodRequest } from "@/servers/requests";
import { acceptMatch } from "@/servers/responses";
import { findEligibleDonors } from "@/servers/matching";
import {
	confirmDonationByDonor,
	confirmDonationByHospital,
	getMyDonations,
} from "@/servers/donations";
import {
	deleteOrganizationCompletely,
	deleteUsersCompletely,
} from "./helpers";

const stamp = Date.now();
const password = "HospitalTest123!";

let adminId = "";
let ownerId = "";
let ownerHeaders = new Headers();
let viewerId = "";
let organizationId = "";
let requestId = "";
const donors: Record<string, string> = {};
const matches: Record<string, string> = {};

async function signUp(email: string, name: string): Promise<{ userId: string; headers: Headers }> {
	const response = await auth.api.signUpEmail({
		body: { email, password, name },
		headers: new Headers(),
		asResponse: true,
	});
	assert.equal(response.status, 200);
	const data = (await response.json()) as { user?: { id?: string } };
	assert.ok(data?.user?.id);
	const headers = new Headers();
	for (const setCookie of response.headers.getSetCookie()) {
		const pair = setCookie.split(";")[0]?.trim();
		if (pair) headers.append("cookie", pair);
	}
	return { userId: data.user.id as string, headers };
}

async function makeDonor(key: string): Promise<string> {
	const signed = await signUp(`complete-${key}-18-${stamp}@example.com`, `Donor ${key}`);
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
			homeLatitude: 6.5344,
			homeLongitude: 3.3792,
			verificationStatus: "verified",
		},
	});
	donors[key] = signed.userId;
	return signed.userId;
}

async function acceptDonor(key: string): Promise<string> {
	const match = await prisma.requestMatch.findUnique({
		where: {
			requestId_donorId: { requestId, donorId: donors[key] as string },
		},
		select: { id: true },
	});
	assert.ok(match);
	await acceptMatch(match.id, donors[key] as string);
	matches[key] = match.id;
	return match.id;
}

describe("Issue 18 dual confirmation, cooldown and reward", () => {
	it("sets up an approved hospital, two donors and two accepts", async () => {
		const admin = await signUp(`complete-admin-18-${stamp}@example.com`, "Complete Admin");
		adminId = admin.userId;
		await prisma.user.update({ where: { id: adminId }, data: { role: "admin" } });
		await recordConsentsForUser(adminId, {});

		const owner = await signUp(`complete-owner-18-${stamp}@example.com`, "Complete Owner");
		ownerId = owner.userId;
		ownerHeaders = owner.headers;
		await recordConsentsForUser(ownerId, {});

		const organization = await auth.api.createOrganization({
			body: {
				name: `Complete Hospital ${stamp}`,
				slug: `complete-hospital-18-${stamp}`,
				officialEmail: `official-18-${stamp}@example.com`,
				registrationNumber: `RC-18-${stamp}`,
				address: "1 Complete Street, Yaba",
				state: "Lagos",
				latitude: 6.5244,
				longitude: 3.3792,
			},
			headers: ownerHeaders,
		} as Parameters<typeof auth.api.createOrganization>[0]);
		organizationId = organization.id as string;
		await approveHospital(adminId, { organizationId });

		const viewer = await signUp(`complete-viewer-18-${stamp}@example.com`, "Complete Viewer");
		viewerId = viewer.userId;
		await recordConsentsForUser(viewerId, {});
		await prisma.member.create({
			data: { organizationId, userId: viewerId, role: "member" },
		});

		await makeDonor("d1");
		await makeDonor("d2");
		const created = await createBloodRequest(organizationId, ownerId, {
			bloodGroup: "O_POS",
			unitsRequired: 2,
		});
		requestId = created.requestId;
		assert.equal(created.matchedDonorCount, 2);
		await acceptDonor("d1");
		await acceptDonor("d2");
	});

	it("completes only when both sides have confirmed", async () => {
		const first = await confirmDonationByDonor(matches.d1 as string, donors.d1 as string);
		assert.equal(first.donorConfirmed, true);
		assert.equal(first.hospitalConfirmed, false);
		assert.equal(first.completed, false);

		const donation = await prisma.donation.findFirst({
			where: { matchId: matches.d1 as string },
			select: { status: true, donorConfirmedAt: true },
		});
		assert.equal(String(donation?.status), "pending");
		assert.ok(donation?.donorConfirmedAt instanceof Date);

		const done = await confirmDonationByHospital(
			organizationId,
			ownerId,
			matches.d1 as string,
		);
		assert.equal(done.completed, true);
	});

	it("sets cooldown, last donation date, wallet reward and notifies both parties", async () => {
		const profile = await prisma.donorProfile.findUnique({
			where: { userId: donors.d1 as string },
			select: { lastDonatedAt: true, cooldownUntil: true },
		});
		assert.ok(profile?.lastDonatedAt instanceof Date);
		const cooldownMs =
			(profile?.cooldownUntil as Date).getTime() - (profile?.lastDonatedAt as Date).getTime();
		assert.ok(cooldownMs >= 89 * 24 * 60 * 60 * 1000);
		assert.ok(cooldownMs <= 91 * 24 * 60 * 60 * 1000);

		const wallet = await prisma.donorWallet.findUnique({
			where: { donorId: donors.d1 as string },
			select: { balanceKobo: true },
		});
		assert.equal(Number(wallet?.balanceKobo), REWARD_CREDIT_KOBO);
		const rewards = await prisma.walletTransaction.count({
			where: { donorId: donors.d1 as string, entryType: "donation_reward" },
		});
		assert.equal(rewards, 1);

		const donorNotice = await prisma.notification.findFirst({
			where: { userId: donors.d1 as string, type: "donation.completed" },
			select: { id: true },
		});
		assert.ok(donorNotice, "donor is notified of completion");
		const staffNotice = await prisma.notification.findFirst({
			where: { userId: ownerId, type: "donation.completed" },
			select: { id: true },
		});
		assert.ok(staffNotice, "hospital staff are notified of completion");

		const history = await getMyDonations(donors.d1 as string);
		assert.equal(history.total, 1);
		assert.equal(history.donations[0]?.rewardKobo, REWARD_CREDIT_KOBO);
	});

	it("never double-credits under concurrent completion", async () => {
		await confirmDonationByDonor(matches.d2 as string, donors.d2 as string);
		const [first, second] = await Promise.all([
			confirmDonationByHospital(organizationId, ownerId, matches.d2 as string),
			confirmDonationByHospital(organizationId, ownerId, matches.d2 as string),
		]);
		assert.ok(first.completed || second.completed);
		const rewards = await prisma.walletTransaction.count({
			where: { donorId: donors.d2 as string, entryType: "donation_reward" },
		});
		assert.equal(rewards, 1);
		const wallet = await prisma.donorWallet.findUnique({
			where: { donorId: donors.d2 as string },
			select: { balanceKobo: true },
		});
		assert.equal(Number(wallet?.balanceKobo), REWARD_CREDIT_KOBO);
	});

	it("excludes cooldown donors from matching and accepting", async () => {
		const created = await createBloodRequest(organizationId, ownerId, {
			bloodGroup: "O_POS",
			unitsRequired: 1,
		});
		assert.equal(created.matchedDonorCount, 0);
		const eligible = await findEligibleDonors(created.requestId, 50);
		assert.equal(eligible.length, 0);

		const injected = await prisma.requestMatch.create({
			data: {
				requestId: created.requestId,
				donorId: donors.d1 as string,
				status: "notified",
				distanceKm: 1.1,
				escalationLevel: 0,
			},
			select: { id: true },
		});
		await assert.rejects(
			acceptMatch(injected.id, donors.d1 as string),
			/not currently eligible/,
		);
	});

	it("gates hospital confirmation by permission", async () => {
		await makeDonor("d3");
		const created = await createBloodRequest(organizationId, ownerId, {
			bloodGroup: "O_POS",
			unitsRequired: 5,
		});
		const fresh = await prisma.requestMatch.findUnique({
			where: {
				requestId_donorId: { requestId: created.requestId, donorId: donors.d3 as string },
			},
			select: { id: true },
		});
		assert.ok(fresh, "d3 should be matchable while d1/d2 cool down");
		await assert.rejects(
			confirmDonationByHospital(organizationId, viewerId, fresh.id),
			/not authorized/i,
		);
	});
});

after(async () => {
	await deleteUsersCompletely(
		[
			adminId,
			ownerId,
			viewerId,
			donors.d1 as string,
			donors.d2 as string,
			donors.d3 as string,
		].filter(Boolean),
	);
	if (organizationId) {
		await deleteOrganizationCompletely(organizationId);
	}
});
