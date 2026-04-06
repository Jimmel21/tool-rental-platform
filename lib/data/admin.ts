import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

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

export type RevenueByMonthRow = {
  month: string; // "Jan 25"
  revenue: number;
  deposits: number;
  payouts: number;
};

export async function getRevenueByMonth(): Promise<RevenueByMonthRow[]> {
  const since = new Date();
  since.setMonth(since.getMonth() - 11);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  // Raw query to get sums grouped by year+month in one pass
  const rows = await prisma.$queryRaw<
    { yr: number; mo: number; type: string; total: Prisma.Decimal }[]
  >`
    SELECT
      EXTRACT(YEAR  FROM "createdAt")::int AS yr,
      EXTRACT(MONTH FROM "createdAt")::int AS mo,
      type,
      SUM(amount) AS total
    FROM "Payment"
    WHERE status = 'COMPLETED'
      AND "createdAt" >= ${since}
    GROUP BY yr, mo, type
    ORDER BY yr, mo
  `;

  // Build a map of "YYYY-MM" -> { revenue, deposits }
  const map = new Map<string, { revenue: number; deposits: number }>();
  for (const r of rows) {
    const key = `${r.yr}-${String(r.mo).padStart(2, "0")}`;
    if (!map.has(key)) map.set(key, { revenue: 0, deposits: 0 });
    const entry = map.get(key)!;
    if (r.type === "RENTAL") entry.revenue += Number(r.total);
    if (r.type === "DEPOSIT") entry.deposits += Number(r.total);
  }

  // Fill all 12 months, even empty ones
  const result: RevenueByMonthRow[] = [];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (let i = 0; i < 12; i++) {
    const d = new Date(since.getFullYear(), since.getMonth() + i, 1);
    const yr = d.getFullYear();
    const mo = d.getMonth() + 1;
    const key = `${yr}-${String(mo).padStart(2, "0")}`;
    const label = `${MONTHS[mo - 1]} ${String(yr).slice(2)}`;
    const entry = map.get(key) ?? { revenue: 0, deposits: 0 };
    // payouts = deposits held (we don't have a PAYOUT type, so show deposits returned as a proxy)
    result.push({ month: label, revenue: entry.revenue, deposits: entry.deposits, payouts: 0 });
  }
  return result;
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
