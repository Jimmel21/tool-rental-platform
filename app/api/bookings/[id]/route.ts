import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      tool: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const isAdmin = session.user.role === "ADMIN";
  if (booking.customerId !== session.user.id && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
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
    tool: booking.tool,
  });
}
