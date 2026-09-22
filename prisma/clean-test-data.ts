import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import {
	deleteOrganizationCompletely,
	deleteUserCompletely,
} from "../tests/helpers";

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: `${process.env.DATABASE_URL}` }),
});

async function main() {
	const mode = process.argv[2] ?? "inspect";
	const testUsers = await prisma.user.findMany({
		where: {
			OR: [
				{ email: { contains: "hospital-verify-" } },
				{ email: { contains: "-09-" } },
				{ email: { contains: "-10-" } },
				{ email: { contains: "-11-" } },
				{ email: { contains: "-12-" } },
				{ email: { contains: "-13-" } },
			],
		},
		select: { id: true, email: true },
	});
	console.log(`test users: ${testUsers.length}`);
	if (mode === "clean") {
		for (const user of testUsers) {
			await deleteUserCompletely(user.id);
		}
		const orgs = await prisma.organization.findMany({
			select: { id: true, name: true },
		});
		console.log(`organizations: ${orgs.length}`);
		for (const org of orgs) {
			await deleteOrganizationCompletely(org.id);
		}
		console.log(`remaining organizations: ${await prisma.organization.count()}`);
		console.log(`remaining matches: ${await prisma.requestMatch.count()}`);
		console.log(`remaining requests: ${await prisma.bloodRequest.count()}`);
	}
}

main().finally(() => prisma.$disconnect());
