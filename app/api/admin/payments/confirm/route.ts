import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { paymentService } from "@/lib/payment/PaymentService";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { paymentId, transactionRef } = body as { paymentId?: string; transactionRef?: string };
  const refOrId = transactionRef?.trim() ?? paymentId?.trim();

  if (!refOrId) {
    return NextResponse.json(
      { error: "paymentId or transactionRef is required" },
      { status: 400 }
    );
  }

  const result = await paymentService.confirmPayment(refOrId);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? "Failed to confirm payment" },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, message: "Payment confirmed." });
}
