import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
	const banks = await prisma.hospitalBank.findMany({
		where: { organizationId: null },
		select: { id: true, hospitalName: true, managedById: true },
	});

	console.log(`Found ${banks.length} hospital bank(s) without an organizationId`);

	for (const bank of banks) {
		if (!bank.managedById) {
			throw new Error(
				`HospitalBank ${bank.id} (${bank.hospitalName}) has no managedById to resolve an organization from`,
			);
		}

		const ownerMembership = await prisma.member.findFirst({
			where: { userId: bank.managedById, role: "owner" },
			select: { organizationId: true },
		});

		if (!ownerMembership) {
			throw new Error(
				`HospitalBank ${bank.id} (${bank.hospitalName}) is managed by user ${bank.managedById}, who has no owned organization`,
			);
		}

		await prisma.hospitalBank.update({
			where: { id: bank.id },
			data: { organizationId: ownerMembership.organizationId },
		});

		console.log(
			`Backfilled HospitalBank ${bank.id} -> organization ${ownerMembership.organizationId}`,
		);
	}

	console.log("Done.");
}

main().finally(() => prisma.$disconnect());
