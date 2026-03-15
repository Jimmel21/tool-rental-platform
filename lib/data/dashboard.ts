import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { BookingStatus } from "@prisma/client";

export type DashboardStats = {
  activeRentals: number;
  upcomingBookings: number;
  totalSpent: number;
};

export type BookingCard = {
  id: string;
  reference: string;
  startDate: string;
  endDate: string;
  status: string;
  totalAmount: number;
  balanceDue: number;
  deliveryOption: string;
  tool: {
    id: string;
    name: string;
    slug: string;
    images: string[];
  };
  hasReview: boolean;
};

export async function getDashboardStats(): Promise<DashboardStats | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [activeRentals, upcomingBookings, completedPayments] = await Promise.all([
    prisma.booking.count({
      where: {
        customerId: session.user.id,
        status: "ACTIVE",
        startDate: { lte: today },
        endDate: { gte: today },
      },
    }),
    prisma.booking.count({
      where: {
        customerId: session.user.id,
        status: { in: ["PENDING", "CONFIRMED"] },
        startDate: { gte: today },
      },
    }),
    prisma.payment.aggregate({
      where: {
        booking: { customerId: session.user.id },
        status: "COMPLETED",
        type: "RENTAL",
      },
      _sum: { amount: true },
    }),
  ]);

  return {
    activeRentals,
    upcomingBookings,
    totalSpent: Number(completedPayments._sum.amount ?? 0),
  };
}

export type BookingTab = "upcoming" | "active" | "completed" | "cancelled";

export async function getCustomerBookings(
  tab?: BookingTab
): Promise<BookingCard[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let where: { customerId: string; status?: { in: BookingStatus[] } | BookingStatus; startDate?: { gte: Date } } = {
    customerId: session.user.id,
  };

  if (tab === "upcoming") {
    where = { ...where, status: { in: ["PENDING", "CONFIRMED"] }, startDate: { gte: today } };
  } else if (tab === "active") {
    where = { ...where, status: "ACTIVE" };
  } else if (tab === "completed") {
    where = { ...where, status: "COMPLETED" };
  } else if (tab === "cancelled") {
    where = { ...where, status: "CANCELLED" };
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      tool: { select: { id: true, name: true, slug: true, images: true } },
      review: { select: { id: true } },
    },
    orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
  });

  return bookings.map((b) => ({
    id: b.id,
    reference: b.id.slice(0, 8).toUpperCase(),
    startDate: b.startDate.toISOString().slice(0, 10),
    endDate: b.endDate.toISOString().slice(0, 10),
    status: b.status,
    totalAmount: Number(b.totalAmount),
    balanceDue: Number(b.balanceDue),
    deliveryOption: b.deliveryOption,
    tool: b.tool,
    hasReview: !!b.review,
  }));
}

export async function getCurrentAndUpcomingRentals(): Promise<BookingCard[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bookings = await prisma.booking.findMany({
    where: {
      customerId: session.user.id,
      status: { in: ["PENDING", "CONFIRMED", "ACTIVE"] },
      endDate: { gte: today },
    },
    include: {
      tool: { select: { id: true, name: true, slug: true, images: true } },
      review: { select: { id: true } },
    },
    orderBy: { startDate: "asc" },
    take: 5,
  });

  return bookings.map((b) => ({
    id: b.id,
    reference: b.id.slice(0, 8).toUpperCase(),
    startDate: b.startDate.toISOString().slice(0, 10),
    endDate: b.endDate.toISOString().slice(0, 10),
    status: b.status,
    totalAmount: Number(b.totalAmount),
    balanceDue: Number(b.balanceDue),
    deliveryOption: b.deliveryOption,
    tool: b.tool,
    hasReview: !!b.review,
  }));
}
