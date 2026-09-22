import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUniqueDonorCode } from "@/lib/donor-code";
import { recordConsentsForUser } from "@/servers/consent";
import { getAdminOverviewCounts } from "@/servers/admin";
import {
	deleteOrganizationCompletely,
	deleteUsersCompletely,
} from "./helpers";

const stamp = Date.now();
const password = "OverviewTest123!";
const VOLUME_DONORS = 100;

let adminId = "";
let organizationId = "";
const volumeUserIds: string[] = [];

async function uniqueDonorCode(): Promise<string> {
	return generateUniqueDonorCode(async (candidate) => {
		const existing = await prisma.donorProfile.findUnique({
			where: { donorCode: candidate },
			select: { userId: true },
		});
		return !!existing;
	});
}

describe("Issue 25 admin platform overview metrics", () => {
	it("sets up an admin caller", async () => {
		const response = await auth.api.signUpEmail({
			body: { email: `overview-admin-25-${stamp}@example.com`, password, name: "Overview Admin" },
			headers: new Headers(),
			asResponse: true,
		});
		assert.equal(response.status, 200);
		const data = (await response.json()) as { user?: { id?: string } };
		adminId = data.user?.id as string;
		await prisma.user.update({ where: { id: adminId }, data: { role: "admin" } });
		await recordConsentsForUser(adminId, {});
	});

	it("moves all four metrics by exactly the seeded deltas", async () => {
		const before = await getAdminOverviewCounts(adminId);

		const organization = await prisma.organization.create({
			data: {
				name: `Overview Hospital ${stamp}`,
				slug: `overview-hospital-25-${stamp}`,
				officialEmail: `official-25-${stamp}@example.com`,
				address: "1 Overview Street, Yaba",
				state: "Lagos",
				latitude: 6.5244,
				longitude: 3.3792,
			},
			select: { id: true },
		});
		organizationId = organization.id;

		for (let index = 0; index < VOLUME_DONORS; index += 1) {
			const user = await prisma.user.create({
				data: { name: `Volume Donor ${index}`, email: `volume-${index}-25-${stamp}@example.com` },
				select: { id: true },
			});
			volumeUserIds.push(user.id);
			await prisma.donorProfile.create({
				data: {
					userId: user.id,
					donorCode: await uniqueDonorCode(),
					bloodGroup: "O_POS",
					state: "Lagos",
					verificationStatus: "verified",
				},
			});
		}

		const request = await prisma.bloodRequest.create({
			data: {
				organizationId,
				createdById: adminId,
				bloodGroup: "O_POS",
				unitsRequired: 1,
				locationName: "Overview Hospital",
				latitude: 6.5244,
				longitude: 3.3792,
				currentRadiusKm: 10,
				status: "active",
			},
			select: { id: true },
		});
		const match = await prisma.requestMatch.create({
			data: {
				requestId: request.id,
				donorId: volumeUserIds[0] as string,
				distanceKm: 1.1,
				status: "accepted",
			},
			select: { id: true },
		});
		const now = new Date();
		await prisma.donation.create({
			data: {
				matchId: match.id,
				requestId: request.id,
				donorId: volumeUserIds[0] as string,
				organizationId,
				status: "completed",
				donorConfirmedAt: now,
				hospitalConfirmedAt: now,
				completedAt: now,
			},
		});

		const timedStart = Date.now();
		const after = await getAdminOverviewCounts(adminId);
		const elapsedMs = Date.now() - timedStart;

		assert.equal(after.totalHospitals - before.totalHospitals, 1);
		assert.equal(after.totalDonors - before.totalDonors, VOLUME_DONORS);
		assert.equal(after.activeRequests - before.activeRequests, 1);
		assert.equal(after.completedDonations - before.completedDonations, 1);
		assert.ok(elapsedMs < 30_000, `metrics took ${elapsedMs}ms with ${VOLUME_DONORS} donors`);
	});

	it("rejects non-admin callers", async () => {
		await assert.rejects(getAdminOverviewCounts(volumeUserIds[0] as string));
	});

	after(async () => {
		if (organizationId) {
			await deleteOrganizationCompletely(organizationId);
		}
		await deleteUsersCompletely([adminId]);
		// Volume donors hold no ledger, wallet, voucher or match rows beyond the
		// single seeded donation (removed with the organization above), so bulk
		// deletes keep cleanup fast. The admin goes through the full helper.
		const volumeEmails = volumeUserIds.map((_, index) => `volume-${index}-25-${stamp}@example.com`);
		await prisma.donorProfile.deleteMany({
			where: { user: { email: { in: volumeEmails } } },
		});
		await prisma.user.deleteMany({ where: { email: { in: volumeEmails } } });
	});
});
