import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUniqueDonorCode } from "@/lib/donor-code";
import { recordConsentsForUser } from "@/servers/consent";
import { approveHospital } from "@/servers/admin";
import { createBloodRequest } from "@/servers/requests";
import { declineMatch } from "@/servers/responses";
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
	const signed = await signUp(`decline-${key}-14-${stamp}@example.com`, `Donor ${key}`);
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

async function matchIdFor(donorKey: string): Promise<string> {
	const match = await prisma.requestMatch.findUnique({
		where: {
			requestId_donorId: { requestId, donorId: donors[donorKey] as string },
		},
		select: { id: true },
	});
	assert.ok(match, `expected a match for ${donorKey}`);
	return match.id;
}

describe("Issue 14 decline chains the next-closest donor", () => {
	it("sets up an approved hospital and distance-ordered donors", async () => {
		const admin = await signUp(`decline-admin-14-${stamp}@example.com`, "Decline Admin");
		adminId = admin.userId;
		await prisma.user.update({ where: { id: adminId }, data: { role: "admin" } });
		await recordConsentsForUser(adminId, {});

		const owner = await signUp(`decline-owner-14-${stamp}@example.com`, "Decline Owner");
		ownerId = owner.userId;
		ownerHeaders = owner.headers;
		await recordConsentsForUser(ownerId, {});

		const organization = await auth.api.createOrganization({
			body: {
				name: `Decline Hospital ${stamp}`,
				slug: `decline-hospital-14-${stamp}`,
				officialEmail: `official-14-${stamp}@example.com`,
				registrationNumber: `RC-14-${stamp}`,
				address: "1 Decline Street, Yaba",
				state: "Lagos",
				latitude: 6.5244,
				longitude: 3.3792,
			},
			headers: ownerHeaders,
		} as Parameters<typeof auth.api.createOrganization>[0]);
		organizationId = organization.id as string;
		await approveHospital(adminId, { organizationId });

		await makeDonor("near", 6.5344);
		await makeDonor("mid1", 6.6594);
		await makeDonor("mid2", 6.7494);
		await makeDonor("farout", 7.1);

		const created = await createBloodRequest(organizationId, ownerId, {
			bloodGroup: "O_POS",
			unitsRequired: 5,
		});
		requestId = created.requestId;
		assert.equal(created.matchedDonorCount, 1);
		assert.ok(await matchIdFor("near"));
		assert.equal(
			await prisma.requestMatch.findUnique({
				where: {
					requestId_donorId: { requestId, donorId: donors.mid1 as string },
				},
				select: { id: true },
			}),
			null,
		);
	});

	it("notifies the next-closest donor when the first declines", async () => {
		const result = await declineMatch(await matchIdFor("near"), donors.near as string);
		assert.equal(result.status, "declined");
		assert.equal(result.notifiedDonor, true);
		assert.ok(result.respondedAt instanceof Date);

		const declined = await prisma.requestMatch.findUnique({
			where: { id: result.matchId },
			select: { status: true, respondedAt: true },
		});
		assert.equal(String(declined?.status), "declined");
		assert.ok(declined?.respondedAt instanceof Date);

		const chained = await prisma.requestMatch.findUnique({
			where: {
				requestId_donorId: { requestId, donorId: donors.mid1 as string },
			},
			select: { status: true },
		});
		assert.equal(String(chained?.status), "notified");
		const notice = await prisma.notification.findFirst({
			where: {
				userId: donors.mid1 as string,
				type: "request.matched",
				body: { contains: "next-closest" },
			},
			select: { id: true },
		});
		assert.ok(notice, "mid1 should be notified as the next-closest donor");
	});

	it("chains in distance order on the second decline", async () => {
		const result = await declineMatch(await matchIdFor("mid1"), donors.mid1 as string);
		assert.equal(result.notifiedDonor, true);
		const chained = await prisma.requestMatch.findUnique({
			where: {
				requestId_donorId: { requestId, donorId: donors.mid2 as string },
			},
			select: { status: true },
		});
		assert.equal(String(chained?.status), "notified");
	});

	it("resolves cleanly with no dupes when no candidates remain", async () => {
		const before = await prisma.requestMatch.count({ where: { requestId } });
		const result = await declineMatch(await matchIdFor("mid2"), donors.mid2 as string);
		assert.equal(result.notifiedDonor, false);
		const after = await prisma.requestMatch.count({ where: { requestId } });
		assert.equal(after, before);

		const repeat = await declineMatch(await matchIdFor("mid2"), donors.mid2 as string);
		assert.equal(repeat.status, "declined");
		assert.equal(repeat.notifiedDonor, false);
		assert.equal(await prisma.requestMatch.count({ where: { requestId } }), before);

		const farout = await prisma.requestMatch.findUnique({
			where: {
				requestId_donorId: { requestId, donorId: donors.farout as string },
			},
			select: { id: true },
		});
		assert.equal(farout, null);
	});

	it("rejects declines from anyone but the matched donor", async () => {
		await assert.rejects(
			declineMatch(await matchIdFor("near"), donors.mid1 as string),
			/Match not found/,
		);
	});
});

after(async () => {
	await deleteUsersCompletely([
		adminId,
		ownerId,
		donors.near as string,
		donors.mid1 as string,
		donors.mid2 as string,
		donors.farout as string,
	].filter(Boolean));
	if (organizationId) {
		await deleteOrganizationCompletely(organizationId);
	}
});
