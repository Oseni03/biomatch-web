"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { domainPermissions } from "@/lib/organization-access";
import { requireConsentsForUser } from "@/servers/consent";
import { requireOrgPermission } from "@/servers/organization";
import { writeAuditLog } from "@/servers/audit";
import StaffInvitationEmail from "@/emails/staff-invitation";

const BUILTIN_ROLES = ["owner", "admin", "member"] as const;
const SUSPENDED_ROLE = "suspended";
const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const appUrl =
	process.env.APP_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export interface TeamMember {
	userId: string;
	name: string;
	email: string;
	role: string;
	suspended: boolean;
}

export interface PendingInvitation {
	id: string;
	email: string;
	role: string;
	expiresAt: Date;
	inviterName: string;
}

export interface CustomRole {
	id: string;
	role: string;
	permissions: Record<string, string[]>;
	createdAt: Date;
	inUse: boolean;
}

export interface MyOrganization {
	organizationId: string;
	name: string;
	role: string;
	verificationStatus: string;
}

function splitRoles(role: string): string[] {
	return role
		.split(",")
		.map((part) => part.trim())
		.filter(Boolean);
}

// Org administration (invites, role changes, removals, custom roles) stays
// with built-in owners and admins; custom roles cover domain permissions.
export async function requireOrgManager(
	organizationId: string,
	callerUserId: string,
): Promise<void> {
	await requireConsentsForUser(callerUserId);
	const membership = await prisma.member.findUnique({
		where: { organizationId_userId: { organizationId, userId: callerUserId } },
		select: { role: true },
	});
	const roles = splitRoles(membership?.role ?? "");
	if (!roles.includes("owner") && !roles.includes("admin")) {
		throw new Error("Only a hospital owner or admin can manage the team");
	}
}

async function countOwners(organizationId: string): Promise<number> {
	const owners = await prisma.member.findMany({
		where: { organizationId },
		select: { role: true },
	});
	return owners.filter((member) => splitRoles(member.role).includes("owner")).length;
}

async function wouldRemoveLastOwner(
	organizationId: string,
	targetUserId: string,
	nextRole: string | null,
): Promise<boolean> {
	const target = await prisma.member.findUnique({
		where: { organizationId_userId: { organizationId, userId: targetUserId } },
		select: { role: true },
	});
	if (!target || !splitRoles(target.role).includes("owner")) {
		return false;
	}
	if (nextRole && splitRoles(nextRole).includes("owner")) {
		return false;
	}
	return (await countOwners(organizationId)) <= 1;
}

const roleNameSchema = z
	.string()
	.trim()
	.min(2, "Role name needs at least 2 characters")
	.max(40)
	.regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes only");

const customPermissionsSchema = z
	.record(z.string(), z.array(z.string()))
	.refine(
		(permissions) => {
			const resources = Object.keys(permissions);
			if (resources.length === 0) return false;
			return resources.every((resource) => {
				const allowed = (domainPermissions as Record<string, readonly string[]>)[resource];
				if (!allowed) return false;
				const actions = permissions[resource] ?? [];
				return actions.length > 0 && actions.every((action) => allowed.includes(action));
			});
		},
		{ message: "Permissions must be a non-empty subset of the catalog" },
	);

function parseStoredPermissions(raw: string): Record<string, string[]> {
	const parsed: unknown = JSON.parse(raw);
	const result = customPermissionsSchema.safeParse(parsed);
	if (!result.success) {
		throw new Error("Stored role permissions are invalid");
	}
	return result.data;
}

export async function listMembers(
	organizationId: string,
	callerUserId: string,
): Promise<TeamMember[]> {
	await requireConsentsForUser(callerUserId);
	const membership = await prisma.member.findUnique({
		where: { organizationId_userId: { organizationId, userId: callerUserId } },
		select: { id: true },
	});
	if (!membership) {
		throw new Error("Caller is not a member of this organization");
	}
	const members = await prisma.member.findMany({
		where: { organizationId },
		orderBy: { createdAt: "asc" },
		select: {
			role: true,
			user: { select: { id: true, name: true, email: true } },
		},
	});
	return members.map((member) => ({
		userId: member.user.id,
		name: member.user.name,
		email: member.user.email,
		role: member.role,
		suspended: splitRoles(member.role).includes(SUSPENDED_ROLE),
	}));
}

