import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
	const requests = await prisma.emergencyRequest.findMany({
		where: { organizationId: null },
		select: { id: true, hospitalId: true },
	});

	console.log(
		`Found ${requests.length} emergency request(s) without an organizationId`,
	);

	for (const request of requests) {
		const ownerMembership = await prisma.member.findFirst({
			where: { userId: request.hospitalId, role: "owner" },
			select: { organizationId: true },
		});

		if (!ownerMembership) {
			throw new Error(
				`EmergencyRequest ${request.id} is attributed to user ${request.hospitalId}, who has no owned organization`,
			);
		}

		await prisma.emergencyRequest.update({
			where: { id: request.id },
			data: { organizationId: ownerMembership.organizationId },
		});

		console.log(
			`Backfilled EmergencyRequest ${request.id} -> organization ${ownerMembership.organizationId}`,
		);
	}

	console.log("Done.");
}

main().finally(() => prisma.$disconnect());
