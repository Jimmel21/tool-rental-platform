import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { BookingStatus, DepositStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { bookingId, amount, method } = body as {
    bookingId?: string;
    amount?: number;
    method?: string;
  };

  if (!bookingId || amount == null || amount <= 0) {
    return NextResponse.json(
      { error: "bookingId and positive amount are required" },
      { status: 400 }
    );
  }

  const validMethods = ["CASH", "BANK_TRANSFER", "CARD"];
  const payMethod = method && validMethods.includes(method) ? method : "CASH";

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { tool: true },
  });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  const balanceDue = Number(booking.balanceDue);
  const applyAmount = Math.min(amount, balanceDue);
  if (applyAmount <= 0) {
    return NextResponse.json(
      { error: "Booking has no balance due" },
      { status: 400 }
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        bookingId,
        amount: applyAmount,
        method: payMethod as "CASH" | "BANK_TRANSFER" | "CARD",
        type: "RENTAL",
        status: "COMPLETED",
      },
    });
    const newBalance = balanceDue - applyAmount;
    const updates: { balanceDue: number; status?: BookingStatus; depositPaid?: number; depositStatus?: DepositStatus } = {
      balanceDue: newBalance,
    };
    if (newBalance <= 0) {
      updates.status = "CONFIRMED" as BookingStatus;
      updates.depositPaid = Number(booking.tool.depositAmount);
      updates.depositStatus = "HELD" as DepositStatus;
    }
    await tx.booking.update({
      where: { id: bookingId },
      data: updates,
    });
  });

  return NextResponse.json({
    success: true,
    message: `Recorded ${applyAmount} TTD payment.`,
  });
}
