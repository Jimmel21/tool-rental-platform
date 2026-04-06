import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendBookingCompletedEmail } from "@/lib/email";

const RELEASE_CONDITIONS = ["Excellent", "Good"];

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: bookingId } = await params;
  const body = await request.json().catch(() => ({}));
  const { condition, damageNotes } = body as {
    condition?: string;
    damageNotes?: string;
  };

  if (!condition) {
    return NextResponse.json({ error: "condition is required" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      tool: { select: { slug: true, name: true } },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.customerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (booking.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "Only ACTIVE bookings can be returned" },
      { status: 400 }
    );
  }

  const releaseDeposit = RELEASE_CONDITIONS.includes(condition);
  const depositHeld = booking.depositStatus === "HELD";

  // Determine deposit updates
  let depositStatus = booking.depositStatus;
  let depositPaid = Number(booking.depositPaid);
  let notesAppend = "";

  if (depositHeld) {
    if (releaseDeposit) {
      depositStatus = "RELEASED";
      depositPaid = 0;
    } else {
      // Damaged or Missing — deduct full held deposit
      const reason = damageNotes?.trim() || `Return condition: ${condition}`;
      notesAppend = `\n[${new Date().toISOString().slice(0, 10)}] Deposit deducted: ${depositPaid} TTD — ${reason}`;
      depositStatus = "DEDUCTED";
      depositPaid = 0;
    }
  }

  const updatedNotes = booking.notes
    ? booking.notes + notesAppend
    : notesAppend || null;

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "COMPLETED",
      returnCondition: condition,
      damageNotes: damageNotes?.trim() || null,
      depositStatus: depositStatus as "HELD" | "RELEASED" | "DEDUCTED",
      depositPaid,
      notes: updatedNotes,
    },
  });

  // Send completion email (non-blocking — log failure, don't fail the request)
  const bookingRef = bookingId.slice(0, 8).toUpperCase();
  const reviewUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/tools/${booking.tool.slug}/book`;

  sendBookingCompletedEmail(
    booking.customer.email,
    booking.customer.name,
    {
      customerName: booking.customer.name,
      bookingRef,
      toolName: booking.tool.name,
      reviewUrl,
      depositReleased: releaseDeposit && depositHeld,
    }
  ).catch((err) =>
    console.error("[return] Failed to send completion email", err)
  );

  return NextResponse.json({ success: true });
}
