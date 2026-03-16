import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";
import type { ToolStatus } from "@prisma/client";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const {
    name,
    description,
    categoryId,
    brand,
    model,
    dailyRate,
    weeklyRate,
    depositAmount,
    images,
    status,
    ownerId,
    conditionNotes,
    gpsTrackerId,
    nextMaintenanceAt,
    maintenanceNotes,
  } = body as {
    name?: string;
    description?: string | null;
    categoryId?: string;
    brand?: string | null;
    model?: string | null;
    dailyRate?: number;
    weeklyRate?: number;
    depositAmount?: number;
    images?: string[];
    status?: string;
    ownerId?: string;
    conditionNotes?: string | null;
    gpsTrackerId?: string | null;
    nextMaintenanceAt?: string | null;
    maintenanceNotes?: string | null;
  };

  if (!name?.trim() || !categoryId || !ownerId) {
    return NextResponse.json(
      { error: "name, categoryId, and ownerId are required" },
      { status: 400 }
    );
  }

  const daily = Number(dailyRate);
  const weekly = Number(weeklyRate);
  const deposit = Number(depositAmount);
  if (isNaN(daily) || daily < 0 || isNaN(weekly) || weekly < 0 || isNaN(deposit) || deposit < 0) {
    return NextResponse.json(
      { error: "dailyRate, weeklyRate, depositAmount must be non-negative numbers" },
      { status: 400 }
    );
  }

  const baseSlug = slugify(name);
  let slug = baseSlug;
  let n = 0;
  while (await prisma.tool.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${baseSlug}-${n}`;
  }

  const tool = await prisma.tool.create({
    data: {
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      categoryId,
      brand: brand?.trim() || null,
      model: model?.trim() || null,
      dailyRate: daily,
      weeklyRate: weekly,
      depositAmount: deposit,
      images: Array.isArray(images) ? images : [],
      status: (status && ["AVAILABLE", "RENTED", "MAINTENANCE", "RETIRED"].includes(status)) ? (status as ToolStatus) : "AVAILABLE",
      ownerId,
      conditionNotes: conditionNotes?.trim() || null,
      gpsTrackerId: gpsTrackerId?.trim() || null,
      nextMaintenanceAt: nextMaintenanceAt ? new Date(nextMaintenanceAt) : null,
      maintenanceNotes: maintenanceNotes?.trim() || null,
    },
  });

  return NextResponse.json({ id: tool.id, slug: tool.slug, name: tool.name });
}
