import { createAccessControl } from "better-auth/plugins/access";
import {
	defaultStatements,
	ownerAc,
} from "better-auth/plugins/organization/access";

export const statement = {
	...defaultStatements,
	staff: ["invite", "update", "remove"],
	inventory: ["read", "write"],
	emergency: ["create", "update"],
	screening: ["create", "resolve"],
	donation: ["confirm"],
} as const;

export const ac = createAccessControl(statement);

export const viewerRole = ac.newRole({
	inventory: ["read"],
});

export const requesterRole = ac.newRole({
	inventory: ["read"],
	emergency: ["create", "update"],
	screening: ["create", "resolve"],
	donation: ["confirm"],
});

export const adminRole = ac.newRole({
	invitation: ["create", "cancel"],
	member: ["update", "delete"],
	staff: ["invite", "update", "remove"],
	inventory: ["read", "write"],
	emergency: ["create", "update"],
	screening: ["create", "resolve"],
	donation: ["confirm"],
});

export const ownerRole = ac.newRole({
	...ownerAc.statements,
	staff: ["invite", "update", "remove"],
	inventory: ["read", "write"],
	emergency: ["create", "update"],
	screening: ["create", "resolve"],
	donation: ["confirm"],
});

export const orgRoles = {
	owner: ownerRole,
	admin: adminRole,
	requester: requesterRole,
	viewer: viewerRole,
};

export const INVITABLE_ROLES = ["admin", "requester", "viewer"] as const;
export type InvitableRole = (typeof INVITABLE_ROLES)[number];
