import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
	const screenings = await prisma.donorScreening.findMany({
		where: { organizationId: null },
		select: { id: true, hospitalId: true },
	});

	console.log(
		`Found ${screenings.length} donor screening(s) without an organizationId`,
	);

	for (const screening of screenings) {
		const ownerMembership = await prisma.member.findFirst({
			where: { userId: screening.hospitalId, role: "owner" },
			select: { organizationId: true },
		});

		if (!ownerMembership) {
			throw new Error(
				`DonorScreening ${screening.id} is attributed to user ${screening.hospitalId}, who has no owned organization`,
			);
		}

		await prisma.donorScreening.update({
			where: { id: screening.id },
			data: { organizationId: ownerMembership.organizationId },
		});

		console.log(
			`Backfilled DonorScreening ${screening.id} -> organization ${ownerMembership.organizationId}`,
		);
	}

	console.log("Done.");
}

main().finally(() => prisma.$disconnect());
