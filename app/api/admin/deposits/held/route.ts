import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getHeldDeposits } from "@/lib/data/admin-payments";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const list = await getHeldDeposits();
  return NextResponse.json(list);
}

/** Mark a booking's deposit as HELD so it can be managed via release/deduct. */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { bookingId } = body as { bookingId?: string };

  if (!bookingId) {
    return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  if (booking.depositStatus === "HELD") {
    return NextResponse.json({ error: "Deposit is already held" }, { status: 400 });
  }

  if (Number(booking.depositPaid) <= 0) {
    return NextResponse.json({ error: "No deposit amount on record" }, { status: 400 });
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { depositStatus: "HELD" },
  });

  return NextResponse.json({ success: true, message: "Deposit marked as held." });
}
