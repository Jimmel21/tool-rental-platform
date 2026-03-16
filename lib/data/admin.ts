import { prisma } from "@/lib/db";

const now = new Date();
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

export type AdminStats = {
  totalTools: number;
  activeRentals: number;
  revenueThisMonth: number;
  pendingBookings: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const [totalTools, activeRentals, revenueThisMonth, pendingBookings] =
    await Promise.all([
      prisma.tool.count(),
      prisma.booking.count({
        where: { status: "ACTIVE" },
      }),
      prisma.payment.aggregate({
        where: {
          status: "COMPLETED",
          type: "RENTAL",
          createdAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.booking.count({
        where: { status: "PENDING" },
      }),
    ]);

  return {
    totalTools,
    activeRentals,
    revenueThisMonth: Number(revenueThisMonth._sum.amount ?? 0),
    pendingBookings,
  };
}

export type RecentBookingRow = {
  id: string;
  reference: string;
  startDate: string;
  endDate: string;
  status: string;
  totalAmount: number;
  toolName: string;
  customerName: string;
};

export async function getRecentBookings(limit = 10): Promise<RecentBookingRow[]> {
  const bookings = await prisma.booking.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      tool: { select: { name: true } },
      customer: { select: { name: true } },
    },
  });
  return bookings.map((b) => ({
    id: b.id,
    reference: b.id.slice(0, 8).toUpperCase(),
    startDate: b.startDate.toISOString().slice(0, 10),
    endDate: b.endDate.toISOString().slice(0, 10),
    status: b.status,
    totalAmount: Number(b.totalAmount),
    toolName: b.tool.name,
    customerName: b.customer.name,
  }));
}

export type ToolNeedingAttention = {
  id: string;
  name: string;
  slug: string;
  status: string;
  nextMaintenanceAt: string | null;
  utilizationCount: number;
};

export async function getToolsNeedingAttention(
  limit = 5
): Promise<ToolNeedingAttention[]> {
  const tools = await prisma.tool.findMany({
    where: {
      OR: [
        { status: "MAINTENANCE" },
        { nextMaintenanceAt: { lte: new Date(), not: null } },
      ],
    },
    take: limit,
    include: { _count: { select: { bookings: true } } },
  });
  return tools.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    status: t.status,
    nextMaintenanceAt: t.nextMaintenanceAt?.toISOString().slice(0, 10) ?? null,
    utilizationCount: t._count.bookings,
  }));
}
