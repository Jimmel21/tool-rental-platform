import { NextResponse } from "next/server";
import { verifyWiPayWebhook, isWiPayConfigured } from "@/lib/payment/wipay";
import { paymentService } from "@/lib/payment/PaymentService";
import { prisma } from "@/lib/db";
import { sendPaymentReceivedEmail } from "@/lib/email";

/**
 * WiPay payment webhook — POST /api/payments/webhook
 *
 * WiPay POSTs a URL-encoded form body with at minimum:
 *   order_id, total, currency, status, payment_gateway_id, hash
 *
 * Flow:
 *   1. Parse the form body.
 *   2. Verify HMAC-SHA256 signature.
 *   3. On status === "success", call confirmPayment() which updates the
 *      Payment and Booking records inside a DB transaction.
 *   4. Always return HTTP 200 so WiPay stops retrying.
 */
export async function POST(request: Request) {
  try {
    // WiPay sends application/x-www-form-urlencoded
    const contentType = request.headers.get("content-type") ?? "";
    let body: Record<string, string>;

    if (contentType.includes("application/json")) {
      body = await request.json().catch(() => ({}));
    } else {
      const text = await request.text();
      body = Object.fromEntries(new URLSearchParams(text));
    }

    const { order_id, status, payment_gateway_id } = body;

    // Guard: if WiPay is not configured treat as misconfiguration, not an attack
    if (!isWiPayConfigured()) {
      console.error("[webhook] WiPay env vars not set — cannot process callback");
      return NextResponse.json(
        { received: true, error: "Gateway not configured" },
        { status: 200 }
      );
    }

    // 1. Verify signature
    if (!verifyWiPayWebhook(body)) {
      console.warn("[webhook] Invalid WiPay signature for order", order_id);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 2. Only act on successful payments
    if (status !== "success") {
      console.info(
        `[webhook] WiPay order ${order_id} status="${status}" — no action taken`
      );
      return NextResponse.json({ received: true, confirmed: false, status });
    }

    // 3. Confirm payment in DB (updates Payment + Booking in a transaction)
    const result = await paymentService.confirmPayment(order_id);

    if (!result.success) {
      // Log but return 200 so WiPay doesn't keep retrying a bad reference
      console.error(
        `[webhook] confirmPayment failed for order ${order_id}:`,
        result.error
      );
      return NextResponse.json(
        { received: true, confirmed: false, error: result.error },
        { status: 200 }
      );
    }

    console.info(
      `[webhook] Payment confirmed — order=${order_id} gateway_id=${payment_gateway_id}`
    );

    // Fire payment receipt email (non-blocking)
    prisma.payment
      .findUnique({
        where: { transactionRef: order_id },
        include: { booking: { include: { customer: true } } },
      })
      .then((payment) => {
        if (!payment) return;
        const { booking } = payment;
        const siteUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
        return sendPaymentReceivedEmail(booking.customer.email, booking.customer.name, {
          customerName: booking.customer.name,
          bookingRef: booking.id.slice(0, 8).toUpperCase(),
          amount: Number(payment.amount),
          method: "Card (WiPay)",
          balanceDue: Number(booking.balanceDue),
          status: booking.status,
          manageUrl: `${siteUrl}/dashboard/bookings/${booking.id}`,
        });
      })
      .catch((err) => console.error("[email] Failed to send payment receipt:", err));

    return NextResponse.json({ received: true, confirmed: true });
  } catch (err) {
    console.error("[webhook] Unexpected error processing WiPay callback:", err);
    // Return 200 to prevent WiPay retry storms; alert via logs/monitoring
    return NextResponse.json(
      { received: true, error: "Internal error" },
      { status: 200 }
    );
  }
}
