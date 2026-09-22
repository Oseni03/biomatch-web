import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUniqueDonorCode } from "@/lib/donor-code";
import { recordConsentsForUser } from "@/servers/consent";
import {
	approveHospital,
	getDonorDetail,
	liftDonorRestriction,
	listDonors,
	restrictDonor,
} from "@/servers/admin";
import { createBloodRequest } from "@/servers/requests";
import { getWalletBalance } from "@/servers/wallet";
import { listVouchersForDonor } from "@/servers/vouchers";
import {
	deleteOrganizationCompletely,
	deleteUsersCompletely,
} from "./helpers";

const stamp = Date.now();
const password = "DonorAdminTest123!";

let adminId = "";
let ownerId = "";
let ownerHeaders = new Headers();
let organizationId = "";
let donorId = "";
let donorCode = "";
let otherDonorId = "";

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

async function makeDonor(emailPrefix: string, name: string, withPin: boolean): Promise<string> {
	const signed = await signUp(`${emailPrefix}-24-${stamp}@example.com`, name);
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
			...(withPin ? { homeLatitude: 6.5344, homeLongitude: 3.3792 } : {}),
			verificationStatus: "verified",
		},
	});
	return signed.userId;
}

describe("Issue 24 admin donor management", () => {
	it("sets up an admin, an approved hospital and two donors", async () => {
		const admin = await signUp(`donor-admin-24-${stamp}@example.com`, "Donor Admin");
		adminId = admin.userId;
		await prisma.user.update({ where: { id: adminId }, data: { role: "admin" } });
		await recordConsentsForUser(adminId, {});

		const owner = await signUp(`donor-owner-24-${stamp}@example.com`, "Donor Owner");
		ownerId = owner.userId;
		ownerHeaders = owner.headers;
		await recordConsentsForUser(ownerId, {});

		const organization = await auth.api.createOrganization({
			body: {
				name: `Donor Hospital ${stamp}`,
				slug: `donor-hospital-24-${stamp}`,
				officialEmail: `official-24-${stamp}@example.com`,
				registrationNumber: `RC-24-${stamp}`,
				address: "1 Donor Street, Yaba",
				state: "Lagos",
				latitude: 6.5244,
				longitude: 3.3792,
			},
			headers: ownerHeaders,
		} as Parameters<typeof auth.api.createOrganization>[0]);
		organizationId = organization.id as string;
		await approveHospital(adminId, { organizationId });

		donorId = await makeDonor("donor-managed", "Managed Donor", true);
		const code = await prisma.donorProfile.findUnique({
			where: { userId: donorId },
			select: { donorCode: true },
		});
		donorCode = code?.donorCode as string;
		otherDonorId = await makeDonor("donor-other", "Other Donor", false);
	});

	it("lists, searches and filters donors", async () => {
		const all = await listDonors(adminId, {});
		assert.ok(all.total >= 2);
		assert.ok(all.donors.some((donor) => donor.userId === donorId));

		const byName = await listDonors(adminId, { search: "Managed Donor" });
		assert.ok(byName.donors.some((donor) => donor.userId === donorId));
		assert.ok(byName.donors.every((donor) => donor.name.includes("Managed")));

		const byCode = await listDonors(adminId, { search: donorCode });
		assert.equal(byCode.total, 1);
		assert.equal(byCode.donors[0]?.userId, donorId);

		const byGroup = await listDonors(adminId, { bloodGroup: "O_POS" });
		assert.ok(byGroup.donors.some((donor) => donor.userId === donorId));
		const noGroup = await listDonors(adminId, { bloodGroup: "AB_NEG" });
		assert.ok(noGroup.donors.every((donor) => donor.userId !== donorId));

		const byVerification = await listDonors(adminId, { verificationStatus: "verified" });
		assert.ok(byVerification.donors.some((donor) => donor.userId === donorId));

		const byState = await listDonors(adminId, { state: "lag" });
		assert.ok(byState.donors.some((donor) => donor.userId === donorId));

		await assert.rejects(listDonors(donorId, {}));
	});

	it("shows verification, donations and restriction state in the detail", async () => {
		const detail = await getDonorDetail(adminId, donorId);
		assert.ok(detail);
		assert.equal(detail.donorCode, donorCode);
		assert.equal(detail.verificationStatus, "verified");
		assert.equal(detail.donorStatus, "active");
		assert.equal(detail.donationCount, 0);
		assert.equal(detail.completedDonationCount, 0);
		assert.equal(detail.restrictedReason, null);
		assert.equal(await getDonorDetail(adminId, "00000000-0000-0000-0000-000000000000"), null);
	});

	it("restricting requires a reason, audits, and removes the donor from matching at once", async () => {
		await assert.rejects(restrictDonor(adminId, donorId, { reason: "   " }));
		await assert.rejects(restrictDonor(adminId, donorId, {}));

		const before = await createBloodRequest(organizationId, ownerId, {
			bloodGroup: "O_POS",
			unitsRequired: 1,
		});
		assert.ok(before.matchedDonorCount >= 1);

		await restrictDonor(adminId, donorId, { reason: "Under investigation" });
		const detail = await getDonorDetail(adminId, donorId);
		assert.equal(detail?.donorStatus, "restricted");
		assert.equal(detail?.restrictedReason, "Under investigation");
		assert.equal(detail?.restrictedByName, "Donor Admin");
		assert.ok(detail?.restrictedAt instanceof Date);

		const audit = await prisma.auditLog.findFirst({
			where: { action: "donor.restrict", entityId: donorId },
			select: { id: true },
		});
		assert.ok(audit);

		const after = await createBloodRequest(organizationId, ownerId, {
			bloodGroup: "O_POS",
			unitsRequired: 1,
		});
		assert.equal(after.matchedDonorCount, 0);

		const listed = await listDonors(adminId, { donorStatus: "restricted" });
		assert.ok(listed.donors.some((donor) => donor.userId === donorId));
	});

	it("restricted donors stay signed in and keep read access to their screens", async () => {
		const balance = await getWalletBalance(donorId);
		assert.equal(typeof balance.balanceKobo, "number");
		const vouchers = await listVouchersForDonor(donorId, {});
		assert.equal(vouchers.total, 0);
	});

	it("lifting restores eligibility subject to the other rules", async () => {
		await liftDonorRestriction(adminId, donorId);
		const detail = await getDonorDetail(adminId, donorId);
		assert.equal(detail?.donorStatus, "active");
		assert.equal(detail?.restrictedReason, null);

		const audit = await prisma.auditLog.findFirst({
			where: { action: "donor.lift_restriction", entityId: donorId },
			select: { id: true },
		});
		assert.ok(audit);

		const after = await createBloodRequest(organizationId, ownerId, {
			bloodGroup: "O_POS",
			unitsRequired: 1,
		});
		assert.ok(after.matchedDonorCount >= 1);
	});

	it("rejects non-admin callers and unknown donors", async () => {
		await assert.rejects(restrictDonor(donorId, donorId, { reason: "Nope" }));
		await assert.rejects(liftDonorRestriction(donorId, donorId));
		await assert.rejects(
			restrictDonor(adminId, "00000000-0000-0000-0000-000000000000", { reason: "Nope" }),
			/Donor not found/,
		);
		await assert.rejects(liftDonorRestriction(adminId, "00000000-0000-0000-0000-000000000000"));
	});

	after(async () => {
		if (organizationId) {
			await deleteOrganizationCompletely(organizationId);
		}
		await deleteUsersCompletely([adminId, ownerId, donorId, otherDonorId]);
	});
});
