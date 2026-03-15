import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type BookingDetail = {
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
  createdAt: string;
  tool: {
    id: string;
    name: string;
    slug: string;
    images: string[];
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
    createdAt: string;
  }[];
  review: { id: string; rating: number; comment: string | null } | null;
};

export async function getBookingDetailForDashboard(
  bookingId: string
): Promise<BookingDetail | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      tool: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: true,
          dailyRate: true,
          depositAmount: true,
        },
      },
      payments: { orderBy: { createdAt: "desc" } },
      review: true,
    },
  });

  if (!booking || (booking.customerId !== session.user.id && session.user.role !== "ADMIN")) {
    return null;
  }

  return {
    id: booking.id,
    reference: booking.id.slice(0, 8).toUpperCase(),
    startDate: booking.startDate.toISOString().slice(0, 10),
    endDate: booking.endDate.toISOString().slice(0, 10),
    status: booking.status,
    totalAmount: Number(booking.totalAmount),
    depositPaid: Number(booking.depositPaid),
    balanceDue: Number(booking.balanceDue),
    deliveryOption: booking.deliveryOption,
    deliveryAddress: booking.deliveryAddress,
    deliveryFee: booking.deliveryFee != null ? Number(booking.deliveryFee) : null,
    notes: booking.notes,
    createdAt: booking.createdAt.toISOString(),
    tool: {
      ...booking.tool,
      dailyRate: Number(booking.tool.dailyRate),
      depositAmount: Number(booking.tool.depositAmount),
    },
    payments: booking.payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      method: p.method,
      type: p.type,
      status: p.status,
      transactionRef: p.transactionRef,
      createdAt: p.createdAt.toISOString(),
    })),
    review: booking.review
      ? {
          id: booking.review.id,
          rating: booking.review.rating,
          comment: booking.review.comment,
        }
      : null,
  };
}
