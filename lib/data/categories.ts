import { prisma } from "@/lib/db";

export async function getCategories() {
  const list = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { tools: true } } },
  });
  return list.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    icon: c.icon,
    toolCount: c._count.tools,
  }));
}
