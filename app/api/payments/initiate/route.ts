import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { paymentService } from "@/lib/payment/PaymentService";
import type { PaymentMethod } from "@prisma/client";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { bookingId, method, amount, type } = body as {
    bookingId?: string;
    method?: PaymentMethod;
    amount?: number;
    type?: "RENTAL" | "DEPOSIT";
  };

  if (!bookingId || !method || amount == null || amount <= 0) {
    return NextResponse.json(
      { error: "bookingId, method, and amount are required" },
      { status: 400 }
    );
  }

  // Derive the app base URL from the incoming request origin so the WiPay
  // response_url and origin fields are always correct (dev / staging / prod).
  const appBaseUrl =
    request.headers.get("origin") ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000";

  const result = await paymentService.initiatePayment(
    bookingId,
    method,
    amount,
    type ?? "RENTAL",
    appBaseUrl
  );

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? "Failed to initiate payment" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    paymentId: result.paymentId,
    transactionRef: result.transactionRef,
    // Defined for CARD payments — the client should redirect to this URL
    checkoutUrl: result.checkoutUrl ?? null,
  });
}
