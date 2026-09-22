import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordConsentsForUser } from "@/servers/consent";
import {
	completeWalkthrough,
	getWalkthroughState,
	resetWalkthrough,
} from "@/servers/walkthrough";
import { deleteOrganizationCompletely, deleteUsersCompletely } from "./helpers";

const stamp = Date.now();
const password = "HospitalTest123!";

let donorId = "";
let ownerId = "";
let adminId = "";
let organizationId = "";

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

describe("Issue 27 first-time walkthroughs", () => {
	it("sets up a donor, a hospital owner and an admin", async () => {
		donorId = await signUp(`walk-donor-27-${stamp}@example.com`, "Walk Donor");
		await recordConsentsForUser(donorId, {});
		await prisma.donorProfile.create({
			data: {
				userId: donorId,
				donorCode: `WK27${String(stamp).slice(-6)}`,
				bloodGroup: "O_POS",
				state: "Lagos",
				verificationStatus: "verified",
			},
		});

		ownerId = await signUp(`walk-owner-27-${stamp}@example.com`, "Walk Owner");
		await recordConsentsForUser(ownerId, {});
		const ownerResponse = await auth.api.signInEmail({
			body: { email: `walk-owner-27-${stamp}@example.com`, password },
			headers: new Headers(),
			asResponse: true,
		});
		const ownerHeaders = new Headers();
		for (const setCookie of ownerResponse.headers.getSetCookie()) {
			const pair = setCookie.split(";")[0]?.trim();
			if (pair) ownerHeaders.append("cookie", pair);
		}
		const organization = await auth.api.createOrganization({
			body: {
				name: `Walk Hospital ${stamp}`,
				slug: `walk-hospital-27-${stamp}`,
				officialEmail: `official-27-${stamp}@example.com`,
				registrationNumber: `RC-27-${stamp}`,
				address: "1 Walk Street, Yaba",
				state: "Lagos",
				latitude: 6.5244,
				longitude: 3.3792,
			},
			headers: ownerHeaders,
		} as Parameters<typeof auth.api.createOrganization>[0]);
		assert.ok(organization?.id);
		organizationId = organization.id as string;

		adminId = await signUp(`walk-admin-27-${stamp}@example.com`, "Walk Admin");
		await prisma.user.update({
			where: { id: adminId },
			data: { role: "admin" },
		});
		await recordConsentsForUser(adminId, {});
	});

	it("shows the walkthrough on first sign-in with a per-role audience", async () => {
		const donor = await getWalkthroughState(donorId);
		assert.equal(donor.completed, false);
		assert.equal(donor.audience, "donor");

		const owner = await getWalkthroughState(ownerId);
		assert.equal(owner.completed, false);
		assert.equal(owner.audience, "hospital");

		const admin = await getWalkthroughState(adminId);
		assert.equal(admin.completed, false);
		assert.equal(admin.audience, "admin");
	});

	it("stores completion and supports replay", async () => {
		await completeWalkthrough(donorId);
		const done = await getWalkthroughState(donorId);
		assert.equal(done.completed, true);

		await resetWalkthrough(donorId);
		const replayed = await getWalkthroughState(donorId);
		assert.equal(replayed.completed, false);
		assert.equal(replayed.audience, "donor");
	});

	after(async () => {
		if (organizationId) {
			await deleteOrganizationCompletely(organizationId);
		}
		await deleteUsersCompletely([donorId, ownerId, adminId]);
	});
});
