"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { authorizeOrgAction, getActiveOrganizationId } from "./organization";
import { INVITABLE_ROLES, type InvitableRole } from "@/lib/organization-access";

export interface StaffMember {
	id: string;
	userId?: string;
	name: string;
	email: string;
	role: string;
	status: "active" | "pending";
}

export async function getStaffMembers(
	organizationId: string,
): Promise<StaffMember[]> {
	const [members, invitations] = await Promise.all([
		prisma.member.findMany({
			where: { organizationId },
			include: { user: { select: { name: true, email: true } } },
			orderBy: { createdAt: "asc" },
		}),
		prisma.invitation.findMany({
			where: { organizationId, status: "pending" },
			orderBy: { createdAt: "asc" },
		}),
	]);

	return [
		...members.map((m) => ({
			id: m.id,
			userId: m.userId,
			name: m.user.name,
			email: m.user.email,
			role: m.role,
			status: "active" as const,
		})),
		...invitations.map((i) => ({
			id: i.id,
			name: i.email,
			email: i.email,
			role: i.role,
			status: "pending" as const,
		})),
	];
}

export interface InvitationPreview {
	id: string;
	email: string;
	role: string;
	status: string;
	expiresAt: Date;
	organizationName: string;
}

export async function getInvitationPreview(
	invitationId: string,
): Promise<InvitationPreview | null> {
	const invitation = await prisma.invitation.findUnique({
		where: { id: invitationId },
		include: { organization: { select: { name: true } } },
	});
	if (!invitation) return null;

	return {
		id: invitation.id,
		email: invitation.email,
		role: invitation.role,
		status: invitation.status,
		expiresAt: invitation.expiresAt,
		organizationName: invitation.organization.name,
	};
}

export async function getMyStaffRole(userId: string): Promise<string | null> {
	const organizationId = await getActiveOrganizationId(userId).catch(
		() => null,
	);
	if (!organizationId) return null;

	const member = await prisma.member.findUnique({
		where: { organizationId_userId: { organizationId, userId } },
		select: { role: true },
	});
	return member?.role ?? null;
}

export async function inviteStaffMember(
	organizationId: string,
	email: string,
	role: InvitableRole,
	callerUserId: string,
) {
	await authorizeOrgAction(organizationId, callerUserId, {
		staff: ["invite"],
	});
	if (!INVITABLE_ROLES.includes(role)) {
		throw new Error("Invalid role");
	}

	await auth.api.createInvitation({
		headers: await headers(),
		body: { email, role, organizationId },
	});

	return { success: true };
}

export async function updateStaffRole(
	organizationId: string,
	memberId: string,
	role: InvitableRole,
	callerUserId: string,
) {
	await authorizeOrgAction(organizationId, callerUserId, {
		staff: ["update"],
	});
	if (!INVITABLE_ROLES.includes(role)) {
		throw new Error("Invalid role");
	}

	await auth.api.updateMemberRole({
		headers: await headers(),
		body: { memberId, role, organizationId },
	});

	return { success: true };
}

export async function removeStaffMember(
	organizationId: string,
	memberId: string,
	callerUserId: string,
) {
	await authorizeOrgAction(organizationId, callerUserId, {
		staff: ["remove"],
	});

	await auth.api.removeMember({
		headers: await headers(),
		body: { memberIdOrEmail: memberId, organizationId },
	});

	return { success: true };
}

export async function cancelStaffInvitation(
	organizationId: string,
	invitationId: string,
	callerUserId: string,
) {
	await authorizeOrgAction(organizationId, callerUserId, {
		staff: ["remove"],
	});

	await auth.api.cancelInvitation({
		headers: await headers(),
		body: { invitationId },
	});

	return { success: true };
}
