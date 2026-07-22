import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins/organization";
import { prisma } from "./prisma";
import { ac, orgRoles } from "./organization-access";
import { sendEmail } from "./email";
import StaffInvitationEmail from "@/emails/staff-invitation";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
		cookieCache: {
			enabled: true,
			maxAge: 60 * 60 * 24,
			strategy: "jwt",
		},
	},
	advanced: {
		database: { generateId: () => crypto.randomUUID() },
	},
	user: {
		additionalFields: {
			genotype: {
				type: "string",
				required: false,
				input: false,
			},
			role: {
				type: "string",
				required: true,
				input: true,
			},
		},
	},
	emailAndPassword: {
		enabled: true,
	},
	plugins: [
		organization({
			ac,
			roles: orgRoles,
			creatorRole: "owner",
			organizationLimit: 1,
			sendInvitationEmail: async (data) => {
				await sendEmail({
					to: data.email,
					subject: `You've been invited to join ${data.organization.name} on BioMatch`,
					react: StaffInvitationEmail({
						organizationName: data.organization.name,
						inviterName: data.inviter.user.name,
						role: data.role,
						acceptUrl: `${process.env.BETTER_AUTH_URL}/auth/accept-invitation?id=${data.invitation.id}`,
					}),
				});
			},
		}),
		nextCookies(),
	],
});