export async function listPendingInvitations(
	organizationId: string,
	callerUserId: string,
): Promise<PendingInvitation[]> {
	await requireOrgManager(organizationId, callerUserId);
	const invitations = await prisma.invitation.findMany({
		where: { organizationId, status: "pending", expiresAt: { gt: new Date() } },
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			email: true,
			role: true,
			expiresAt: true,
			inviter: { select: { name: true } },
		},
	});
	return invitations.map((invitation) => ({
		id: invitation.id,
		email: invitation.email,
		role: invitation.role ?? "member",
		expiresAt: invitation.expiresAt,
		inviterName: invitation.inviter.name,
	}));
}

export async function listCustomRoles(
	organizationId: string,
	callerUserId: string,
): Promise<CustomRole[]> {
	await requireConsentsForUser(callerUserId);
	const membership = await prisma.member.findUnique({
		where: { organizationId_userId: { organizationId, userId: callerUserId } },
		select: { id: true },
	});
	if (!membership) {
		throw new Error("Caller is not a member of this organization");
	}
	const [roles, members] = await Promise.all([
		prisma.organizationRole.findMany({
			where: { organizationId },
			orderBy: { role: "asc" },
		}),
		prisma.member.findMany({ where: { organizationId }, select: { role: true } }),
	]);
	const assigned = new Set(members.flatMap((member) => splitRoles(member.role)));
	return roles.map((row) => ({
		id: row.id,
		role: row.role,
		permissions: parseStoredPermissions(row.permission),
		createdAt: row.createdAt,
		inUse: assigned.has(row.role),
	}));
}

const inviteSchema = z.object({
	email: z.string().trim().toLowerCase().email("Enter a valid email address"),
	role: z.string().trim().min(1),
});

export async function inviteMember(
	organizationId: string,
	callerUserId: string,
	rawInput: unknown,
): Promise<{ invitationId: string }> {
	await requireOrgManager(organizationId, callerUserId);
	const input = inviteSchema.parse(rawInput);
	if (input.role === "owner" || input.role === SUSPENDED_ROLE) {
		throw new Error("New members can only be invited as admin, member or a custom role");
	}
	if (!BUILTIN_ROLES.includes(input.role as (typeof BUILTIN_ROLES)[number])) {
		const custom = await prisma.organizationRole.findFirst({
			where: { organizationId, role: input.role },
			select: { id: true },
		});
		if (!custom) {
			throw new Error(`Unknown role "${input.role}" for this hospital`);
		}
	}
	const existingMember = await prisma.user.findUnique({
		where: { email: input.email },
		select: { id: true },
	});
	if (existingMember) {
		const alreadyJoined = await prisma.member.findUnique({
			where: {
				organizationId_userId: { organizationId, userId: existingMember.id },
			},
			select: { id: true },
		});
		if (alreadyJoined) {
			throw new Error("This person is already on the team");
		}
	}
	const alreadyInvited = await prisma.invitation.findFirst({
		where: { organizationId, email: input.email, status: "pending" },
		select: { id: true },
	});
	if (alreadyInvited) {
		throw new Error("This email already has a pending invitation");
	}
	const organization = await prisma.organization.findUnique({
		where: { id: organizationId },
		select: { name: true },
	});
	if (!organization) {
		throw new Error("Hospital not found");
	}
	const inviter = await prisma.user.findUnique({
		where: { id: callerUserId },
		select: { name: true },
	});
	const invitation = await prisma.invitation.create({
		data: {
			organizationId,
			email: input.email,
			role: input.role,
			status: "pending",
			expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
			inviterId: callerUserId,
		},
	});
	await writeAuditLog({
		actorId: callerUserId,
		organizationId,
		action: "hospital.member_invite",
		entityType: "invitation",
		entityId: invitation.id,
		metadata: { email: input.email, role: input.role },
	});
	await sendEmail({
		to: input.email,
		subject: `You've been invited to join ${organization.name} on BioMatch`,
		react: StaffInvitationEmail({
			organizationName: organization.name,
			inviterName: inviter?.name ?? "A colleague",
			role: input.role,
			acceptUrl: `${appUrl}/auth/accept-invitation?id=${invitation.id}`,
		}),
	});
	return { invitationId: invitation.id };
}

