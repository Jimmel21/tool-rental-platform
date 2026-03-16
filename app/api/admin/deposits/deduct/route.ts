import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { bookingId, amount, reason } = body as {
    bookingId?: string;
    amount?: number;
    reason?: string;
  };

  if (!bookingId || amount == null || amount <= 0) {
    return NextResponse.json(
      { error: "bookingId and positive amount are required" },
      { status: 400 }
    );
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  const depositPaid = Number(booking.depositPaid);
  if (booking.depositStatus !== "HELD" || depositPaid <= 0) {
    return NextResponse.json(
      { error: "No held deposit to deduct from" },
      { status: 400 }
    );
  }

  const deductAmount = Math.min(amount, depositPaid);
  const reasonText = reason?.trim() ? reason.trim() : "Damage/deduction";
  const noteLine = `[${new Date().toISOString().slice(0, 10)}] Deposit deducted: ${deductAmount} TTD — ${reasonText}`;
  const newNotes = booking.notes ? `${booking.notes}\n${noteLine}` : noteLine;

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      depositPaid: depositPaid - deductAmount,
      depositStatus: deductAmount >= depositPaid ? "DEDUCTED" : "HELD",
      notes: newNotes,
    },
  });

  return NextResponse.json({
    success: true,
    message: `Deducted ${deductAmount} TTD from deposit.`,
  });
}
