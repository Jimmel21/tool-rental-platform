import { prisma } from "@/lib/db";
import { generateBankTransferReference } from "./reference";
import {
  buildWiPayCheckoutUrl,
  generateWiPayReference,
  isWiPayConfigured,
} from "./wipay";
import type { PaymentMethod } from "@prisma/client";

export interface InitiateResult {
  success: boolean;
  paymentId?: string;
  transactionRef?: string;
  /** Populated for CARD payments — redirect the customer to this URL */
  checkoutUrl?: string;
  error?: string;
}

export interface ConfirmResult {
  success: boolean;
  error?: string;
}

export interface RefundResult {
  success: boolean;
  error?: string;
}

export class PaymentService {
  /**
   * Initiate a payment.
   *
   * - CARD   → creates a PENDING Payment record and returns a WiPay hosted-
   *            checkout URL.  The booking is confirmed automatically once WiPay
   *            POSTs the success callback to /api/payments/webhook.
   * - BANK_TRANSFER → returns a bank-transfer reference for manual verification.
   * - CASH   → returns the payment ID so an admin can confirm on pickup.
   *
   * @param appBaseUrl  Full origin URL of the app (e.g. https://toolrental.tt).
   *                    Required for CARD payments to build the WiPay callback URL.
   */
  async initiatePayment(
    bookingId: string,
    method: PaymentMethod,
    amount: number,
    type: "RENTAL" | "DEPOSIT" = "RENTAL",
    appBaseUrl?: string
  ): Promise<InitiateResult> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true },
    });
    if (!booking) return { success: false, error: "Booking not found" };

    // Determine transaction reference based on method
    let transactionRef: string | undefined;
    if (method === "BANK_TRANSFER") {
      transactionRef = generateBankTransferReference();
    } else if (method === "CARD") {
      transactionRef = generateWiPayReference();
    }

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount,
        method,
        type,
        status: "PENDING",
        transactionRef,
      },
    });

    // CASH: use the payment ID as the ref so admin can look it up
    if (method === "CASH") {
      const updated = await prisma.payment.update({
        where: { id: payment.id },
        data: { transactionRef: payment.id },
      });
      return {
        success: true,
        paymentId: payment.id,
        transactionRef: updated.transactionRef ?? undefined,
      };
    }

    // CARD: build WiPay checkout URL
    if (method === "CARD") {
      if (!isWiPayConfigured()) {
        // Clean up the pending record so the customer can retry
        await prisma.payment.delete({ where: { id: payment.id } });
        return {
          success: false,
          error: "Card payments are not available right now. Please try bank transfer or cash.",
        };
      }

      const base = appBaseUrl ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
      const checkoutUrl = buildWiPayCheckoutUrl({
        orderId: transactionRef!,
        total: amount.toFixed(2),
        responseUrl: `${base}/api/payments/webhook`,
        originUrl: base,
      });

      return {
        success: true,
        paymentId: payment.id,
        transactionRef,
        checkoutUrl,
      };
    }

    // BANK_TRANSFER
    return {
      success: true,
      paymentId: payment.id,
      transactionRef: payment.transactionRef ?? undefined,
    };
  }

  /**
   * Confirm a payment and update the booking status.
   *
   * Called by:
   *   - The WiPay webhook handler after verifying a successful card payment.
   *   - Admin routes when manually confirming cash or bank-transfer payments.
   *
   * Lookup order: transactionRef first, then payment ID (for cash/admin flows).
   */
  async confirmPayment(transactionRefOrPaymentId: string): Promise<ConfirmResult> {
    const payment = await prisma.payment
      .findUnique({
        where: { transactionRef: transactionRefOrPaymentId },
        include: { booking: { include: { tool: true } } },
      })
      .then(
        (p) =>
          p ??
          prisma.payment.findUnique({
            where: { id: transactionRefOrPaymentId },
            include: { booking: { include: { tool: true } } },
          })
      );

    if (!payment) return { success: false, error: "Payment not found" };
    if (payment.status === "COMPLETED") return { success: true };

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "COMPLETED" },
      });

      const booking = payment.booking;
      const amount = Number(payment.amount);

      if (payment.type === "DEPOSIT") {
        await tx.booking.update({
          where: { id: booking.id },
          data: {
            depositPaid: { increment: amount },
            balanceDue: { decrement: amount },
            depositStatus: "HELD",
          },
        });
      } else {
        await tx.booking.update({
          where: { id: booking.id },
          data: { balanceDue: { decrement: amount } },
        });
      }

      const updated = await tx.booking.findUnique({ where: { id: booking.id } });
      if (updated && Number(updated.balanceDue) <= 0) {
        const toolDeposit = Number(payment.booking.tool.depositAmount);
        const currentDepositPaid = Number(updated.depositPaid);
        await tx.booking.update({
          where: { id: booking.id },
          data: {
            status: "CONFIRMED",
            depositPaid: Math.max(currentDepositPaid, toolDeposit),
            depositStatus: "HELD",
          },
        });
      }
    });

    return { success: true };
  }

  /**
   * Refund a completed payment and reverse the booking balance adjustments.
   * For card payments, initiate a refund via WiPay (stub — real API call TBD).
   */
  async refundPayment(paymentId: string): Promise<RefundResult> {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });
    if (!payment) return { success: false, error: "Payment not found" };
    if (payment.status !== "COMPLETED") {
      return { success: false, error: "Payment is not completed" };
    }

    // Stripe stub — real integration TBD
    if (payment.method === "CARD" && payment.transactionRef?.startsWith("ST-")) {
      // TODO: call Stripe refund API when Stripe is integrated
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "REFUNDED" },
      });
      const amount = Number(payment.amount);
      if (payment.type === "DEPOSIT") {
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: {
            depositPaid: { decrement: amount },
            balanceDue: { increment: amount },
            depositStatus: null,
          },
        });
      } else {
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { balanceDue: { increment: amount } },
        });
      }
    });

    return { success: true };
  }
}

export const paymentService = new PaymentService();
