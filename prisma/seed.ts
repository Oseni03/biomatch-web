import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding location hierarchy...");

  await prisma.location.deleteMany();

  const tree: Record<string, Record<string, string[]>> = {
    "North-Central": {
      "FCT": ["Garki", "Wuse", "Maitama", "Asokoro", "Gwarinpa"],
      "Benue": ["Makurdi", "Gboko", "Otukpo"],
      "Kogi": ["Lokoja", "Okene", "Kabba"],
      "Kwara": ["Ilorin", "Offa", "Omu-Aran"],
      "Nasarawa": ["Lafia", "Keffi", "Akwanga"],
      "Niger": ["Minna", "Bida", "Suleja"],
      "Plateau": ["Jos", "Bukuru", "Pankshin"],
    },
    "North-East": {
      "Adamawa": ["Yola", "Mubi", "Numan"],
      "Bauchi": ["Bauchi", "Azare", "Misau"],
      "Borno": ["Maiduguri", "Biu", "Dikwa"],
      "Gombe": ["Gombe", "Kaltungo", "Billiri"],
      "Taraba": ["Jalingo", "Wukari", "Ibi"],
      "Yobe": ["Damaturu", "Potiskum", "Gashua"],
    },
    "North-West": {
      "Kaduna": ["Kaduna", "Zaria", "Kafanchan"],
      "Kano": ["Kano", "Wudil", "Rano"],
      "Katsina": ["Katsina", "Daura", "Funtua"],
      "Kebbi": ["Birnin Kebbi", "Argungu", "Yauri"],
      "Sokoto": ["Sokoto", "Tambuwal", "Gwadabawa"],
      "Jigawa": ["Dutse", "Hadejia", "Kazaure"],
      "Zamfara": ["Gusau", "Kaura Namoda", "Talata Mafara"],
    },
    "South-East": {
      "Abia": ["Umuahia", "Aba", "Ohafia"],
      "Anambra": ["Awka", "Onitsha", "Nnewi"],
      "Ebonyi": ["Abakaliki", "Afikpo", "Ishieke"],
      "Enugu": ["Enugu", "Nsukka", "Oji River"],
      "Imo": ["Owerri", "Orlu", "Okigwe"],
    },
    "South-South": {
      "Akwa Ibom": ["Uyo", "Eket", "Ikot Ekpene"],
      "Bayelsa": ["Yenagoa", "Ogbia", "Brass"],
      "Cross River": ["Calabar", "Ikom", "Ogoja"],
      "Delta": ["Asaba", "Warri", "Sapele"],
      "Edo": ["Benin City", "Auchi", "Uromi"],
      "Rivers": ["Port Harcourt", "Bonny", "Okrika"],
    },
    "South-West": {
      "Ekiti": ["Ado Ekiti", "Ikere", "Oye"],
      "Lagos": ["Ikeja", "Surulere", "Lekki", "Victoria Island", "Yaba", "Oshodi", "Agege"],
      "Ogun": ["Abeokuta", "Ijebu Ode", "Sagamu"],
      "Ondo": ["Akure", "Ondo City", "Owo"],
      "Osun": ["Osogbo", "Ife", "Ilesa"],
      "Oyo": ["Ibadan", "Oyo", "Ogbomoso"],
    },
  };

  for (const [regionName, states] of Object.entries(tree)) {
    const region = await prisma.location.create({ data: { name: regionName, type: "region" } });

    for (const [stateName, cities] of Object.entries(states)) {
      const state = await prisma.location.create({ data: { name: stateName, type: "state", parentId: region.id } });

      for (const cityName of cities) {
        await prisma.location.create({ data: { name: cityName, type: "city", parentId: state.id } });
      }
    }
  }

  const count = await prisma.location.count();
  console.log(`Seed complete. ${count} locations created.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
