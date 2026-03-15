import { NextResponse } from "next/server";
import { paymentService } from "@/lib/payment/PaymentService";

/**
 * Placeholder webhook for payment gateway callbacks (WiPay, First Atlantic Commerce, etc.).
 * Verify signature and parse payload when integrating a real gateway.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    // Placeholder: expect { transactionRef } or gateway-specific payload
    const transactionRef =
      body.transactionRef ??
      body.reference ??
      body.payment_reference ??
      body.transaction_id;

    if (!transactionRef) {
      return NextResponse.json(
        { received: true, message: "Webhook received; no transactionRef to confirm" },
        { status: 200 }
      );
    }

    const result = await paymentService.confirmPayment(String(transactionRef));

    if (result.success) {
      return NextResponse.json({ received: true, confirmed: true });
    }

    return NextResponse.json(
      { received: true, confirmed: false, error: result.error },
      { status: 200 }
    );
  } catch (e) {
    console.error("Payment webhook error:", e);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
