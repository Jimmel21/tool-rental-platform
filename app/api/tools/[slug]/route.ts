import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const tool = await prisma.tool.findUnique({
    where: { slug },
    include: {
      category: true,
      owner: { select: { id: true, name: true } },
      reviews: {
        include: { customer: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!tool) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ratings = tool.reviews.map((r) => r.rating);
  const averageRating =
    ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : null;

  return NextResponse.json({
    id: tool.id,
    slug: tool.slug,
    name: tool.name,
    description: tool.description,
    category: tool.category,
    brand: tool.brand,
    model: tool.model,
    dailyRate: Number(tool.dailyRate),
    weeklyRate: Number(tool.weeklyRate),
    depositAmount: Number(tool.depositAmount),
    images: tool.images,
    status: tool.status,
    conditionNotes: tool.conditionNotes,
    owner: tool.owner,
    reviewCount: tool.reviews.length,
    averageRating,
    reviews: tool.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      customerName: r.customer.name,
      createdAt: r.createdAt,
    })),
  });
}