const changeRoleSchema = z.object({
	memberUserId: z.string().uuid(),
	role: z.string().trim().min(1),
});

export async function changeMemberRole(
	organizationId: string,
	callerUserId: string,
	rawInput: unknown,
): Promise<{ userId: string; role: string }> {
	await requireOrgManager(organizationId, callerUserId);
	const input = changeRoleSchema.parse(rawInput);
	if (input.role === SUSPENDED_ROLE) {
		throw new Error("Use suspend to suspend a member");
	}
	if (
		!BUILTIN_ROLES.includes(input.role as (typeof BUILTIN_ROLES)[number])
	) {
		const custom = await prisma.organizationRole.findFirst({
			where: { organizationId, role: input.role },
			select: { id: true },
		});
		if (!custom) {
			throw new Error(`Unknown role "${input.role}" for this hospital`);
		}
	}
	const target = await prisma.member.findUnique({
		where: { organizationId_userId: { organizationId, userId: input.memberUserId } },
		select: { role: true },
	});
	if (!target) {
		throw new Error("Team member not found");
	}
	if (await wouldRemoveLastOwner(organizationId, input.memberUserId, input.role)) {
		throw new Error("The last owner cannot be demoted");
	}
	const updated = await prisma.member.update({
		where: {
			organizationId_userId: { organizationId, userId: input.memberUserId },
		},
		data: { role: input.role },
	});
	await writeAuditLog({
		actorId: callerUserId,
		organizationId,
		action: "hospital.member_role_change",
		entityType: "member",
		entityId: input.memberUserId,
		metadata: { from: target.role, to: input.role },
	});
	return { userId: input.memberUserId, role: updated.role };
}

const memberRefSchema = z.object({
	memberUserId: z.string().uuid(),
});

export async function removeMember(
	organizationId: string,
	callerUserId: string,
	rawInput: unknown,
): Promise<{ userId: string }> {
	await requireOrgManager(organizationId, callerUserId);
	const input = memberRefSchema.parse(rawInput);
	const target = await prisma.member.findUnique({
		where: { organizationId_userId: { organizationId, userId: input.memberUserId } },
		select: { role: true },
	});
	if (!target) {
		throw new Error("Team member not found");
	}
	if (await wouldRemoveLastOwner(organizationId, input.memberUserId, null)) {
		throw new Error("The last owner cannot be removed");
	}
	await prisma.member.delete({
		where: { organizationId_userId: { organizationId, userId: input.memberUserId } },
	});
	await writeAuditLog({
		actorId: callerUserId,
		organizationId,
		action: "hospital.member_remove",
		entityType: "member",
		entityId: input.memberUserId,
		metadata: { role: target.role },
	});
	return { userId: input.memberUserId };
}

export async function suspendMember(
	organizationId: string,
	callerUserId: string,
	rawInput: unknown,
): Promise<{ userId: string }> {
	await requireOrgManager(organizationId, callerUserId);
	const input = memberRefSchema.parse(rawInput);
	const target = await prisma.member.findUnique({
		where: { organizationId_userId: { organizationId, userId: input.memberUserId } },
		select: { role: true },
	});
	if (!target) {
		throw new Error("Team member not found");
	}
	if (splitRoles(target.role).includes(SUSPENDED_ROLE)) {
		throw new Error("This member is already suspended");
	}
	if (await wouldRemoveLastOwner(organizationId, input.memberUserId, SUSPENDED_ROLE)) {
		throw new Error("The last owner cannot be suspended");
	}
	if (input.memberUserId === callerUserId) {
		throw new Error("You cannot suspend your own access");
	}
	await prisma.member.update({
		where: { organizationId_userId: { organizationId, userId: input.memberUserId } },
		data: { role: SUSPENDED_ROLE },
	});
	await writeAuditLog({
		actorId: callerUserId,
		organizationId,
		action: "hospital.member_suspend",
		entityType: "member",
		entityId: input.memberUserId,
		metadata: { previousRole: target.role },
	});
	return { userId: input.memberUserId };
}

