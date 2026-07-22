"use server";

import { prisma } from "@/lib/prisma";
import { orgRoles } from "@/lib/organization-access";

export async function getActiveOrganizationId(userId: string): Promise<string> {
	const membership = await prisma.member.findFirst({
		where: { userId },
		select: { organizationId: true },
	});
	if (!membership) {
		throw new Error("User is not a member of any organization");
	}
	return membership.organizationId;
}

export async function getActiveOrganizationRole(
	organizationId: string,
	userId: string,
): Promise<string> {
	const membership = await prisma.member.findUnique({
		where: { organizationId_userId: { organizationId, userId } },
		select: { role: true },
	});
	if (!membership) {
		throw new Error("Caller is not a member of this organization");
	}
	return membership.role;
}

export async function authorizeOrgAction(
	organizationId: string,
	callerUserId: string,
	permission: Record<string, string[]>,
) {
	const roleName = await getActiveOrganizationRole(organizationId, callerUserId);
	const role = orgRoles[roleName as keyof typeof orgRoles];
	if (!role) {
		throw new Error(`Unknown organization role "${roleName}"`);
	}
	const result = role.authorize(permission);
	if (!result.success) {
		throw new Error(result.error ?? "Not authorized");
	}
}
