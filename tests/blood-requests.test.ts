import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUniqueDonorCode } from "@/lib/donor-code";
import { recordConsentsForUser } from "@/servers/consent";
import { approveHospital } from "@/servers/admin";
import {
	deleteOrganizationCompletely,
	deleteUsersCompletely,
} from "./helpers";
import {
	createBloodRequest,
	getBloodRequestSummary,
	getNotificationInbox,
	getRequestsNearby,
	markNotificationRead,
	matchDonorsForRequest,
} from "@/servers/requests";

const stamp = Date.now();
const password = "HospitalTest123!";
const HOSPITAL_LAT = 6.5244;
const HOSPITAL_LNG = 3.3792;
const NEAR_LAT = 6.5344;
const NEAR_LNG = 3.3792;
const FAR_LAT = 6.7944;
const FAR_LNG = 3.3792;

let adminId = "";
let ownerId = "";
let ownerHeaders = new Headers();
let staffId = "";
let organizationId = "";
let pendingOrgId = "";
const donors: Record<string, string> = {};
let requestId = "";

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

async function uniqueCode(): Promise<string> {
	return generateUniqueDonorCode(async (code) => {
		const existing = await prisma.donorProfile.findUnique({
			where: { donorCode: code },
			select: { userId: true },
		});
		return !!existing;
	});
}

async function makeDonor(
	key: string,
	overrides: Record<string, unknown> = {},
): Promise<string> {
	const signed = await signUp(`match-${key}-12-${stamp}@example.com`, `Donor ${key}`);
	await recordConsentsForUser(signed.userId, {});
	await prisma.donorProfile.create({
		data: {
			userId: signed.userId,
			donorCode: await uniqueCode(),
			bloodGroup: "O_POS",
			state: "Lagos",
			homeLatitude: NEAR_LAT,
			homeLongitude: NEAR_LNG,
			verificationStatus: "verified",
			...overrides,
		} as Parameters<typeof prisma.donorProfile.create>[0]["data"],
	});
	donors[key] = signed.userId;
	return signed.userId;
}

