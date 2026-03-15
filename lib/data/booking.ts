import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function getBookingById(bookingId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      tool: { select: { id: true, name: true, slug: true } },
    },
  });
  if (!booking) return null;
  if (booking.customerId !== session.user.id && session.user.role !== "ADMIN") {
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
    tool: booking.tool,
  };
}
