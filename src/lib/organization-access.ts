// BioMATCH hospital permission catalog. Save as organization-access.ts.
// Replaces the previous role definitions; imported by auth.ts as { ac, orgRoles }.
// Check import paths and option names against the current Better Auth docs
// (https://better-auth.com/docs) for your installed version.

import { createAccessControl } from "better-auth/plugins/access";
import {
	defaultStatements, // organization, member, invitation, ac (role management)
	ownerAc,
	adminAc,
	memberAc,
} from "better-auth/plugins/organization/access";

// Resource -> actions. Hospitals compose custom roles out of these.
export const statement = {
	...defaultStatements,
	bloodRequest: ["create", "read", "update", "close"],
	donor: ["read", "confirmDonation", "recordScreening"], // recordScreening: partner hospitals only
	history: ["read"],
} as const;

// Domain catalog for custom hospital roles (issue 10). Team UI and server
// validation import this — keep it identical to the domain part of `statement`.
export const domainPermissions = {
	bloodRequest: ["create", "read", "update", "close"],
	donor: ["read", "confirmDonation", "recordScreening"],
	history: ["read"],
} as const;

export type DomainResource = keyof typeof domainPermissions;

export const ac = createAccessControl(statement);

const domainAll = {
	bloodRequest: ["create", "read", "update", "close"],
	donor: ["read", "confirmDonation", "recordScreening"],
	history: ["read"],
} as const;

// Built-in roles (cannot be deleted). Hospitals add their own via dynamic access control.
export const owner = ac.newRole({ ...ownerAc.statements, ...domainAll });
export const admin = ac.newRole({ ...adminAc.statements, ...domainAll });
export const member = ac.newRole({
	...memberAc.statements,
	bloodRequest: ["read"],
	donor: ["read"],
	history: ["read"],
});

// Passed to organization({ roles: orgRoles }) in auth.ts
export const orgRoles = { owner, admin, member };