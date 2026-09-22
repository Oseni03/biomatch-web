import "dotenv/config";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordConsentsForUser } from "@/servers/consent";

async function main() {
	const email = process.env.FOUNDER_ADMIN_EMAIL;
	const password = process.env.FOUNDER_ADMIN_PASSWORD;
	const name = process.env.FOUNDER_ADMIN_NAME ?? "BioMatch Admin";

	if (!email || !password) {
		console.warn(
			"Seed skipped: set FOUNDER_ADMIN_EMAIL and FOUNDER_ADMIN_PASSWORD to create the founder admin.",
		);
		return;
	}

	let user = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } });
	if (!user) {
		const response = await auth.api.signUpEmail({
			body: { email, password, name },
			headers: new Headers(),
			asResponse: true,
		});
		if (response.status !== 200) {
			throw new Error(`Founder admin sign-up failed with status ${response.status}`);
		}
		const data = (await response.json()) as { user?: { id?: string } };
		if (!data?.user?.id) {
			throw new Error("Founder admin sign-up returned no user id");
		}
		user = { id: data.user.id, role: "user" };
		console.log(`Founder admin account created for ${email}.`);
	}

	await prisma.user.update({
		where: { id: user.id },
		data: { role: "admin", emailVerified: true, banned: false, banReason: null },
	});
	await recordConsentsForUser(user.id, {});
	console.log(`Founder admin ensured for ${email} (role=admin, consents recorded).`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
