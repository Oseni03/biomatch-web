import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUniqueDonorCode } from "@/lib/donor-code";
import { recordConsentsForUser } from "@/servers/consent";
import { approveHospital } from "@/servers/admin";
import { createBloodRequest } from "@/servers/requests";
import {
	acceptMatch,
	getMyResponses,
	getRequestDonorView,
	withdrawMatch,
} from "@/servers/responses";
import {
	deleteOrganizationCompletely,
	deleteUsersCompletely,
} from "./helpers";

const stamp = Date.now();
const password = "HospitalTest123!";

let adminId = "";
let ownerId = "";
let ownerHeaders = new Headers();
let staffId = "";
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
	const signed = await signUp(`accept-${key}-13-${stamp}@example.com`, `Donor ${key}`);
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

describe("Issue 13 accept with unit cap and donor view", () => {
	it("sets up an approved hospital and four matched donors", async () => {
		const admin = await signUp(`accept-admin-13-${stamp}@example.com`, "Accept Admin");
		adminId = admin.userId;
		await prisma.user.update({ where: { id: adminId }, data: { role: "admin" } });
		await recordConsentsForUser(adminId, {});

		const owner = await signUp(`accept-owner-13-${stamp}@example.com`, "Accept Owner");
		ownerId = owner.userId;
		ownerHeaders = owner.headers;
		await recordConsentsForUser(ownerId, {});

		const organization = await auth.api.createOrganization({
			body: {
				name: `Accept Hospital ${stamp}`,
				slug: `accept-hospital-13-${stamp}`,
				officialEmail: `official-13-${stamp}@example.com`,
				registrationNumber: `RC-13-${stamp}`,
				address: "1 Accept Street, Yaba",
				state: "Lagos",
				latitude: 6.5244,
				longitude: 3.3792,
			},
			headers: ownerHeaders,
		} as Parameters<typeof auth.api.createOrganization>[0]);
		organizationId = organization.id as string;
		await approveHospital(adminId, { organizationId });

		const staff = await signUp(`accept-staff-13-${stamp}@example.com`, "Accept Staff");
		staffId = staff.userId;
		await recordConsentsForUser(staffId, {});
		await prisma.member.create({
			data: { organizationId, userId: staffId, role: "member" },
		});

		for (const key of ["d1", "d2", "d3", "d4"]) {
			await makeDonor(key);
		}
		const created = await createBloodRequest(organizationId, ownerId, {
			bloodGroup: "O_POS",
			unitsRequired: 2,
		});
		requestId = created.requestId;
		assert.equal(created.matchedDonorCount, 4);
		const rows = await prisma.requestMatch.findMany({ where: { requestId } });
		for (const row of rows) {
			const key = Object.keys(donors).find((name) => donors[name] === row.donorId);
			if (key) matches[key] = row.id;
		}
		assert.equal(Object.keys(matches).length, 4);
	});

	it("accepts one donor: counter, donation record and hospital notification", async () => {
		const result = await acceptMatch(matches["d1"] as string, donors["d1"] as string);
		assert.equal(result.status, "accepted");
		assert.equal(result.unitsAccepted, 1);
		assert.equal(result.requestStatus, "active");

		const donation = await prisma.donation.findUnique({
			where: { matchId: matches["d1"] as string },
		});
		assert.ok(donation);
		assert.equal(String(donation?.status), "pending");

		const hospitalNotice = await prisma.notification.findFirst({
			where: { userId: ownerId, type: "request.donor_accepted" },
		});
		assert.ok(hospitalNotice);

		const repeat = await acceptMatch(matches["d1"] as string, donors["d1"] as string);
		assert.equal(repeat.status, "accepted");
		assert.equal(repeat.unitsAccepted, 1);
	});

	it("caps simultaneous accepts at units required without overfilling", async () => {
		const outcomes = await Promise.allSettled([
			acceptMatch(matches["d2"] as string, donors["d2"] as string),
			acceptMatch(matches["d3"] as string, donors["d3"] as string),
			acceptMatch(matches["d4"] as string, donors["d4"] as string),
		]);
		const accepted = outcomes.filter(
			(outcome) =>
				outcome.status === "fulfilled" && outcome.value.status === "accepted",
		);
		const filled = outcomes.filter(
			(outcome) => outcome.status === "fulfilled" && outcome.value.status === "filled",
		);
		assert.equal(accepted.length, 1);
		assert.equal(filled.length, 2);

		const request = await prisma.bloodRequest.findUnique({ where: { id: requestId } });
		assert.equal(request?.unitsAccepted, 2);
		assert.equal(String(request?.status), "fulfilled");

		const acceptedRows = await prisma.requestMatch.count({
			where: { requestId, status: "accepted" },
		});
		assert.equal(acceptedRows, 2);

		const filledNotice = await prisma.notification.findFirst({
			where: {
				type: "request.filled",
				data: { path: ["matchId"], equals: matches["d3"] as string },
			},
		});
		assert.ok(filledNotice ?? (await prisma.notification.count({
			where: { type: "request.filled" },
		})));
	});

	it("withdraws an acceptance: counter decrements and the request reopens", async () => {
		const result = await withdrawMatch(matches["d1"] as string, donors["d1"] as string);
		assert.equal(result.unitsAccepted, 1);
		assert.equal(result.requestStatus, "active");

		const donation = await prisma.donation.findUnique({
			where: { matchId: matches["d1"] as string },
		});
		assert.equal(donation, null);

		const reopened = await prisma.requestMatch.findMany({ where: { requestId } });
		assert.ok(reopened.every((row) => String(row.status) !== "filled"));

		const responses = await getMyResponses(donors["d1"] as string);
		assert.equal(responses.total, 0);

		await assert.rejects(
			withdrawMatch(matches["d1"] as string, donors["d1"] as string),
			/Only an accepted match/,
		);
	});

	it("rejects accepts from ineligible and unmatched donors", async () => {
		const unverified = await signUp(`accept-unv-13-${stamp}@example.com`, "Unverified");
		await recordConsentsForUser(unverified.userId, {});
		const code = await generateUniqueDonorCode(async (candidate) => {
			const existing = await prisma.donorProfile.findUnique({
				where: { donorCode: candidate },
				select: { userId: true },
			});
			return !!existing;
		});
		await prisma.donorProfile.create({
			data: {
				userId: unverified.userId,
				donorCode: code,
				bloodGroup: "O_POS",
				state: "Lagos",
				homeLatitude: 6.5344,
				homeLongitude: 3.3792,
				verificationStatus: "unverified",
			},
		});
		donors["unverified"] = unverified.userId;
		const planted = await prisma.requestMatch.create({
			data: {
				requestId,
				donorId: unverified.userId,
				status: "notified",
				distanceKm: 1.1,
			},
		});
		await assert.rejects(
			acceptMatch(planted.id, unverified.userId),
			/not currently eligible/,
		);
		await prisma.requestMatch.delete({ where: { id: planted.id } });

		const outsider = await signUp(`accept-out-13-${stamp}@example.com`, "Outsider");
		await recordConsentsForUser(outsider.userId, {});
		donors["outsider"] = outsider.userId;
		await assert.rejects(
			acceptMatch(matches["d2"] as string, outsider.userId),
			/Match not found/,
		);
	});

	it("shows the hospital a donor view with contact only after acceptance", async () => {
		const view = await getRequestDonorView(organizationId, ownerId, requestId);
		assert.ok(view.matches.length >= 4);
		const acceptedEntry = view.matches.find((entry) => String(entry.status) === "accepted");
		assert.ok(acceptedEntry);
		assert.ok(acceptedEntry?.donor?.name);
		assert.ok(acceptedEntry?.donor?.donorCode);
		const waitingEntry = view.matches.find((entry) => String(entry.status) === "notified");
		assert.ok(waitingEntry);
		assert.equal(waitingEntry?.donor, null);

		const staffView = await getRequestDonorView(organizationId, staffId, requestId);
		assert.equal(staffView.matches.length, view.matches.length);

		await assert.rejects(
			getRequestDonorView(organizationId, donors["d1"] as string, requestId),
			/not a member/,
		);
	});

	after(async () => {
		await deleteOrganizationCompletely(organizationId);
		await deleteUsersCompletely([
			adminId,
			ownerId,
			staffId,
			...Object.values(donors),
		]);
	});
});
