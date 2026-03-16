import { prisma } from "@/lib/db";
import type { ToolStatus } from "@prisma/client";

export type AdminToolRow = {
  id: string;
  slug: string;
  name: string;
  categoryName: string;
  categoryId: string;
  dailyRate: number;
  status: string;
  imageUrl: string | null;
  ownerName: string;
  ownerId: string;
  bookingCount: number;
};

export type AdminToolsFilter = {
  categoryId?: string;
  status?: ToolStatus;
  ownerId?: string;
  search?: string;
};

export async function getAdminToolsList(
  filter: AdminToolsFilter = {}
): Promise<AdminToolRow[]> {
  const where: {
    categoryId?: string;
    status?: ToolStatus;
    ownerId?: string;
    OR?: { name?: { contains: string; mode: "insensitive" }; description?: { contains: string; mode: "insensitive" } }[];
  } = {};
  if (filter.categoryId) where.categoryId = filter.categoryId;
  if (filter.status) where.status = filter.status;
  if (filter.ownerId) where.ownerId = filter.ownerId;
  if (filter.search?.trim()) {
    const q = filter.search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const tools = await prisma.tool.findMany({
    where,
    include: {
      category: { select: { name: true } },
      owner: { select: { name: true } },
      _count: { select: { bookings: true } },
    },
    orderBy: { name: "asc" },
  });

  return tools.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    categoryName: t.category.name,
    categoryId: t.categoryId,
    dailyRate: Number(t.dailyRate),
    status: t.status,
    imageUrl: t.images[0] ?? null,
    ownerName: t.owner.name,
    ownerId: t.ownerId,
    bookingCount: t._count.bookings,
  }));
}

export type AdminToolDetail = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  categoryId: string;
  categoryName: string;
  brand: string | null;
  model: string | null;
  dailyRate: number;
  weeklyRate: number;
  depositAmount: number;
  images: string[];
  status: string;
  ownerId: string;
  ownerName: string;
  conditionNotes: string | null;
  gpsTrackerId: string | null;
  nextMaintenanceAt: string | null;
  maintenanceNotes: string | null;
  bookingCount: number;
  totalRevenue: number;
  bookings: { id: string; startDate: string; endDate: string; status: string; totalAmount: number; customerName: string }[];
};

export async function getAdminToolDetail(
  id: string
): Promise<AdminToolDetail | null> {
  const tool = await prisma.tool.findUnique({
    where: { id },
    include: {
      category: true,
      owner: { select: { id: true, name: true } },
      bookings: {
        orderBy: { startDate: "desc" },
        take: 20,
        include: { customer: { select: { name: true } } },
      },
      _count: { select: { bookings: true } },
    },
  });
  if (!tool) return null;

  const completedPayments = await prisma.payment.aggregate({
    where: {
      booking: { toolId: tool.id },
      status: "COMPLETED",
      type: "RENTAL",
    },
    _sum: { amount: true },
  });

  return {
    id: tool.id,
    slug: tool.slug,
    name: tool.name,
    description: tool.description,
    categoryId: tool.categoryId,
    categoryName: tool.category.name,
    brand: tool.brand,
    model: tool.model,
    dailyRate: Number(tool.dailyRate),
    weeklyRate: Number(tool.weeklyRate),
    depositAmount: Number(tool.depositAmount),
    images: tool.images,
    status: tool.status,
    ownerId: tool.ownerId,
    ownerName: tool.owner.name,
    conditionNotes: tool.conditionNotes,
    gpsTrackerId: tool.gpsTrackerId,
    nextMaintenanceAt: tool.nextMaintenanceAt?.toISOString().slice(0, 10) ?? null,
    maintenanceNotes: tool.maintenanceNotes ?? null,
    bookingCount: tool._count.bookings,
    totalRevenue: Number(completedPayments._sum.amount ?? 0),
    bookings: tool.bookings.map((b) => ({
      id: b.id,
      startDate: b.startDate.toISOString().slice(0, 10),
      endDate: b.endDate.toISOString().slice(0, 10),
      status: b.status,
      totalAmount: Number(b.totalAmount),
      customerName: b.customer.name,
    })),
  };
}