export async function reinstateMember(
	organizationId: string,
	callerUserId: string,
	rawInput: unknown,
): Promise<{ userId: string; role: string }> {
	await requireOrgManager(organizationId, callerUserId);
	const input = memberRefSchema.parse(rawInput);
	const target = await prisma.member.findUnique({
		where: { organizationId_userId: { organizationId, userId: input.memberUserId } },
		select: { role: true },
	});
	if (!target || !splitRoles(target.role).includes(SUSPENDED_ROLE)) {
		throw new Error("This member is not suspended");
	}
	const lastSuspension = await prisma.auditLog.findFirst({
		where: {
			organizationId,
			action: "hospital.member_suspend",
			entityId: input.memberUserId,
		},
		orderBy: { createdAt: "desc" },
		select: { metadata: true },
	});
	const metadata = (lastSuspension?.metadata ?? {}) as { previousRole?: string };
	const restoredRole = metadata.previousRole && !splitRoles(metadata.previousRole).includes(SUSPENDED_ROLE)
		? metadata.previousRole
		: "member";
	const updated = await prisma.member.update({
		where: { organizationId_userId: { organizationId, userId: input.memberUserId } },
		data: { role: restoredRole },
	});
	await writeAuditLog({
		actorId: callerUserId,
		organizationId,
		action: "hospital.member_reinstate",
		entityType: "member",
		entityId: input.memberUserId,
		metadata: { role: restoredRole },
	});
	return { userId: input.memberUserId, role: updated.role };
}

const createRoleSchema = z.object({
	name: roleNameSchema,
	permissions: customPermissionsSchema,
});

export async function createCustomRole(
	organizationId: string,
	callerUserId: string,
	rawInput: unknown,
): Promise<{ id: string; role: string }> {
	await requireOrgManager(organizationId, callerUserId);
	const input = createRoleSchema.parse(rawInput);
	if (
		BUILTIN_ROLES.includes(input.name as (typeof BUILTIN_ROLES)[number]) ||
		input.name === SUSPENDED_ROLE
	) {
		throw new Error(`"${input.name}" is a reserved role name`);
	}
	const existing = await prisma.organizationRole.findFirst({
		where: { organizationId, role: input.name },
		select: { id: true },
	});
	if (existing) {
		throw new Error(`Role "${input.name}" already exists`);
	}
	const created = await prisma.organizationRole.create({
		data: {
			organizationId,
			role: input.name,
			permission: JSON.stringify(input.permissions),
		},
	});
	await writeAuditLog({
		actorId: callerUserId,
		organizationId,
		action: "hospital.role_create",
		entityType: "organization_role",
		entityId: created.id,
		metadata: { role: input.name, permissions: input.permissions },
	});
	return { id: created.id, role: created.role };
}

const updateRoleSchema = z.object({
	roleId: z.string().uuid(),
	name: roleNameSchema.optional(),
	permissions: customPermissionsSchema.optional(),
});

