import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const BLOOD_GROUPS = ["A_PLUS", "A_MINUS", "B_PLUS", "B_MINUS", "AB_PLUS", "AB_MINUS", "O_PLUS", "O_MINUS"] as const;

const LAGOS_LOCATIONS = [
	{ name: "Ikeja", lat: 6.6018, lng: 3.3515 },
	{ name: "Surulere", lat: 6.4969, lng: 3.3422 },
	{ name: "Lekki", lat: 6.4478, lng: 3.4723 },
	{ name: "Victoria Island", lat: 6.4281, lng: 3.4219 },
	{ name: "Yaba", lat: 6.5095, lng: 3.3711 },
	{ name: "Oshodi", lat: 6.5550, lng: 3.3436 },
	{ name: "Agege", lat: 6.6153, lng: 3.3226 },
	{ name: "Ikorodu", lat: 6.6194, lng: 3.5105 },
];

const FIRST_NAMES = ["Ada", "Chidi", "Ngozi", "Emeka", "Amina", "Tunde", "Yemi", "Funke", "Ibrahim", "Chioma", "Olumide", "Adebola", "Nkechi", "Oluwaseun", "Fatima", "Chinedu", "Adaeze", "Babajide", "Zainab", "Olufunke", "Kunle", "Aisha", "Obinne", "Yetunde", "Musa", "Chinwe", "Femi", "Adeola", "Uche", "Biola"];
const LAST_NAMES = ["Okonkwo", "Adeyemi", "Okafor", "Ibrahim", "Eze", "Balogun", "Lawal", "Adekunle", "Nwosu", "Abubakar", "Ogundimu", "Adebayo", "Nnamdi", "Yusuf", "Oladipo", "Chukwu", "Afolabi", "Mohammed", "Obi", "Akinwale"];

function randomItem<T>(arr: readonly T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function randomLagosLocation() {
	return randomItem(LAGOS_LOCATIONS);
}

async function main() {
	console.log("Seeding prototype data...");

	await prisma.donation.deleteMany();
	await prisma.emergencyAlert.deleteMany();
	await prisma.emergencyRequest.deleteMany();
	await prisma.wallet.deleteMany();
	await prisma.hospitalBank.deleteMany();
	await prisma.member.deleteMany();
	await prisma.invitation.deleteMany();
	await prisma.organization.deleteMany();
	await prisma.session.deleteMany();
	await prisma.account.deleteMany();
	await prisma.verification.deleteMany();
	await prisma.user.deleteMany();

	const org = await prisma.organization.create({
		data: { name: "Lagos University Teaching Hospital", slug: "luth" },
	});

		const hospitalUser = await prisma.user.create({
			data: {
				name: "LUTH Admin",
				email: "hospital@biomatch.test",
				emailVerified: true,
				role: "hospital",
			},
		});

	await prisma.member.create({
		data: { organizationId: org.id, userId: hospitalUser.id, role: "owner" },
	});

	await prisma.hospitalBank.create({
		data: {
			hospitalName: "Lagos University Teaching Hospital",
			location: "Surulere, Lagos",
			latitude: 6.4969,
			longitude: 3.3422,
			organizationId: org.id,
		},
	});

	for (let i = 0; i < 30; i++) {
		const firstName = randomItem(FIRST_NAMES);
		const lastName = randomItem(LAST_NAMES);
		const bloodGroup = randomItem(BLOOD_GROUPS);
		const loc = randomLagosLocation();

		await prisma.user.create({
			data: {
				name: `${firstName} ${lastName}`,
				email: `donor${i}@biomatch.test`,
				emailVerified: true,
				role: "donor",
				bloodGroup,
				location: `${loc.name}, Lagos`,
				latitude: loc.lat + (Math.random() - 0.5) * 0.05,
				longitude: loc.lng + (Math.random() - 0.5) * 0.05,
				isActive: true,
			},
		});
	}

	const donorCount = await prisma.user.count({ where: { role: "donor" } });
	const hospitalCount = await prisma.user.count({ where: { role: "hospital" } });
	console.log(`Seed complete. ${donorCount} donors, ${hospitalCount} hospitals, 1 organization.`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
