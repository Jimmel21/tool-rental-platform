import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * Cancel a booking. Allowed only for customer/owner when status is PENDING or CONFIRMED
 * and start date has not passed.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: bookingId } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.customerId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (booking.status !== "PENDING" && booking.status !== "CONFIRMED") {
    return NextResponse.json(
      { error: "Only pending or confirmed bookings can be cancelled" },
      { status: 400 }
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (booking.startDate < today) {
    return NextResponse.json(
      { error: "Cannot cancel a booking that has already started" },
      { status: 400 }
    );
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({ success: true, message: "Booking cancelled" });
}
