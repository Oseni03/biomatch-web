import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUniqueDonorCode } from "@/lib/donor-code";
import { recordConsentsForUser } from "@/servers/consent";
import { getDonorProfile } from "@/servers/user";
import { approveHospital, setScreeningPartner } from "@/servers/admin";
import {
	checkScreeningLookupRateLimit,
	listRecentScreenings,
	lookupDonorByCode,
	recordScreening,
} from "@/servers/screening";

const stamp = Date.now();
const password = "HospitalTest123!";

let adminId = "";
let ownerId = "";
let ownerHeaders = new Headers();
let staffId = "";
let organizationId = "";
let donorId = "";
let donorCode = "";

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

describe("Issue 11 donor screening by donor code", () => {
	it("approves a hospital and marks it a screening partner through the admin flow", async () => {
		const admin = await signUp(`screen-admin-11-${stamp}@example.com`, "Screen Admin");
		adminId = admin.userId;
		await prisma.user.update({ where: { id: adminId }, data: { role: "admin" } });
		await recordConsentsForUser(adminId, {});

		const owner = await signUp(`screen-owner-11-${stamp}@example.com`, "Screen Owner");
		ownerId = owner.userId;
		ownerHeaders = owner.headers;
		await recordConsentsForUser(ownerId, {});

		const organization = await auth.api.createOrganization({
			body: {
				name: `Screen Hospital ${stamp}`,
				slug: `screen-hospital-11-${stamp}`,
				officialEmail: `official-11-${stamp}@example.com`,
				registrationNumber: `RC-11-${stamp}`,
				address: "1 Screen Street, Yaba",
				state: "Lagos",
				latitude: 6.5244,
				longitude: 3.3792,
			},
			headers: ownerHeaders,
		} as Parameters<typeof auth.api.createOrganization>[0]);
		organizationId = organization.id as string;

		await assert.rejects(
			setScreeningPartner(adminId, { organizationId, isScreeningPartner: true }),
			/approved/,
		);
		await approveHospital(adminId, { organizationId });
		const partner = await setScreeningPartner(adminId, {
			organizationId,
			isScreeningPartner: true,
		});
		assert.equal(partner.isScreeningPartner, true);
	});

	it("registers a donor with a donor code", async () => {
		const donor = await signUp(`screen-donor-11-${stamp}@example.com`, "Screen Donor");
		donorId = donor.userId;
		await recordConsentsForUser(donorId, {});
		donorCode = await generateUniqueDonorCode(async (code) => {
			const existing = await prisma.donorProfile.findUnique({
				where: { donorCode: code },
				select: { userId: true },
			});
			return !!existing;
		});
		await prisma.donorProfile.create({
			data: {
				userId: donorId,
				donorCode,
				bloodGroup: "O_POS",
				state: "Lagos",
				homeLatitude: 6.5244,
				homeLongitude: 3.3792,
			},
		});
		const profile = await getDonorProfile(donorId);
		assert.equal(profile?.verificationStatus, "unverified");
	});

	it("rejects lookups and recordings from staff without the permission", async () => {
		const staff = await signUp(`screen-staff-11-${stamp}@example.com`, "Desk Staff");
		staffId = staff.userId;
		await recordConsentsForUser(staffId, {});
		await prisma.member.create({
			data: { organizationId, userId: staffId, role: "member" },
		});

		await assert.rejects(
			lookupDonorByCode(organizationId, staffId, donorCode),
			/Not authorized/,
		);
		await assert.rejects(
			recordScreening(organizationId, staffId, { donorCode, result: "passed" }),
			/Not authorized/,
		);
	});

	it("returns a generic not-found for unknown codes", async () => {
		await assert.rejects(
			lookupDonorByCode(organizationId, ownerId, "BM-000000"),
			/No donor found for this code/,
		);
		await assert.rejects(
			lookupDonorByCode(organizationId, ownerId, "not-a-code"),
			/No donor found for this code/,
		);
	});

	it("looks up the donor and records passed, failed and re-screened results", async () => {
		const found = await lookupDonorByCode(organizationId, ownerId, donorCode.toLowerCase());
		assert.equal(found.name, "Screen Donor");
		assert.equal(found.bloodGroup, "O_POS");
		assert.equal(found.verificationStatus, "unverified");

		const passed = await recordScreening(organizationId, ownerId, {
			donorCode,
			result: "passed",
			notes: "Hb 14.2, BP normal",
		});
		assert.equal(passed.verificationStatus, "verified");

		const failed = await recordScreening(organizationId, ownerId, {
			donorCode,
			result: "failed",
		});
		assert.equal(failed.verificationStatus, "failed");

		const rescreened = await recordScreening(organizationId, ownerId, {
			donorCode,
			result: "passed",
		});
		assert.equal(rescreened.verificationStatus, "verified");

		const profile = await getDonorProfile(donorId);
		assert.equal(profile?.verificationStatus, "verified");
		assert.ok(profile?.verifiedAt);

		const recent = await listRecentScreenings(organizationId, ownerId);
		assert.equal(recent.total, 3);
		assert.deepEqual(
			recent.screenings.map((row) => row.result),
			["passed", "failed", "passed"],
		);

		const audit = await prisma.auditLog.findFirst({
			where: { organizationId, action: "hospital.screening_record" },
		});
		assert.ok(audit);
		assert.equal(audit?.actorId, ownerId);
	});

	it("enforces the partner rule in the database trigger too", async () => {
		await setScreeningPartner(adminId, { organizationId, isScreeningPartner: false });
		await assert.rejects(
			recordScreening(organizationId, ownerId, { donorCode, result: "passed" }),
			/screening-partner/,
		);
		await assert.rejects(
			prisma.donorScreening.create({
				data: {
					donorId,
					organizationId,
					recordedById: ownerId,
					result: "passed",
				},
			}),
			/screening partner/,
		);
		await setScreeningPartner(adminId, { organizationId, isScreeningPartner: true });
	});

	it("rate limits donor lookups", async () => {
		await lookupDonorByCode(organizationId, ownerId, donorCode);
		await checkScreeningLookupRateLimit(ownerId, 100000, 60 * 1000);
		await assert.rejects(
			checkScreeningLookupRateLimit(ownerId, 1, 60 * 60 * 1000),
			/Too many lookups/,
		);
	});

	after(async () => {
		if (organizationId) {
			await prisma.organization.delete({ where: { id: organizationId } }).catch(() => {});
		}
		for (const id of [adminId, ownerId, staffId, donorId]) {
			if (id) {
				await prisma.user.delete({ where: { id } }).catch(() => {});
			}
		}
	});
});
