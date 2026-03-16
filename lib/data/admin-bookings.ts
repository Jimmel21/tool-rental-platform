import { prisma } from "@/lib/db";
import type { BookingStatus } from "@prisma/client";

export type AdminBookingRow = {
  id: string;
  reference: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  toolId: string;
  toolName: string;
  toolSlug: string;
  startDate: string;
  endDate: string;
  status: string;
  totalAmount: number;
  balanceDue: number;
  depositPaid: number;
  depositStatus: string | null;
  paymentStatus: "paid" | "partial" | "pending" | "overdue";
  createdAt: string;
};

export type AdminBookingsFilter = {
  status?: BookingStatus;
  dateFrom?: string;
  dateTo?: string;
  paymentStatus?: "paid" | "partial" | "pending";
  search?: string;
};

function getPaymentStatus(
  balanceDue: number,
  depositPaid: number
): "paid" | "partial" | "pending" | "overdue" {
  if (balanceDue <= 0) return "paid";
  if (depositPaid > 0) return "partial";
  return "pending";
}

export async function getAdminBookings(
  filter: AdminBookingsFilter = {}
): Promise<AdminBookingRow[]> {
  const where: {
    status?: BookingStatus;
    startDate?: { gte?: Date; lte?: Date };
    OR?: Array<
      | { id: { contains: string; mode: "insensitive" } }
      | { customer: { name: { contains: string; mode: "insensitive" } } }
    >;
  } = {};

  if (filter.status) where.status = filter.status;
  if (filter.dateFrom || filter.dateTo) {
    where.startDate = {};
    if (filter.dateFrom) where.startDate.gte = new Date(filter.dateFrom);
    if (filter.dateTo) where.startDate.lte = new Date(filter.dateTo);
  }
  if (filter.search?.trim()) {
    const q = filter.search.trim();
    where.OR = [
      { id: { contains: q, mode: "insensitive" } },
      { customer: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      tool: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  let rows: AdminBookingRow[] = bookings.map((b) => {
    const balanceDue = Number(b.balanceDue);
    const depositPaid = Number(b.depositPaid);
    const totalAmount = Number(b.totalAmount);
    const paymentStatus = getPaymentStatus(balanceDue, depositPaid);
    return {
      id: b.id,
      reference: b.id.slice(0, 8).toUpperCase(),
      customerId: b.customer.id,
      customerName: b.customer.name,
      customerEmail: b.customer.email,
      customerPhone: b.customer.phone,
      toolId: b.tool.id,
      toolName: b.tool.name,
      toolSlug: b.tool.slug,
      startDate: b.startDate.toISOString().slice(0, 10),
      endDate: b.endDate.toISOString().slice(0, 10),
      status: b.status,
      totalAmount,
      balanceDue,
      depositPaid,
      depositStatus: b.depositStatus,
      paymentStatus,
      createdAt: b.createdAt.toISOString(),
    };
  });

  if (filter.paymentStatus) {
    rows = rows.filter((r) => r.paymentStatus === filter.paymentStatus);
  }

  return rows;
}

export type AdminBookingDetail = {
  id: string;
  reference: string;
  startDate: string;
  endDate: string;
  status: string;
  totalAmount: number;
  depositPaid: number;
  balanceDue: number;
  deliveryOption: string;
  deliveryAddress: string | null;
  deliveryFee: number | null;
  notes: string | null;
  depositStatus: string | null;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  tool: {
    id: string;
    name: string;
    slug: string;
    dailyRate: number;
    depositAmount: number;
  };
  payments: {
    id: string;
    amount: number;
    method: string;
    type: string;
    status: string;
    transactionRef: string | null;
    customerDeclaredPaidAt: string | null;
    createdAt: string;
  }[];
};

export async function getAdminBookingDetail(
  id: string
): Promise<AdminBookingDetail | null> {
  const b = await prisma.booking.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      tool: { select: { id: true, name: true, slug: true, dailyRate: true, depositAmount: true } },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!b) return null;

  return {
    id: b.id,
    reference: b.id.slice(0, 8).toUpperCase(),
    startDate: b.startDate.toISOString().slice(0, 10),
    endDate: b.endDate.toISOString().slice(0, 10),
    status: b.status,
    totalAmount: Number(b.totalAmount),
    depositPaid: Number(b.depositPaid),
    balanceDue: Number(b.balanceDue),
    deliveryOption: b.deliveryOption,
    deliveryAddress: b.deliveryAddress,
    deliveryFee: b.deliveryFee != null ? Number(b.deliveryFee) : null,
    notes: b.notes,
    depositStatus: b.depositStatus,
    createdAt: b.createdAt.toISOString(),
    customer: b.customer,
    tool: {
      ...b.tool,
      dailyRate: Number(b.tool.dailyRate),
      depositAmount: Number(b.tool.depositAmount),
    },
    payments: b.payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      method: p.method,
      type: p.type,
      status: p.status,
      transactionRef: p.transactionRef,
      customerDeclaredPaidAt: p.customerDeclaredPaidAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
    })),
  };
}
