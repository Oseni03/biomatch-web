import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSessionRole } from "@/servers/user";
import { geocodeAddressAction } from "@/servers/location";

const stamp = Date.now();
const email = `hospital-reg-${stamp}@example.com`;
const password = "HospitalTest123!";
const slug = `test-hospital-${stamp}`;
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

describe("Issue 05 hospital registration", () => {
	it("geocoding rejects an empty address without a network call", async () => {
		const result = await geocodeAddressAction("   ");
		assert.equal(result.ok, false);
	});

	it("registers a hospital: user + organization + owner membership", async () => {
		const contact = await signUpHospitalContact();
		userId = contact.userId;

		const createArg = {
			body: {
				name: "Test Hospital",
				slug,
				officialEmail: email,
				address: "1 Test Street, Yaba",
				state: "Lagos",
				latitude: 6.5244,
				longitude: 3.3792,
				verificationStatus: "approved",
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

		const membership = await prisma.member.findUnique({
			where: {
				organizationId_userId: { organizationId, userId },
			},
		});
		assert.ok(membership);
		assert.ok(membership?.role.includes("owner"));

		const applications = await prisma.hospitalVerification.findMany({
			where: { organizationId },
		});
		assert.equal(applications.length, 1);
		assert.equal(applications[0]?.decision, "pending");
		assert.equal(applications[0]?.submittedBy, userId);

		assert.equal(await getSessionRole(userId), "hospital");
	});

	after(async () => {
		if (organizationId) {
			await prisma.organization.delete({ where: { id: organizationId } });
		}
		if (userId) {
			await prisma.user.delete({ where: { id: userId } });
		}
	});
});