export async function updateCustomRole(
	organizationId: string,
	callerUserId: string,
	rawInput: unknown,
): Promise<{ id: string; role: string }> {
	await requireOrgManager(organizationId, callerUserId);
	const input = updateRoleSchema.parse(rawInput);
	const existing = await prisma.organizationRole.findFirst({
		where: { id: input.roleId, organizationId },
		select: { id: true, role: true },
	});
	if (!existing) {
		throw new Error("Role not found");
	}
	if (input.name && input.name !== existing.role) {
		if (
			BUILTIN_ROLES.includes(input.name as (typeof BUILTIN_ROLES)[number]) ||
			input.name === SUSPENDED_ROLE
		) {
			throw new Error(`"${input.name}" is a reserved role name`);
		}
		const clash = await prisma.organizationRole.findFirst({
			where: { organizationId, role: input.name },
			select: { id: true },
		});
		if (clash) {
			throw new Error(`Role "${input.name}" already exists`);
		}
		const members = await prisma.member.findMany({
			where: { organizationId },
			select: { userId: true, role: true },
		});
		await prisma.$transaction(
			members
				.filter((member) => splitRoles(member.role).includes(existing.role))
				.map((member) =>
					prisma.member.update({
						where: { organizationId_userId: { organizationId, userId: member.userId } },
						data: {
							role: splitRoles(member.role)
								.map((part) => (part === existing.role ? input.name as string : part))
								.join(","),
						},
					}),
				),
		);
	}
	const updated = await prisma.organizationRole.update({
		where: { id: existing.id },
		data: {
			...(input.name ? { role: input.name } : {}),
			...(input.permissions ? { permission: JSON.stringify(input.permissions) } : {}),
		},
	});
	await writeAuditLog({
		actorId: callerUserId,
		organizationId,
		action: "hospital.role_update",
		entityType: "organization_role",
		entityId: updated.id,
		metadata: { role: updated.role },
	});
	return { id: updated.id, role: updated.role };
}

export async function deleteCustomRole(
	organizationId: string,
	callerUserId: string,
	rawInput: unknown,
): Promise<{ role: string }> {
	await requireOrgManager(organizationId, callerUserId);
	const input = z.object({ roleId: z.string().uuid() }).parse(rawInput);
	const existing = await prisma.organizationRole.findFirst({
		where: { id: input.roleId, organizationId },
		select: { id: true, role: true },
	});
	if (!existing) {
		throw new Error("Role not found");
	}
	const members = await prisma.member.findMany({
		where: { organizationId },
		select: { role: true },
	});
	const inUse = members.some((member) => splitRoles(member.role).includes(existing.role));
	if (inUse) {
		throw new Error(
			`Role "${existing.role}" is assigned to team members. Reassign them first.`,
		);
	}
	await prisma.organizationRole.delete({ where: { id: existing.id } });
	await writeAuditLog({
		actorId: callerUserId,
		organizationId,
		action: "hospital.role_delete",
		entityType: "organization_role",
		entityId: existing.id,
		metadata: { role: existing.role },
	});
	return { role: existing.role };
}

export async function requireTeamPermission(
	organizationId: string,
	callerUserId: string,
	permission: Record<string, string[]>,
): Promise<void> {
	await requireOrgPermission(organizationId, callerUserId, permission);
}

export async function listMyOrganizations(
	callerUserId: string,
): Promise<MyOrganization[]> {
	await requireConsentsForUser(callerUserId);
	const memberships = await prisma.member.findMany({
		where: { userId: callerUserId },
		select: {
			role: true,
			organization: {
				select: { id: true, name: true, verificationStatus: true },
			},
		},
		orderBy: { createdAt: "asc" },
	});
	return memberships.map((membership) => ({
		organizationId: membership.organization.id,
		name: membership.organization.name,
		role: membership.role,
		verificationStatus: membership.organization.verificationStatus,
	}));
}

export async function switchActiveOrganization(
	organizationId: string,
	callerUserId: string,
): Promise<{ organizationId: string }> {
	await requireConsentsForUser(callerUserId);
	const membership = await prisma.member.findUnique({
		where: { organizationId_userId: { organizationId, userId: callerUserId } },
		select: { id: true },
	});
	if (!membership) {
		throw new Error("You are not a member of this hospital");
	}
	await prisma.session.updateMany({
		where: { userId: callerUserId, expiresAt: { gt: new Date() } },
		data: { activeOrganizationId: organizationId },
	});
	return { organizationId };
}
