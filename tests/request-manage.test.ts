import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUniqueDonorCode } from "@/lib/donor-code";
import { recordConsentsForUser } from "@/servers/consent";
import { approveHospital } from "@/servers/admin";
import {
	cancelBloodRequest,
	closeBloodRequest,
	createBloodRequest,
	getActiveRequests,
	getRequestHistory,
	updateBloodRequest,
} from "@/servers/requests";
import { acceptMatch } from "@/servers/responses";
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
	const signed = await signUp(`manage-${key}-16-${stamp}@example.com`, `Donor ${key}`);
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

describe("Issue 16 manage requests and history", () => {
	it("sets up an approved hospital with two donors and one request", async () => {
		const admin = await signUp(`manage-admin-16-${stamp}@example.com`, "Manage Admin");
		adminId = admin.userId;
		await prisma.user.update({ where: { id: adminId }, data: { role: "admin" } });
		await recordConsentsForUser(adminId, {});

		const owner = await signUp(`manage-owner-16-${stamp}@example.com`, "Manage Owner");
		ownerId = owner.userId;
		ownerHeaders = owner.headers;
		await recordConsentsForUser(ownerId, {});

		const organization = await auth.api.createOrganization({
			body: {
				name: `Manage Hospital ${stamp}`,
				slug: `manage-hospital-16-${stamp}`,
				officialEmail: `official-16-${stamp}@example.com`,
				registrationNumber: `RC-16-${stamp}`,
				address: "1 Manage Street, Yaba",
				state: "Lagos",
				latitude: 6.5244,
				longitude: 3.3792,
			},
			headers: ownerHeaders,
		} as Parameters<typeof auth.api.createOrganization>[0]);
		organizationId = organization.id as string;
		await approveHospital(adminId, { organizationId });

		const viewer = await signUp(`manage-viewer-16-${stamp}@example.com`, "Manage Viewer");
		viewerId = viewer.userId;
		await recordConsentsForUser(viewerId, {});
		await prisma.member.create({
			data: { organizationId, userId: viewerId, role: "member" },
		});

		await makeDonor("d1");
		await makeDonor("d2");
		await makeDonor("d3");
		const created = await createBloodRequest(organizationId, ownerId, {
			bloodGroup: "O_POS",
			unitsRequired: 3,
		});
		requestId = created.requestId;
		assert.equal(created.matchedDonorCount, 3);

		const active = await getActiveRequests(organizationId, ownerId);
		assert.equal(active.total, 1);
		assert.equal(active.requests[0]?.unitsAccepted, 0);
		assert.equal(Number(active.requests[0]?.currentRadiusKm), 10);
	});

	it("rejects lowering units below the accepted count", async () => {
		for (const key of ["d1", "d2"]) {
			const match = await prisma.requestMatch.findUnique({
				where: {
					requestId_donorId: { requestId, donorId: donors[key] as string },
				},
				select: { id: true },
			});
			assert.ok(match);
			await acceptMatch(match.id, donors[key] as string);
		}

		await assert.rejects(
			updateBloodRequest(organizationId, ownerId, requestId, { unitsRequired: 1 }),
			/Cannot lower units below the 2 already accepted/,
		);
		await updateBloodRequest(organizationId, ownerId, requestId, {
			unitsRequired: 4,
			locationName: "Ward B",
		});
		const active = await getActiveRequests(organizationId, ownerId);
		assert.equal(active.requests[0]?.unitsRequired, 4);
		assert.equal(active.requests[0]?.locationName, "Ward B");
	});

	it("gates management actions by permission", async () => {
		await assert.rejects(
			updateBloodRequest(organizationId, viewerId, requestId, { unitsRequired: 5 }),
			/not authorized|permission|forbidden/i,
		);
		await assert.rejects(
			cancelBloodRequest(organizationId, viewerId, requestId),
			/not authorized|permission|forbidden/i,
		);
	});

	it("cancelling expires pending matches and notifies matched donors", async () => {
		const result = await cancelBloodRequest(organizationId, ownerId, requestId);
		assert.equal(result.status, "cancelled");

		const matches = await prisma.requestMatch.findMany({
			where: { requestId },
			select: { donorId: true, status: true },
		});
		const byDonor = new Map(matches.map((match) => [match.donorId, String(match.status)]));
		assert.equal(byDonor.get(donors.d1 as string), "cancelled");
		assert.equal(byDonor.get(donors.d2 as string), "cancelled");
		assert.equal(byDonor.get(donors.d3 as string), "expired");

		const donation = await prisma.donation.findFirst({
			where: { requestId },
			select: { status: true },
		});
		assert.equal(String(donation?.status), "cancelled");

		for (const key of ["d1", "d2", "d3"]) {
			const notice = await prisma.notification.findFirst({
				where: { userId: donors[key] as string, type: "request.cancelled" },
				select: { id: true },
			});
			assert.ok(notice, `${key} should see the cancellation`);
		}

		const request = await prisma.bloodRequest.findUnique({
			where: { id: requestId },
			select: { nextEscalationAt: true },
		});
		assert.equal(request?.nextEscalationAt, null);

		const active = await getActiveRequests(organizationId, ownerId);
		assert.equal(active.total, 0);
		const history = await getRequestHistory(organizationId, ownerId);
		assert.equal(history.total, 1);
		assert.equal(history.requests[0]?.status, "cancelled");
		assert.equal(history.requests[0]?.unitsAccepted, 2);
	});

	it("closes a second request and lists it in history", async () => {
		const created = await createBloodRequest(organizationId, ownerId, {
			bloodGroup: "O_POS",
			unitsRequired: 1,
		});
		const secondId = created.requestId;
		const result = await closeBloodRequest(organizationId, ownerId, secondId);
		assert.equal(result.status, "closed");

		const history = await getRequestHistory(organizationId, ownerId);
		assert.equal(history.total, 2);
		assert.deepEqual(
			history.requests.map((request) => request.status).sort(),
			["cancelled", "closed"],
		);
		await assert.rejects(
			updateBloodRequest(organizationId, ownerId, secondId, { unitsRequired: 2 }),
			/Only open requests can be edited/,
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
