import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
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
});
