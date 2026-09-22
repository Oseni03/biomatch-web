import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordConsentsForUser } from "@/servers/consent";
import { createBloodRequest } from "@/servers/requests";
import { deleteOrganizationCompletely, deleteUsersCompletely } from "./helpers";
import {
	getOrganizationVerificationStatus,
	requireApprovedHospital,
} from "@/servers/organization";

const stamp = Date.now();
const email = `hospital-verify-${stamp}@example.com`;
const password = "HospitalTest123!";
const slug = `test-hospital-verify-${stamp}`;
let userId = "";
let organizationId = "";

async function signUpHospitalContact(): Promise<{ userId: string; headers: Headers }> {
	const response = await auth.api.signUpEmail({
		body: { email, password, name: "Hospital Contact" },
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

describe("Issue 08 hospital verification and pending state", () => {
	it("strips privileged fields: status stays pending, partner false, approvedAt null", async () => {
		const contact = await signUpHospitalContact();
		userId = contact.userId;
		await recordConsentsForUser(userId, {});

		const createArg = {
			body: {
				name: "Verify Hospital",
				slug,
				officialEmail: email,
				registrationNumber: `RC-${stamp}`,
				address: "1 Test Street, Yaba",
				state: "Lagos",
				latitude: 6.5244,
				longitude: 3.3792,
				verificationStatus: "approved",
				isScreeningPartner: true,
				approvedAt: new Date(),
			},
			headers: contact.headers,
		} as Parameters<typeof auth.api.createOrganization>[0];
		const organization = await auth.api.createOrganization(createArg);
		assert.ok(organization?.id);
		organizationId = organization.id as string;

		const stored = await prisma.organization.findUnique({
			where: { id: organizationId },
		});
		assert.ok(stored);
		assert.equal(stored?.verificationStatus, "pending");
		assert.equal(stored?.isScreeningPartner, false);
		assert.equal(stored?.approvedAt, null);
		assert.equal(stored?.registrationNumber, `RC-${stamp}`);

		const membership = await prisma.member.findUnique({
			where: {
				organizationId_userId: { organizationId, userId },
			},
		});
		assert.ok(membership);
		assert.ok(membership?.role.includes("owner"));
	});

	it("opens exactly one pending application and the database rejects a second", async () => {
		const applications = await prisma.hospitalVerification.findMany({
			where: { organizationId },
		});
		assert.equal(applications.length, 1);
		assert.equal(applications[0]?.decision, "pending");
		assert.equal(applications[0]?.submittedBy, userId);

		await assert.rejects(
			prisma.hospitalVerification.create({
				data: { organizationId, submittedBy: userId },
			}),
			(err: unknown) => (err as { code?: string }).code === "P2002",
		);
	});

	it("rejects request creation for pending hospitals on the server", async () => {
		assert.equal(await getOrganizationVerificationStatus(organizationId), "pending");
		await assert.rejects(
			requireApprovedHospital(organizationId),
			/awaiting approval/,
		);
		await assert.rejects(
			createBloodRequest(organizationId, userId, {
				bloodGroup: "O_POS",
				unitsRequired: 2,
			}),
			/awaiting approval/,
		);
	});

	it("allows the gate once approved and rejects again when rejected", async () => {
		await prisma.organization.update({
			where: { id: organizationId },
			data: { verificationStatus: "approved", approvedAt: new Date() },
		});
		await requireApprovedHospital(organizationId);
		const created = await createBloodRequest(organizationId, userId, {
			bloodGroup: "O_POS",
			unitsRequired: 2,
		});
		assert.ok(created.requestId);
		assert.equal(created.matchedDonorCount, 0);
		await prisma.bloodRequest.delete({ where: { id: created.requestId } });

		await prisma.organization.update({
			where: { id: organizationId },
			data: { verificationStatus: "rejected", approvedAt: null },
		});
		await assert.rejects(
			requireApprovedHospital(organizationId),
			/awaiting approval/,
		);
	});

	after(async () => {
		await deleteOrganizationCompletely(organizationId);
		await deleteUsersCompletely([userId]);
	});
});
