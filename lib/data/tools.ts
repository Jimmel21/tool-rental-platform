import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function getToolsList(options: {
  page?: number;
  limit?: number;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  startDate?: Date;
  endDate?: Date;
  sort?: "popular" | "price-asc" | "price-desc";
  search?: string;
}) {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(24, Math.max(1, options.limit ?? 12));
  const skip = (page - 1) * limit;

  const where: Prisma.ToolWhereInput = {
    status: "AVAILABLE",
  };
  if (options.categorySlug) {
    where.category = { slug: options.categorySlug };
  }
  if (options.minPrice != null || options.maxPrice != null) {
    where.dailyRate = {};
    if (options.minPrice != null) (where.dailyRate as { gte?: number }).gte = options.minPrice;
    if (options.maxPrice != null) (where.dailyRate as { lte?: number }).lte = options.maxPrice;
  }
  if (options.search?.trim()) {
    const q = options.search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { category: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  if (options.startDate && options.endDate) {
    const start = new Date(options.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(options.endDate);
    end.setHours(23, 59, 59, 999);

    where.bookings = {
      none: {
        status: { in: ["PENDING", "CONFIRMED", "ACTIVE"] },
        OR: [{ startDate: { lte: end }, endDate: { gte: start } }],
      },
    };
  }

  const orderBy =
    options.sort === "price-asc"
      ? { dailyRate: "asc" as const }
      : options.sort === "price-desc"
        ? { dailyRate: "desc" as const }
        : [{ createdAt: "desc" as const }, { dailyRate: "asc" as const }];

  const [items, total] = await Promise.all([
    prisma.tool.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: { select: { name: true, slug: true } },
        reviews: { select: { rating: true } },
        _count: { select: { reviews: true } },
      },
    }),
    prisma.tool.count({ where }),
  ]);

  const tools = items.map((t) => {
    const ratings = t.reviews.map((r) => r.rating);
    const averageRating =
      ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : null;
    return {
      id: t.id,
      slug: t.slug,
      name: t.name,
      description: t.description,
      category: t.category,
      categoryName: t.category.name,
      dailyRate: Number(t.dailyRate),
      weeklyRate: Number(t.weeklyRate),
      depositAmount: Number(t.depositAmount),
      images: t.images,
      status: t.status,
      reviewCount: t._count.reviews,
      averageRating,
    };
  });

  return {
    items: tools,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    perPage: limit,
  };
}
