import { prisma } from "@/lib/db";
import type { PaymentMethod } from "@prisma/client";
import type { PaymentStatus } from "@prisma/client";

export type AdminPaymentRow = {
  id: string;
  bookingId: string;
  bookingReference: string;
  customerName: string;
  amount: number;
  method: string;
  type: string;
  status: string;
  transactionRef: string | null;
  customerDeclaredPaidAt: string | null;
  createdAt: string;
};

export type AdminPaymentsFilter = {
  method?: PaymentMethod;
  status?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
};

export async function getAdminPayments(
  filter: AdminPaymentsFilter = {}
): Promise<AdminPaymentRow[]> {
  const where: {
    method?: PaymentMethod;
    status?: PaymentStatus;
    createdAt?: { gte?: Date; lte?: Date };
  } = {};

  if (filter.method) where.method = filter.method;
  if (filter.status) where.status = filter.status;
  if (filter.dateFrom || filter.dateTo) {
    where.createdAt = {};
    if (filter.dateFrom) where.createdAt.gte = new Date(filter.dateFrom);
    if (filter.dateTo) where.createdAt.lte = new Date(filter.dateTo);
  }

  const payments = await prisma.payment.findMany({
    where,
    include: {
      booking: {
        include: { customer: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return payments.map((p) => ({
    id: p.id,
    bookingId: p.bookingId,
    bookingReference: p.bookingId.slice(0, 8).toUpperCase(),
    customerName: p.booking.customer.name,
    amount: Number(p.amount),
    method: p.method,
    type: p.type,
    status: p.status,
    transactionRef: p.transactionRef,
    customerDeclaredPaidAt: p.customerDeclaredPaidAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  }));
}

export async function getPendingBankTransfers(): Promise<AdminPaymentRow[]> {
  const payments = await prisma.payment.findMany({
    where: {
      method: "BANK_TRANSFER",
      status: "PENDING",
    },
    include: {
      booking: {
        include: { customer: { select: { name: true } } },
      },
    },
    orderBy: { customerDeclaredPaidAt: "desc" },
  });

  return payments.map((p) => ({
    id: p.id,
    bookingId: p.bookingId,
    bookingReference: p.bookingId.slice(0, 8).toUpperCase(),
    customerName: p.booking.customer.name,
    amount: Number(p.amount),
    method: p.method,
    type: p.type,
    status: p.status,
    transactionRef: p.transactionRef,
    customerDeclaredPaidAt: p.customerDeclaredPaidAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  }));
}

export type HeldDepositRow = {
  bookingId: string;
  reference: string;
  customerName: string;
  toolName: string;
  depositPaid: number;
  depositStatus: string;
  endDate: string;
};

export async function getHeldDeposits(): Promise<HeldDepositRow[]> {
  const bookings = await prisma.booking.findMany({
    where: { depositStatus: "HELD", depositPaid: { gt: 0 } },
    include: {
      customer: { select: { name: true } },
      tool: { select: { name: true } },
    },
    orderBy: { endDate: "desc" },
  });

  return bookings.map((b) => ({
    bookingId: b.id,
    reference: b.id.slice(0, 8).toUpperCase(),
    customerName: b.customer.name,
    toolName: b.tool.name,
    depositPaid: Number(b.depositPaid),
    depositStatus: b.depositStatus!,
    endDate: b.endDate.toISOString().slice(0, 10),
  }));
}
