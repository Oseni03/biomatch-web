import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordConsentsForUser } from "@/servers/consent";
import {
	approveHospital,
	getHospitalDetail,
	getVerificationQueue,
	listHospitals,
	reapplyForVerification,
	rejectHospital,
	reinstateHospital,
	requireAdmin,
	suspendHospital,
} from "@/servers/admin";
import { requireApprovedHospital } from "@/servers/organization";
import { deleteOrganizationCompletely, deleteUsersCompletely } from "./helpers";

const stamp = Date.now();
const ownerEmail = `hospital-owner-09-${stamp}@example.com`;
const adminEmail = `founder-admin-09-${stamp}@example.com`;
const password = "HospitalTest123!";

let ownerId = "";
let ownerHeaders = new Headers();
let secondOwnerId = "";
let secondOwnerHeaders = new Headers();
let adminId = "";
let organizationId = "";

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

async function createHospital(headers: Headers, suffix: string): Promise<string> {
	const organization = await auth.api.createOrganization({
		body: {
			name: `Approval Hospital ${suffix}`,
			slug: `approval-hospital-09-${suffix}`,
			officialEmail: `official-09-${suffix}@example.com`,
			registrationNumber: `RC-09-${suffix}`,
			address: "1 Approval Street, Yaba",
			state: "Lagos",
			latitude: 6.5244,
			longitude: 3.3792,
		},
		headers,
	} as Parameters<typeof auth.api.createOrganization>[0]);
	assert.ok(organization?.id);
	return organization.id as string;
}

describe("Issue 09 admin hospital approval", () => {
	it("sets up an owner hospital (pending) and a founder admin", async () => {
		const owner = await signUp(ownerEmail, "Hospital Owner");
		ownerId = owner.userId;
		ownerHeaders = owner.headers;
		organizationId = await createHospital(ownerHeaders, String(stamp));
		await recordConsentsForUser(ownerId, {});

		const admin = await signUp(adminEmail, "Founder Admin");
		adminId = admin.userId;
		await prisma.user.update({ where: { id: adminId }, data: { role: "admin" } });
		await recordConsentsForUser(adminId, {});
		await requireAdmin(adminId);

		const secondOwner = await signUp(`second-owner-09-${stamp}@example.com`, "Second Owner");
		secondOwnerId = secondOwner.userId;
		secondOwnerHeaders = secondOwner.headers;
		await recordConsentsForUser(secondOwnerId, {});
	});

	it("blocks non-admin callers from admin endpoints", async () => {
		await assert.rejects(requireAdmin(ownerId), /Admin access required/);
		await assert.rejects(
			approveHospital(ownerId, { organizationId }),
			/Admin access required/,
		);
		await assert.rejects(
			listHospitals(ownerId, {}),
			/Admin access required/,
		);
	});

	it("lists the hospital and shows it in the review queue", async () => {
		const queue = await getVerificationQueue(adminId);
		assert.ok(queue.some((item) => item.organization.id === organizationId));

		const listed = await listHospitals(adminId, { status: "pending" });
		assert.ok(listed.hospitals.some((hospital) => hospital.id === organizationId));
		assert.equal(
			listed.hospitals.find((hospital) => hospital.id === organizationId)?.verificationStatus,
			"pending",
		);

		const searched = await listHospitals(adminId, { search: "Approval Hospital" });
		assert.ok(searched.hospitals.some((hospital) => hospital.id === organizationId));
	});

	it("requires a reason to reject", async () => {
		await assert.rejects(
			rejectHospital(adminId, { organizationId, reason: "   " }),
			/reason/i,
		);
	});

	it("approves atomically: status, application and audit log", async () => {
		const outcome = await approveHospital(adminId, {
			organizationId,
			notes: "RC verified against CAC extract",
		});
		assert.equal(outcome.verificationStatus, "approved");

		const organization = await prisma.organization.findUnique({
			where: { id: organizationId },
		});
		assert.equal(organization?.verificationStatus, "approved");
		assert.ok(organization?.approvedAt);

		const application = await prisma.hospitalVerification.findFirst({
			where: { organizationId, decision: "approved" },
		});
		assert.ok(application);
		assert.equal(application?.reviewedBy, adminId);
		assert.ok(application?.reviewedAt);
		assert.equal(application?.notes, "RC verified against CAC extract");

		const audit = await prisma.auditLog.findFirst({
			where: { organizationId, action: "hospital.approve" },
		});
		assert.ok(audit);
		assert.equal(audit?.actorId, adminId);

		await requireApprovedHospital(organizationId);
	});

	it("suspends and reinstates an approved hospital", async () => {
		const suspended = await suspendHospital(adminId, { organizationId });
		assert.equal(suspended.verificationStatus, "suspended");
		await assert.rejects(requireApprovedHospital(organizationId), /awaiting approval/);

		await assert.rejects(suspendHospital(adminId, { organizationId }), /approved/);

		const reinstated = await reinstateHospital(adminId, { organizationId });
		assert.equal(reinstated.verificationStatus, "approved");
		await requireApprovedHospital(organizationId);

		await assert.rejects(reinstateHospital(adminId, { organizationId }), /suspended/);
	});

	it("rejects with reason, lets the hospital reapply once, and keeps it restricted", async () => {
		const secondOrgId = await createHospital(secondOwnerHeaders, `${stamp}-b`);

		const rejected = await rejectHospital(adminId, {
			organizationId: secondOrgId,
			reason: "Registration number could not be verified",
		});
		assert.equal(rejected.verificationStatus, "rejected");
		await assert.rejects(requireApprovedHospital(secondOrgId), /awaiting approval/);

		const detail = await getHospitalDetail(adminId, secondOrgId);
		assert.equal(detail.verificationStatus, "rejected");
		assert.ok(
			detail.applications.some(
				(application) =>
					application.decision === "rejected" &&
					application.rejectionReason === "Registration number could not be verified",
			),
		);

		const { applicationId } = await reapplyForVerification(secondOrgId, secondOwnerId);
		assert.ok(applicationId);
		const pending = await prisma.hospitalVerification.findUnique({
			where: { id: applicationId },
		});
		assert.equal(pending?.decision, "pending");

		await assert.rejects(
			reapplyForVerification(secondOrgId, secondOwnerId),
			/pending application/,
		);
		await assert.rejects(requireApprovedHospital(secondOrgId), /awaiting approval/);

		await prisma.organization.delete({ where: { id: secondOrgId } });
	});

	after(async () => {
		await deleteOrganizationCompletely(organizationId);
		await deleteUsersCompletely([ownerId, secondOwnerId, adminId]);
	});
});