describe("Issue 12 create request and match donors", () => {
	it("sets up an approved hospital, staff and a crafted donor pool", async () => {
		const admin = await signUp(`match-admin-12-${stamp}@example.com`, "Match Admin");
		adminId = admin.userId;
		await prisma.user.update({ where: { id: adminId }, data: { role: "admin" } });
		await recordConsentsForUser(adminId, {});

		const owner = await signUp(`match-owner-12-${stamp}@example.com`, "Match Owner");
		ownerId = owner.userId;
		ownerHeaders = owner.headers;
		await recordConsentsForUser(ownerId, {});

		const organization = await auth.api.createOrganization({
			body: {
				name: `Match Hospital ${stamp}`,
				slug: `match-hospital-12-${stamp}`,
				officialEmail: `official-12-${stamp}@example.com`,
				registrationNumber: `RC-12-${stamp}`,
				address: "1 Match Street, Yaba",
				state: "Lagos",
				latitude: HOSPITAL_LAT,
				longitude: HOSPITAL_LNG,
			},
			headers: ownerHeaders,
		} as Parameters<typeof auth.api.createOrganization>[0]);
		organizationId = organization.id as string;
		await approveHospital(adminId, { organizationId });

		const staff = await signUp(`match-staff-12-${stamp}@example.com`, "Match Staff");
		staffId = staff.userId;
		await recordConsentsForUser(staffId, {});
		await prisma.member.create({
			data: { organizationId, userId: staffId, role: "member" },
		});

		await makeDonor("compatible");
		await makeDonor("wrongGroup", { bloodGroup: "B_POS" });
		await makeDonor("far", { homeLatitude: FAR_LAT, homeLongitude: FAR_LNG });
		await makeDonor("cooldown", { cooldownUntil: new Date(Date.now() + 30 * 86400000) });
		await makeDonor("unverified", { verificationStatus: "unverified" });
		await makeDonor("failed", { verificationStatus: "failed" });
		await makeDonor("restricted", { donorStatus: "restricted" });
		await makeDonor("unavailable", { isAvailable: false });
		const bannedId = await makeDonor("banned");
		await prisma.user.update({ where: { id: bannedId }, data: { banned: true } });
		await makeDonor("noPhone");
		await makeDonor("freshPin", {
			homeLatitude: FAR_LAT,
			homeLongitude: FAR_LNG,
			lastKnownLatitude: NEAR_LAT,
			lastKnownLongitude: NEAR_LNG,
			lastKnownAt: new Date(),
		});
		await makeDonor("freshFar", {
			lastKnownLatitude: FAR_LAT,
			lastKnownLongitude: FAR_LNG,
			lastKnownAt: new Date(),
		});
		await makeDonor("staleFar", {
			lastKnownLatitude: FAR_LAT,
			lastKnownLongitude: FAR_LNG,
			lastKnownAt: new Date(Date.now() - 25 * 3600000),
		});

		const compatibilityRows = await prisma.bloodCompatibility.count();
		assert.equal(compatibilityRows, 27);
	});

	it("rejects creation for unauthorized staff and pending hospitals", async () => {
		await assert.rejects(
			createBloodRequest(organizationId, staffId, { bloodGroup: "A_POS", unitsRequired: 2 }),
			/Not authorized/,
		);

		const pendingOwner = await signUp(`match-pending-12-${stamp}@example.com`, "Pending Owner");
		await recordConsentsForUser(pendingOwner.userId, {});
		const pending = await auth.api.createOrganization({
			body: {
				name: `Pending Hospital ${stamp}`,
				slug: `pending-hospital-12-${stamp}`,
				officialEmail: `pending-12-${stamp}@example.com`,
				address: "2 Match Street, Yaba",
				state: "Lagos",
				latitude: HOSPITAL_LAT,
				longitude: HOSPITAL_LNG,
			},
			headers: pendingOwner.headers,
		} as Parameters<typeof auth.api.createOrganization>[0]);
		pendingOrgId = pending.id as string;
		await assert.rejects(
			createBloodRequest(pendingOrgId, pendingOwner.userId, {
				bloodGroup: "A_POS",
				unitsRequired: 2,
			}),
			/awaiting approval/,
		);
	});

	it("creates a request and matches exactly the eligible donors", async () => {
		const created = await createBloodRequest(organizationId, ownerId, {
			bloodGroup: "A_POS",
			unitsRequired: 2,
			internalReference: "WARD-B-12",
		});
		requestId = created.requestId;
		assert.ok(requestId);
		assert.equal(created.hospitalName, `Match Hospital ${stamp}`);

		const matched = await prisma.requestMatch.findMany({
			where: { requestId },
			select: { donorId: true },
		});
		const matchedIds = new Set(matched.map((row) => row.donorId));
		for (const key of ["compatible", "noPhone", "freshPin", "staleFar"]) {
			assert.ok(matchedIds.has(donors[key] as string), `expected ${key} matched`);
		}
		for (const key of [
			"wrongGroup",
			"far",
			"cooldown",
			"unverified",
			"failed",
			"restricted",
			"unavailable",
			"banned",
			"freshFar",
		]) {
			assert.ok(!matchedIds.has(donors[key] as string), `expected ${key} excluded`);
		}
		assert.equal(created.matchedDonorCount, 4);

		const stored = await prisma.bloodRequest.findUnique({ where: { id: requestId } });
		assert.equal(stored?.internalReference, "WARD-B-12");
		assert.equal(String(stored?.status), "active");
	});

	it("matches the far donor only at a wider radius and never twice", async () => {
		const wider = await matchDonorsForRequest(requestId, 50, 1);
		assert.equal(wider.matchedCount, 2);
		const farMatch = await prisma.requestMatch.findUnique({
			where: { requestId_donorId: { requestId, donorId: donors["far"] as string } },
		});
		assert.ok(farMatch);
		assert.equal(farMatch?.escalationLevel, 1);
		const freshFarMatch = await prisma.requestMatch.findUnique({
			where: { requestId_donorId: { requestId, donorId: donors["freshFar"] as string } },
		});
		assert.ok(freshFarMatch);

		const again = await matchDonorsForRequest(requestId, 50, 1);
		assert.equal(again.matchedCount, 0);
		const total = await prisma.requestMatch.count({ where: { requestId } });
		assert.equal(total, 6);
	});

	it("exposes only donor-safe fields to donors", async () => {
		const nearby = await getRequestsNearby(donors["compatible"] as string);
		assert.equal(nearby.total, 1);
		const item = nearby.requests[0];
		assert.ok(item);
		assert.deepEqual(Object.keys(item as Record<string, unknown>).sort(), [
			"bloodGroup",
			"distanceKm",
			"hospitalName",
			"locationName",
			"matchId",
			"notifiedAt",
			"requestId",
			"unitsRequired",
		].sort());
		assert.equal(item?.bloodGroup, "A+");
		assert.equal(item?.hospitalName, `Match Hospital ${stamp}`);
		assert.ok((item?.distanceKm ?? -1) >= 0);

		const excluded = await getRequestsNearby(donors["wrongGroup"] as string);
		assert.equal(excluded.total, 0);
	});

	it("creates simultaneous in-app notifications with read/unread state", async () => {
		const inbox = await getNotificationInbox(donors["compatible"] as string);
		assert.equal(inbox.unreadCount, 1);
		assert.equal(inbox.total, 1);
		const notification = inbox.notifications[0];
		assert.ok(notification);
		assert.equal(notification?.type, "request.new_match");
		assert.ok(notification?.title.includes("A+"));
		assert.ok(notification?.body.includes(`Match Hospital ${stamp}`));
		assert.ok(!notification?.body.includes("WARD-B-12"));
		assert.equal(notification?.readAt, null);

		await markNotificationRead(notification?.id as string, donors["compatible"] as string);
		const after = await getNotificationInbox(donors["compatible"] as string);
		assert.equal(after.unreadCount, 0);
		assert.ok(after.notifications[0]?.readAt);

		const unreadOnly = await getNotificationInbox(donors["compatible"] as string, {
			unreadOnly: true,
		});
		assert.equal(unreadOnly.total, 0);

		const noPhoneInbox = await getNotificationInbox(donors["noPhone"] as string);
		assert.equal(noPhoneInbox.total, 1);
	});

	it("shows the hospital the created request with notified counts", async () => {
		const summary = await getBloodRequestSummary(organizationId, ownerId, requestId);
		assert.equal(summary.bloodGroup, "A+");
		assert.equal(summary.unitsRequired, 2);
		assert.equal(summary.unitsAccepted, 0);
		assert.equal(summary.status, "active");
		assert.equal(summary.notifiedCount, 6);
		assert.equal(summary.acceptedCount, 0);
		const memberView = await getBloodRequestSummary(organizationId, staffId, requestId);
		assert.equal(memberView.requestId, requestId);
		await assert.rejects(
			getBloodRequestSummary(organizationId, donors["compatible"] as string, requestId),
			/not a member/,
		);
	});

	after(async () => {
		await deleteOrganizationCompletely(pendingOrgId);
		await deleteOrganizationCompletely(organizationId);
		const pendingOwner = await prisma.user
			.findUnique({ where: { email: `match-pending-12-${stamp}@example.com` } })
			.catch(() => null);
		await deleteUsersCompletely([
			adminId,
			ownerId,
			staffId,
			...Object.values(donors),
			pendingOwner?.id,
		]);
	});
});
