import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins/admin";
import { organization } from "better-auth/plugins/organization";
import { phoneNumber } from "better-auth/plugins/phone-number";
import { prisma } from "./prisma";
import { ac, orgRoles } from "./organization-access";
import { sendEmail } from "./email";
// import { sendSms } from "./sms"; // new: provider chosen in issue 02
import StaffInvitationEmail from "@/emails/staff-invitation";
import VerificationEmail from "@/emails/verification-email";
import ResetPasswordEmail from "@/emails/reset-password-email";
import { nextCookies } from "better-auth/next-js";

// Single same-domain app URL (ADR 002): Better Auth is mounted in this Next.js
// app, so there is no separate backend origin. BETTER_AUTH_URL stays as a fallback
// so existing deploys that only set it keep working.
const appUrl = process.env.APP_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

const E164 = /^\+[1-9][0-9]{7,14}$/;

export const auth = betterAuth({
	baseURL: appUrl,
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	// Top-level option. (It was nested under `advanced` before, where it is not read.)
	trustedOrigins: [
		appUrl,
		"https://www.biomatchlimited.org",
		"https://biomatchlimited.org",
		...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",").map((o) => o.trim()) ?? []),
	],
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
		cookieCache: {
			enabled: true,
			// Was 1 day. A cached session is trusted without a database check, so bans,
			// role/permission changes and org switches would lag by this long.
			maxAge: 60 * 5,
			strategy: "jwt",
		},
	},
	advanced: {
		database: { generateId: () => crypto.randomUUID() },
	},
	rateLimit: {
		enabled: true,
		customRules: {
			// Paths follow the phone number plugin; verify against your installed version.
			"/phone-number/send-otp": { window: 60, max: 3 },
			"/phone-number/verify": { window: 60, max: 10 },
		},
	},
	user: {
		additionalFields: {
			// NOTE: the old `role` (donor | hospital) and `genotype` fields are gone.
			//  - `role` is now owned by the admin plugin ('user' | 'admin'). Donor vs hospital
			//    is derived: donor profile exists, or organization membership exists.
			//  - `genotype` is not in the PRD or the new schema. Add it to DonorProfile if needed.
			notifySms: { type: "boolean", required: false, defaultValue: true },
			notifyWhatsapp: { type: "boolean", required: false, defaultValue: true },
			notifyEmail: { type: "boolean", required: false, defaultValue: true },
			notifyPush: { type: "boolean", required: false, defaultValue: true },
			// Server-controlled
			onboardedAt: { type: "date", required: false, input: false },
			anonymisedAt: { type: "date", required: false, input: false },
		},
	},
	emailVerification: {
		sendOnSignUp: true,
		sendOnSignIn: true,
		autoSignInAfterVerification: false,
		expiresIn: 60 * 60 * 24,
		sendVerificationEmail: async ({ user, url }) => {
			if (process.env.NODE_ENV !== "production") {
				return;
			}
			await sendEmail({
				to: user.email,
				subject: "Verify your BioMatch email",
				react: VerificationEmail({
					name: user.name || "friend",
					verifyUrl: url,
				}),
			});
		},
	},
	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url }) => {
			await sendEmail({
				to: user.email,
				subject: "Reset your BioMatch password",
				react: ResetPasswordEmail({
					name: user.name || "friend",
					resetUrl: url,
				}),
			});
		},
		resetPasswordTokenExpiresIn: 60 * 60,
		requireEmailVerification: process.env.NODE_ENV === "production",
	},
	plugins: [
		// user.role, banned/banReason/banExpires, impersonation. Single founder admin.
		admin({
			defaultRole: "user",
			adminRoles: ["admin"],
		}),

		// // Phone is added later from profile settings and verified by SMS OTP.
		// // Email + password stays the only sign-in method; verify with updatePhoneNumber
		// // so the number attaches to the signed-in user.
		// phoneNumber({
		// 	otpLength: 6,
		// 	expiresIn: 60 * 5,
		// 	allowedAttempts: 3,
		// 	phoneNumberValidator: (number) => E164.test(number),
		// 	sendOTP: async ({ phoneNumber, code }) => {
		// 		if (process.env.NODE_ENV !== "production") {
		// 			console.log(`[dev] OTP for ${phoneNumber}: ${code}`);
		// 			return;
		// 		}
		// 		await sendSms({
		// 			to: phoneNumber,
		// 			message: `Your BioMatch verification code is ${code}. It expires in 5 minutes.`,
		// 		});
		// 	},
		// }),

		organization({
			ac,
			roles: orgRoles,
			dynamicAccessControl: { enabled: true }, // hospitals create their own custom roles
			creatorRole: "owner",
			// Limits how many hospitals one user can CREATE. They can still be invited into others.
			organizationLimit: 1,
			schema: {
				organization: {
					additionalFields: {
						officialEmail: { type: "string", required: true, unique: true },
						phone: { type: "string", required: false },
						registrationNumber: { type: "string", required: false, unique: true },
						address: { type: "string", required: true },
						state: { type: "string", required: true },
						lga: { type: "string", required: false },
						latitude: { type: "number", required: true },
						longitude: { type: "number", required: true },
						// Server-controlled: a hospital must never be able to approve itself.
						isScreeningPartner: { type: "boolean", required: false, defaultValue: false, input: false },
						verificationStatus: { type: "string", required: false, defaultValue: "pending", input: false },
						approvedAt: { type: "date", required: false, input: false },
					},
				},
			},
			// Option name is version dependent; check your installed Better Auth version.
			organizationHooks: {
				afterCreateOrganization: async ({ organization, user }) => {
					// Every new hospital starts with one pending application (issue 08).
					await prisma.hospitalVerification.create({
						data: { organizationId: organization.id, submittedBy: user.id },
					});
				},
			},
			sendInvitationEmail: async (data) => {
				await sendEmail({
					to: data.email,
					subject: `You've been invited to join ${data.organization.name} on BioMatch`,
					react: StaffInvitationEmail({
						organizationName: data.organization.name,
						inviterName: data.inviter.user.name,
						role: data.role,
						// Same-domain app URL (ADR 002: no separate backend origin)
						acceptUrl: `${appUrl}/auth/accept-invitation?id=${data.invitation.id}`,
					}),
				});
			},
		}),

		nextCookies()
	],
});
