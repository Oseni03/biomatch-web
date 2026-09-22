import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordConsentsForUser } from "@/servers/consent";
import { acceptInvitationSignUp } from "@/servers/auth";
import {
	getActiveOrganizationId,
	requireOrgPermission,
} from "@/servers/organization";
import {
	changeMemberRole,
	createCustomRole,
	deleteCustomRole,
	inviteMember,
	listMembers,
	listMyOrganizations,
	listPendingInvitations,
	reinstateMember,
	removeMember,
	requireOrgManager,
	suspendMember,
	switchActiveOrganization,
} from "@/servers/team";

const stamp = Date.now();
const password = "HospitalTest123!";

let ownerId = "";
let ownerHeaders = new Headers();
let memberId = "";
let organizationId = "";
let invitationId = "";
let customRoleId = "";
let secondOrgId = "";

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

describe("Issue 10 hospital team and RBAC", () => {
	it("sets up an owner hospital", async () => {
		const owner = await signUp(`team-owner-10-${stamp}@example.com`, "Team Owner");
		ownerId = owner.userId;
		ownerHeaders = owner.headers;
		await recordConsentsForUser(ownerId, {});

		const organization = await auth.api.createOrganization({
			body: {
				name: `Team Hospital ${stamp}`,
				slug: `team-hospital-10-${stamp}`,
				officialEmail: `official-10-${stamp}@example.com`,
				registrationNumber: `RC-10-${stamp}`,
				address: "1 Team Street, Yaba",
				state: "Lagos",
				latitude: 6.5244,
				longitude: 3.3792,
			},
			headers: ownerHeaders,
		} as Parameters<typeof auth.api.createOrganization>[0]);
		assert.ok(organization?.id);
		organizationId = organization.id as string;
		await requireOrgManager(organizationId, ownerId);
	});

	it("invites a new member who signs up and joins through the accept flow", async () => {
		const inviteeEmail = `team-member-10-${stamp}@example.com`;
		const invite = await inviteMember(organizationId, ownerId, {
			email: inviteeEmail,
			role: "member",
		});
		invitationId = invite.invitationId;
		assert.ok(invitationId);

		const pending = await listPendingInvitations(organizationId, ownerId);
		assert.ok(pending.some((row) => row.id === invitationId));

		const accepted = await acceptInvitationSignUp({
			invitationId,
			fullName: "Team Member",
			password,
		});
		assert.ok(accepted.success);

		const created = await prisma.user.findUnique({
			where: { email: inviteeEmail },
			select: { id: true },
		});
		assert.ok(created);
		memberId = created.id;
		await recordConsentsForUser(memberId, {});

		const members = await listMembers(organizationId, ownerId);
		const joined = members.find((member) => member.userId === memberId);
		assert.equal(joined?.role, "member");

		const stored = await prisma.invitation.findUnique({ where: { id: invitationId } });
		assert.equal(stored?.status, "accepted");
	});

	it("blocks members from team management actions", async () => {
		await assert.rejects(
			inviteMember(organizationId, memberId, { email: "x@example.com", role: "member" }),
			/owner or admin/,
		);
		await assert.rejects(
			createCustomRole(organizationId, memberId, {
				name: "sneaky",
				permissions: { bloodRequest: ["create"] },
			}),
			/owner or admin/,
		);
		await assert.rejects(
			requireOrgPermission(organizationId, memberId, { bloodRequest: ["create"] }),
			/Not authorized/,
		);
	});

	it("creates a custom role and enforces it through the reusable check", async () => {
		const created = await createCustomRole(organizationId, ownerId, {
			name: "desk-officer",
			permissions: { bloodRequest: ["read", "update"], history: ["read"] },
		});
		customRoleId = created.id;

		await assert.rejects(
			createCustomRole(organizationId, ownerId, {
				name: "desk-officer",
				permissions: { bloodRequest: ["read"] },
			}),
			/already exists/,
		);
		await assert.rejects(
			createCustomRole(organizationId, ownerId, {
				name: "bad-perms",
				permissions: { bloodRequest: ["delete"] },
			}),
			/Permissions/,
		);
		await assert.rejects(
			createCustomRole(organizationId, ownerId, {
				name: "owner",
				permissions: { bloodRequest: ["read"] },
			}),
			/reserved/,
		);

		const updated = await changeMemberRole(organizationId, ownerId, {
			memberUserId: memberId,
			role: "desk-officer",
		});
		assert.equal(updated.role, "desk-officer");

		await requireOrgPermission(organizationId, memberId, { bloodRequest: ["update"] });
		await assert.rejects(
			requireOrgPermission(organizationId, memberId, { bloodRequest: ["close"] }),
			/Not authorized/,
		);
		await assert.rejects(
			deleteCustomRole(organizationId, ownerId, { roleId: customRoleId }),
			/Reassign/,
		);
	});

	it("protects the last owner from demotion, suspension and removal", async () => {
		await assert.rejects(
			changeMemberRole(organizationId, ownerId, { memberUserId: ownerId, role: "member" }),
			/last owner/i,
		);
		await assert.rejects(suspendMember(organizationId, ownerId, { memberUserId: ownerId }), /last owner/i);
		await assert.rejects(removeMember(organizationId, ownerId, { memberUserId: ownerId }), /last owner/i);
	});

	it("suspends and reinstates a member with permission loss in between", async () => {
		await suspendMember(organizationId, ownerId, { memberUserId: memberId });
		const members = await listMembers(organizationId, ownerId);
		assert.ok(members.find((member) => member.userId === memberId)?.suspended);
		await assert.rejects(
			requireOrgPermission(organizationId, memberId, { bloodRequest: ["read"] }),
			/Not authorized/,
		);

		const restored = await reinstateMember(organizationId, ownerId, { memberUserId: memberId });
		assert.equal(restored.role, "desk-officer");
		await requireOrgPermission(organizationId, memberId, { bloodRequest: ["read"] });
	});

	it("lets a user in two hospitals switch the active organization", async () => {
		const owner2 = await signUp(`team-owner2-10-${stamp}@example.com`, "Second Owner");
		await recordConsentsForUser(owner2.userId, {});
		const second = await auth.api.createOrganization({
			body: {
				name: `Second Hospital ${stamp}`,
				slug: `second-hospital-10-${stamp}`,
				officialEmail: `official2-10-${stamp}@example.com`,
				registrationNumber: `RC2-10-${stamp}`,
				address: "2 Team Street, Yaba",
				state: "Lagos",
				latitude: 6.5244,
				longitude: 3.3792,
			},
			headers: owner2.headers,
		} as Parameters<typeof auth.api.createOrganization>[0]);
		secondOrgId = second.id as string;

		await prisma.member.create({
			data: { organizationId: secondOrgId, userId: ownerId, role: "admin" },
		});

		const mine = await listMyOrganizations(ownerId);
		assert.equal(mine.length, 2);

		await switchActiveOrganization(secondOrgId, ownerId);
		assert.equal(await getActiveOrganizationId(ownerId), secondOrgId);

		await switchActiveOrganization(organizationId, ownerId);
		assert.equal(await getActiveOrganizationId(ownerId), organizationId);

		await assert.rejects(
			switchActiveOrganization(secondOrgId, memberId),
			/not a member/,
		);

		await prisma.organization.delete({ where: { id: secondOrgId } }).catch(() => {});
		secondOrgId = "";
		await prisma.user.delete({ where: { id: owner2.userId } }).catch(() => {});
	});

	after(async () => {
		if (secondOrgId) {
			await prisma.organization.delete({ where: { id: secondOrgId } }).catch(() => {});
		}
		if (organizationId) {
			await prisma.organization.delete({ where: { id: organizationId } }).catch(() => {});
		}
		if (ownerId) {
			await prisma.user.delete({ where: { id: ownerId } }).catch(() => {});
		}
		if (memberId) {
			await prisma.user.delete({ where: { id: memberId } }).catch(() => {});
		}
	});
});
