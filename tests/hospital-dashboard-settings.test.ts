import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordConsentsForUser } from "@/servers/consent";
import {
	getHospitalDashboardMetrics,
	getOrganizationProfile,
	updateOrganizationProfile,
} from "@/servers/hospital";
import {
	getNotificationPreferences,
	updateNotificationPreferences,
} from "@/servers/delivery";
import { deleteOrganizationCompletely, deleteUsersCompletely } from "./helpers";

const stamp = Date.now();
const password = "HospitalTest123!";
const newPassword = "HospitalTest456!";

let ownerId = "";
let ownerHeaders = new Headers();
let memberId = "";
let donorId = "";
let organizationId = "";

async function signUp(
	email: string,
	name: string,
): Promise<{ userId: string; headers: Headers }> {
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

describe("Issue 26 hospital dashboard and account settings", () => {
	it("sets up a hospital with staff, a donor, requests and a donation", async () => {
		const owner = await signUp(
			`dash-owner-26-${stamp}@example.com`,
			"Dash Owner",
		);
		ownerId = owner.userId;
		ownerHeaders = owner.headers;
		await recordConsentsForUser(ownerId, {});

		const organization = await auth.api.createOrganization({
			body: {
				name: `Dash Hospital ${stamp}`,
				slug: `dash-hospital-26-${stamp}`,
				officialEmail: `official-26-${stamp}@example.com`,
				registrationNumber: `RC-26-${stamp}`,
				address: "1 Dash Street, Yaba",
				state: "Lagos",
				latitude: 6.5244,
				longitude: 3.3792,
			},
			headers: ownerHeaders,
		} as Parameters<typeof auth.api.createOrganization>[0]);
		assert.ok(organization?.id);
		organizationId = organization.id as string;

		const member = await signUp(
			`dash-member-26-${stamp}@example.com`,
			"Dash Member",
		);
		memberId = member.userId;
		await recordConsentsForUser(memberId, {});
		await prisma.member.create({
			data: { organizationId, userId: memberId, role: "member" },
		});

		const donor = await signUp(
			`dash-donor-26-${stamp}@example.com`,
			"Dash Donor",
		);
		donorId = donor.userId;
		await recordConsentsForUser(donorId, {});
		await prisma.donorProfile.create({
			data: {
				userId: donorId,
				donorCode: `DH26${String(stamp).slice(-6)}`,
				bloodGroup: "O_POS",
				state: "Lagos",
				homeLatitude: 6.5344,
				homeLongitude: 3.3792,
				verificationStatus: "verified",
			},
		});

		const baseline = await getHospitalDashboardMetrics(
			organizationId,
			ownerId,
		);
		assert.equal(baseline.activeRequests, 0);
		assert.equal(baseline.completedDonations, 0);
		assert.deepEqual(baseline.recentDonations, []);

		const active = await prisma.bloodRequest.create({
			data: {
				organizationId,
				createdById: ownerId,
				bloodGroup: "O_POS",
				unitsRequired: 3,
				unitsAccepted: 1,
				status: "active",
				locationName: "Dash Hospital, Yaba",
				latitude: 6.5244,
				longitude: 3.3792,
				currentRadiusKm: 5,
			},
			select: { id: true },
		});
		await prisma.bloodRequest.create({
			data: {
				organizationId,
				createdById: ownerId,
				bloodGroup: "A_POS",
				unitsRequired: 2,
				unitsAccepted: 2,
				status: "fulfilled",
				locationName: "Dash Hospital, Yaba",
				latitude: 6.5244,
				longitude: 3.3792,
				currentRadiusKm: 5,
			},
		});
		const match = await prisma.requestMatch.create({
			data: {
				requestId: active.id,
				donorId,
				status: "accepted",
				distanceKm: 1.5,
			},
			select: { id: true },
		});
		await prisma.donation.create({
			data: {
				matchId: match.id,
				requestId: active.id,
				donorId,
				organizationId,
				status: "completed",
				completedAt: new Date(),
			},
		});
	});

	it("reports active requests, outstanding units and completed donations from backend data", async () => {
		const metrics = await getHospitalDashboardMetrics(
			organizationId,
			ownerId,
		);
		assert.equal(metrics.activeRequests, 1);
		assert.equal(metrics.unitsRequired, 3);
		assert.equal(metrics.unitsAccepted, 1);
		assert.equal(metrics.unitsOutstanding, 2);
		assert.equal(metrics.completedDonations, 1);
		assert.equal(metrics.recentDonations.length, 1);
		assert.equal(metrics.recentDonations[0]?.donorName, "Dash Donor");
		assert.equal(metrics.recentDonations[0]?.bloodGroup, "O_POS");
		assert.equal(metrics.recentDonations[0]?.status, "completed");
	});

	it("lets owners update the workspace profile but rejects members", async () => {
		const before = await getOrganizationProfile(organizationId, memberId);
		assert.equal(before.name, `Dash Hospital ${stamp}`);

		await assert.rejects(
			updateOrganizationProfile(organizationId, memberId, {
				name: "Sneaky Rename",
				address: before.address,
				state: before.state,
			}),
			/Not authorized/,
		);

		const updated = await updateOrganizationProfile(
			organizationId,
			ownerId,
			{
				name: `Dash Hospital Renamed ${stamp}`,
				phone: "+2348012345678",
				address: before.address,
				state: before.state,
			},
		);
		assert.equal(updated.name, `Dash Hospital Renamed ${stamp}`);
		assert.equal(updated.phone, "+2348012345678");

		await assert.rejects(
			updateOrganizationProfile(organizationId, ownerId, {
				name: "X",
				address: before.address,
				state: before.state,
			}),
		);
	});

	it("saves per-channel notification preferences", async () => {
		const before = await getNotificationPreferences(ownerId);
		assert.equal(before.email, true);

		const updated = await updateNotificationPreferences(ownerId, {
			email: false,
			sms: false,
		});
		assert.equal(updated.email, false);
		assert.equal(updated.sms, false);

		const reloaded = await getNotificationPreferences(ownerId);
		assert.equal(reloaded.email, false);
		assert.equal(reloaded.sms, false);

		await updateNotificationPreferences(ownerId, { email: true, sms: true });
	});

	it("changes the password and signs out other sessions", async () => {
		const secondSignIn = await auth.api.signInEmail({
			body: {
				email: `dash-owner-26-${stamp}@example.com`,
				password,
			},
			headers: new Headers(),
			asResponse: true,
		});
		assert.equal(secondSignIn.status, 200);
		const secondHeaders = new Headers();
		for (const setCookie of secondSignIn.headers.getSetCookie()) {
			const pair = setCookie.split(";")[0]?.trim();
			if (pair) secondHeaders.append("cookie", pair);
		}

		const changed = await auth.api.changePassword({
			body: { currentPassword: password, newPassword },
			headers: secondHeaders,
		});
		assert.ok(changed);

		const signInWithNew = await auth.api.signInEmail({
			body: {
				email: `dash-owner-26-${stamp}@example.com`,
				password: newPassword,
			},
			headers: new Headers(),
			asResponse: true,
		});
		assert.equal(signInWithNew.status, 200);

		await auth.api.revokeOtherSessions({ headers: secondHeaders });
		const remaining = (await auth.api.listSessions({
			headers: secondHeaders,
		})) as unknown[];
		assert.equal(remaining.length, 1);

		const oldSession = await auth.api.getSession({ headers: ownerHeaders });
		assert.equal(oldSession, null);
	});

	after(async () => {
		if (organizationId) {
			await deleteOrganizationCompletely(organizationId);
		}
		await deleteUsersCompletely([ownerId, memberId, donorId]);
	});
});
