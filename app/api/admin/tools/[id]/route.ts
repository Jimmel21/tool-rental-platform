import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAdminToolDetail } from "@/lib/data/admin-tools";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const tool = await getAdminToolDetail(id);
  if (!tool) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(tool);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
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

  const existing = await prisma.tool.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const slug = name != null ? slugify(name) + "-" + id.slice(-4) : undefined;
  if (slug && slug !== existing.slug) {
    const taken = await prisma.tool.findUnique({ where: { slug } });
    if (taken) return NextResponse.json({ error: "Slug already in use" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (name != null) data.name = name;
  if (slug != null) data.slug = slug;
  if (description !== undefined) data.description = description ?? null;
  if (categoryId != null) data.categoryId = categoryId;
  if (brand !== undefined) data.brand = brand ?? null;
  if (model !== undefined) data.model = model ?? null;
  if (dailyRate != null) data.dailyRate = dailyRate;
  if (weeklyRate != null) data.weeklyRate = weeklyRate;
  if (depositAmount != null) data.depositAmount = depositAmount;
  if (Array.isArray(images)) data.images = images;
  if (status != null && ["AVAILABLE", "RENTED", "MAINTENANCE", "RETIRED"].includes(status)) {
    data.status = status;
  }
  if (ownerId != null) data.ownerId = ownerId;
  if (conditionNotes !== undefined) data.conditionNotes = conditionNotes ?? null;
  if (gpsTrackerId !== undefined) data.gpsTrackerId = gpsTrackerId ?? null;
  if (nextMaintenanceAt !== undefined) {
    data.nextMaintenanceAt = nextMaintenanceAt ? new Date(nextMaintenanceAt) : null;
  }
  if (maintenanceNotes !== undefined) data.maintenanceNotes = maintenanceNotes ?? null;

  const updated = await prisma.tool.update({
    where: { id },
    data: data as Parameters<typeof prisma.tool.update>[0]["data"],
  });

  return NextResponse.json({
    id: updated.id,
    slug: updated.slug,
    name: updated.name,
    status: updated.status,
  });
}
