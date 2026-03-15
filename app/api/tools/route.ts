import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Prisma, ToolStatus } from "@prisma/client";

const ITEMS_PER_PAGE = 12;

function toNumber(v: unknown): number | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, toNumber(searchParams.get("page")) ?? 1);
  const categorySlug = searchParams.get("category") ?? undefined;
  const minPrice = toNumber(searchParams.get("minPrice"));
  const maxPrice = toNumber(searchParams.get("maxPrice"));
  const search = searchParams.get("search")?.trim() ?? searchParams.get("q")?.trim();
  const sort = searchParams.get("sort") ?? "popular"; // popular | price-asc | price-desc

  const where: Prisma.ToolWhereInput = {
    status: "AVAILABLE" as ToolStatus,
  };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }
  if (minPrice != null || maxPrice != null) {
    where.dailyRate = {};
    if (minPrice != null) (where.dailyRate as { gte?: number }).gte = minPrice;
    if (maxPrice != null) (where.dailyRate as { lte?: number }).lte = maxPrice;
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { category: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const orderBy =
    sort === "price-asc"
      ? { dailyRate: "asc" as const }
      : sort === "price-desc"
        ? { dailyRate: "desc" as const }
        : [{ createdAt: "desc" as const }, { dailyRate: "asc" as const }];

  const [tools, total] = await Promise.all([
    prisma.tool.findMany({
      where,
      orderBy,
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      include: {
        category: { select: { name: true, slug: true } },
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } },
      },
    }),
    prisma.tool.count({ where }),
  ]);

  const items = tools.map((t) => {
    const ratings = t.reviews.map((r) => r.rating);
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : null;
    return {
      id: t.id,
      slug: t.slug,
      name: t.name,
      description: t.description,
      category: t.category,
      dailyRate: Number(t.dailyRate),
      weeklyRate: Number(t.weeklyRate),
      depositAmount: Number(t.depositAmount),
      images: t.images,
      status: t.status,
      reviewCount: t._count.reviews,
      averageRating: avgRating != null ? Math.round(avgRating * 10) / 10 : null,
    };
  });

  return NextResponse.json({
    items,
    total,
    page,
    totalPages: Math.ceil(total / ITEMS_PER_PAGE),
    perPage: ITEMS_PER_PAGE,
  });
}
