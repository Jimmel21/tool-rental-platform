import { PrismaClient, UserRole } from "@prisma/client";
import { hash } from "bcrypt";
import { slugify } from "../lib/slug";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: "Power Tools", slug: "power-tools", description: "Drills, saws, sanders", icon: "wrench" },
    { name: "Garden & Outdoor", slug: "garden-outdoor", description: "Lawn mowers, trimmers", icon: "leaf" },
    { name: "Lifting & Moving", slug: "lifting-moving", description: "Dollies, hoists", icon: "truck" },
    { name: "Cleaning", slug: "cleaning", description: "Pressure washers, vacuums", icon: "sparkles" },
    { name: "Construction", slug: "construction", description: "Mixers, scaffolding", icon: "building" },
    { name: "Electrical", slug: "electrical", description: "Generators, cables", icon: "bolt" },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      create: c,
      update: { name: c.name, description: c.description, icon: c.icon },
    });
  }

  const partnerEmail = "partner@toolrental.tt";
  let partner = await prisma.user.findUnique({ where: { email: partnerEmail } });
  if (!partner) {
    partner = await prisma.user.create({
      data: {
        email: partnerEmail,
        password: await hash("Partner123", 12),
        name: "Demo Partner",
        phone: "+18681234567",
        role: UserRole.PARTNER,
      },
    });
  }

  const categoryIds = (await prisma.category.findMany()).reduce(
    (acc, c) => ({ ...acc, [c.slug]: c.id }),
    {} as Record<string, string>
  );

  const tools = [
    { name: "Heavy Duty Drill", categorySlug: "power-tools", daily: 75, weekly: 400, deposit: 200, description: "Professional 20V cordless drill with two batteries.", brand: "Makita", model: "DHR263" },
    { name: "Angle Grinder", categorySlug: "power-tools", daily: 45, weekly: 220, deposit: 100, description: "4.5 inch angle grinder for cutting and grinding.", brand: "Bosch", model: "GWS 750" },
    { name: "Lawn Mower", categorySlug: "garden-outdoor", daily: 120, weekly: 550, deposit: 300, description: "Self-propelled petrol lawn mower.", brand: "Honda", model: "HRX217" },
    { name: "Pressure Washer", categorySlug: "cleaning", daily: 95, weekly: 450, deposit: 250, description: "2000 PSI electric pressure washer.", brand: "Kärcher", model: "K5" },
    { name: "Concrete Mixer", categorySlug: "construction", daily: 150, weekly: 650, deposit: 400, description: "5 cu ft portable concrete mixer.", brand: "Belle", model: "Minimix 150" },
    { name: "Generator 3kW", categorySlug: "electrical", daily: 85, weekly: 380, deposit: 200, description: "Portable 3kW petrol generator.", brand: "Honda", model: "EU30i" },
    { name: "Circular Saw", categorySlug: "power-tools", daily: 55, weekly: 260, deposit: 120, description: "Corded 7¼ inch circular saw.", brand: "DeWalt", model: "DWE575" },
    { name: "Trolley Dolly", categorySlug: "lifting-moving", daily: 35, weekly: 150, deposit: 80, description: "Heavy duty 4-wheel furniture dolly.", brand: "Generic", model: "500kg" },
  ];

  for (const t of tools) {
    const slug = slugify(t.name);
    const categoryId = categoryIds[t.categorySlug];
    if (!categoryId) continue;
    await prisma.tool.upsert({
      where: { slug },
      create: {
        slug,
        name: t.name,
        description: t.description,
        categoryId,
        brand: t.brand,
        model: t.model,
        dailyRate: t.daily,
        weeklyRate: t.weekly,
        depositAmount: t.deposit,
        images: ["/placeholder-tool.jpg"],
        ownerId: partner.id,
      },
      update: { name: t.name, description: t.description, dailyRate: t.daily, weeklyRate: t.weekly, depositAmount: t.deposit },
    });
  }

  console.log("Seed complete: categories, partner user, tools.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
