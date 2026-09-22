import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUniqueDonorCode } from "@/lib/donor-code";
import { recordConsentsForUser } from "@/servers/consent";
import { approveHospital } from "@/servers/admin";
import { createBloodRequest, escalateDueRequests } from "@/servers/requests";
import {
	deleteOrganizationCompletely,
	deleteUsersCompletely,
} from "./helpers";

const stamp = Date.now();
const password = "HospitalTest123!";

let adminId = "";
let ownerId = "";
let ownerHeaders = new Headers();
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

async function makeDonor(key: string, latitude: number): Promise<string> {
	const signed = await signUp(`escalate-${key}-15-${stamp}@example.com`, `Donor ${key}`);
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
			homeLatitude: latitude,
			homeLongitude: 3.3792,
			verificationStatus: "verified",
		},
	});
	donors[key] = signed.userId;
	return signed.userId;
}

async function forceDue(atRadius?: number) {
	await prisma.bloodRequest.update({
		where: { id: requestId },
		data: {
			...(atRadius === undefined ? {} : { currentRadiusKm: atRadius }),
			nextEscalationAt: new Date("2026-01-01T00:00:00Z"),
		},
	});
}

async function readRequest() {
	const request = await prisma.bloodRequest.findUnique({
		where: { id: requestId },
		select: {
			status: true,
			currentRadiusKm: true,
			escalationLevel: true,
			nextEscalationAt: true,
			unitsAccepted: true,
		},
	});
	assert.ok(request);
	return {
		...request,
		currentRadiusKm: Number(request.currentRadiusKm),
	};
}

async function matchCount() {
	return prisma.requestMatch.count({ where: { requestId } });
}

describe("Issue 15 timed escalation widens the search", () => {
	it("sets up an approved hospital and radius-ordered donors", async () => {
		const admin = await signUp(`escalate-admin-15-${stamp}@example.com`, "Escalate Admin");
		adminId = admin.userId;
		await prisma.user.update({ where: { id: adminId }, data: { role: "admin" } });
		await recordConsentsForUser(adminId, {});

		const owner = await signUp(`escalate-owner-15-${stamp}@example.com`, "Escalate Owner");
		ownerId = owner.userId;
		ownerHeaders = owner.headers;
		await recordConsentsForUser(ownerId, {});

		const organization = await auth.api.createOrganization({
			body: {
				name: `Escalate Hospital ${stamp}`,
				slug: `escalate-hospital-15-${stamp}`,
				officialEmail: `official-15-${stamp}@example.com`,
				registrationNumber: `RC-15-${stamp}`,
				address: "1 Escalate Street, Yaba",
				state: "Lagos",
				latitude: 6.5244,
				longitude: 3.3792,
			},
			headers: ownerHeaders,
		} as Parameters<typeof auth.api.createOrganization>[0]);
		organizationId = organization.id as string;
		await approveHospital(adminId, { organizationId });

		await makeDonor("near", 6.5344);
		await makeDonor("mid", 6.6594);
		await makeDonor("far", 6.9294);

		const created = await createBloodRequest(organizationId, ownerId, {
			bloodGroup: "O_POS",
			unitsRequired: 5,
		});
		requestId = created.requestId;
		assert.equal(created.matchedDonorCount, 1);
		assert.equal(await matchCount(), 1);
	});

	it("widens by one step and matches only new donors on a due run", async () => {
		await forceDue();
		const before = new Date("2026-06-01T00:00:00Z");
		const result = await escalateDueRequests(before);
		assert.equal(result.escalated, 1);

		const request = await readRequest();
		assert.equal(request.currentRadiusKm, 20);
		assert.equal(request.escalationLevel, 1);
		assert.ok(
			(request.nextEscalationAt as Date).getTime() > before.getTime(),
			"timer resets to a future time",
		);

		assert.equal(await matchCount(), 2);
		const mid = await prisma.requestMatch.findUnique({
			where: {
				requestId_donorId: { requestId, donorId: donors.mid as string },
			},
			select: { status: true, escalationLevel: true },
		});
		assert.equal(String(mid?.status), "notified");
		assert.equal(mid?.escalationLevel, 1);
	});

	it("does nothing before the timer elapses, even across repeats", async () => {
		const first = await escalateDueRequests(new Date("2026-06-01T00:01:00Z"));
		assert.equal(first.escalated, 0);
		const second = await escalateDueRequests(new Date("2026-06-01T00:01:00Z"));
		assert.equal(second.escalated, 0);
		assert.equal(await matchCount(), 2);
	});

	it("escalates exactly once under concurrent runs with no dupes", async () => {
		await forceDue();
		const [first, second] = await Promise.all([
			escalateDueRequests(new Date("2026-07-01T00:00:00Z")),
			escalateDueRequests(new Date("2026-07-01T00:00:00Z")),
		]);
		assert.equal(first.escalated + second.escalated, 1);
		const request = await readRequest();
		assert.equal(request.currentRadiusKm, 30);
		assert.equal(await matchCount(), 2);
	});

	it("stops at the maximum radius and clears the timer", async () => {
		await forceDue(45);
		const result = await escalateDueRequests(new Date("2026-08-01T00:00:00Z"));
		assert.equal(result.escalated, 1);
		const request = await readRequest();
		assert.equal(request.currentRadiusKm, 50);
		assert.equal(request.nextEscalationAt, null);
		const far = await prisma.requestMatch.findUnique({
			where: {
				requestId_donorId: { requestId, donorId: donors.far as string },
			},
			select: { id: true },
		});
		assert.ok(far, "far donor within the maximum radius gets matched");

		const again = await escalateDueRequests(new Date("2026-09-01T00:00:00Z"));
		assert.equal(again.escalated, 0);
	});

	it("never escalates fulfilled or closed requests", async () => {
		await prisma.bloodRequest.update({
			where: { id: requestId },
			data: {
				unitsAccepted: 5,
				status: "fulfilled",
				nextEscalationAt: new Date("2026-01-01T00:00:00Z"),
			},
		});
		const result = await escalateDueRequests(new Date("2026-10-01T00:00:00Z"));
		assert.equal(result.escalated, 0);

		await prisma.bloodRequest.update({
			where: { id: requestId },
			data: { status: "cancelled", closedAt: new Date("2026-10-01T00:00:00Z") },
		});
		const closed = await escalateDueRequests(new Date("2026-10-01T00:00:00Z"));
		assert.equal(closed.escalated, 0);
	});
});

after(async () => {
	await deleteUsersCompletely(
		[
			adminId,
			ownerId,
			donors.near as string,
			donors.mid as string,
			donors.far as string,
		].filter(Boolean),
	);
	if (organizationId) {
		await deleteOrganizationCompletely(organizationId);
	}
});
