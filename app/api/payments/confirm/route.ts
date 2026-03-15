import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { paymentService } from "@/lib/payment/PaymentService";

/**
 * Confirm a payment (e.g. user clicks "I've made the transfer" for bank transfer).
 * Admin can also confirm via this or a separate admin action.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { transactionRef, paymentId } = body as {
    transactionRef?: string;
    paymentId?: string;
  };
  const refOrId = transactionRef?.trim() ?? paymentId?.trim();

  if (!refOrId) {
    return NextResponse.json(
      { error: "transactionRef or paymentId is required" },
      { status: 400 }
    );
  }

  const payment = await prisma.payment
    .findUnique({
      where: { transactionRef: refOrId },
      include: { booking: true },
    })
    .then(
      (p) =>
        p ??
        prisma.payment.findUnique({
          where: { id: refOrId },
          include: { booking: true },
        })
    );
  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }
  if (payment.booking.customerId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const isAdmin = session.user.role === "ADMIN";

  // Bank transfer: customer can only declare "I've made the transfer"; admin confirms later
  if (payment.method === "BANK_TRANSFER" && !isAdmin) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { customerDeclaredPaidAt: new Date() },
    });
    return NextResponse.json({
      success: true,
      message: "We've recorded your transfer. Admin will verify within 1-2 business days.",
    });
  }

  const result = await paymentService.confirmPayment(refOrId);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? "Failed to confirm payment" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Payment confirmed. Admin may verify bank transfers manually.",
  });
}
