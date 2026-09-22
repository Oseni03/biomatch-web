"use server";

import { prisma } from "@/lib/prisma";
import { ac, orgRoles } from "@/lib/organization-access";
import { requireConsentsForUser } from "@/servers/consent";

export async function getActiveOrganizationId(userId: string): Promise<string> {
	await requireConsentsForUser(userId);
	const preferred = await prisma.session.findFirst({
		where: {
			userId,
			activeOrganizationId: { not: null },
			expiresAt: { gt: new Date() },
		},
		orderBy: { updatedAt: "desc" },
		select: { activeOrganizationId: true },
	});
	if (preferred?.activeOrganizationId) {
		const membership = await prisma.member.findUnique({
			where: {
				organizationId_userId: {
					organizationId: preferred.activeOrganizationId,
					userId,
				},
			},
			select: { id: true },
		});
		if (membership) {
			return preferred.activeOrganizationId;
		}
	}
	const membership = await prisma.member.findFirst({
		where: { userId },
		select: { organizationId: true },
	});
	if (!membership) {
		throw new Error("User is not a member of any organization");
	}
	return membership.organizationId;
}

export async function getOrganizationOwnerUserId(
	organizationId: string,
): Promise<string> {
	const owner = await prisma.member.findFirst({
		where: { organizationId, role: "owner" },
		select: { userId: true },
	});
	if (!owner) {
		throw new Error(`Organization ${organizationId} has no owner`);
	}
	return owner.userId;
}

export async function isUserInAnyOrganization(userId: string): Promise<boolean> {
	await requireConsentsForUser(userId);
	const membership = await prisma.member.findFirst({
		where: { userId },
		select: { id: true },
	});
	return !!membership;
}

export async function getActiveOrganizationRole(
	organizationId: string,
	userId: string,
): Promise<string> {
	await requireConsentsForUser(userId);
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
	await requireOrgPermission(organizationId, callerUserId, permission);
}

async function roleNameAuthorizes(
	organizationId: string,
	roleName: string,
	permission: Record<string, string[]>,
): Promise<boolean> {
	const builtin = orgRoles[roleName as keyof typeof orgRoles];
	if (builtin) {
		return builtin.authorize(permission).success;
	}
	if (roleName === "suspended") {
		return false;
	}
	const custom = await prisma.organizationRole.findFirst({
		where: { organizationId, role: roleName },
		select: { permission: true },
	});
	if (!custom) {
		return false;
	}
	let statements: unknown;
	try {
		statements = JSON.parse(custom.permission);
	} catch {
		return false;
	}
	try {
		const role = ac.newRole(
			statements as Parameters<typeof ac.newRole>[0],
		);
		return role.authorize(permission).success;
	} catch {
		return false;
	}
}

// Reusable server-side permission check (issue 10). Resolves every role on
// the caller's membership — built-in Owner/Admin/Member plus the hospital's
// custom roles — and passes when any of them grants the permission.
export async function requireOrgPermission(
	organizationId: string,
	callerUserId: string,
	permission: Record<string, string[]>,
): Promise<void> {
	await requireConsentsForUser(callerUserId);
	const membership = await prisma.member.findUnique({
		where: { organizationId_userId: { organizationId, userId: callerUserId } },
		select: { role: true },
	});
	if (!membership) {
		throw new Error("Caller is not a member of this organization");
	}
	const roleNames = membership.role
		.split(",")
		.map((role) => role.trim())
		.filter(Boolean);
	for (const roleName of roleNames) {
		if (await roleNameAuthorizes(organizationId, roleName, permission)) {
			return;
		}
	}
	throw new Error("Not authorized");
}

export async function getOrganizationVerificationStatus(
	organizationId: string,
): Promise<string> {
	const organization = await prisma.organization.findUnique({
		where: { id: organizationId },
		select: { verificationStatus: true },
	});
	if (!organization) {
		throw new Error("Hospital not found");
	}
	return organization.verificationStatus;
}

export async function requireApprovedHospital(
	organizationId: string,
): Promise<void> {
	const status = await getOrganizationVerificationStatus(organizationId);
	if (status !== "approved") {
		throw new Error(
			"This hospital is awaiting approval and cannot create emergency requests yet",
		);
	}
}
