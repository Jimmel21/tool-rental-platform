import { prisma } from "@/lib/db";
import { generateBankTransferReference } from "./reference";
import { MOCK_GATEWAY_DELAY_MS } from "./constants";
import type { PaymentMethod } from "@prisma/client";

export interface InitiateResult {
  success: boolean;
  paymentId?: string;
  transactionRef?: string;
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

/**
 * Payment service - placeholder for WiPay, First Atlantic Commerce, etc.
 * Currently uses mock success after delay.
 */
export class PaymentService {
  /**
   * Initiate a payment (creates Payment record, returns ref for bank transfer).
   */
  async initiatePayment(
    bookingId: string,
    method: PaymentMethod,
    amount: number,
    type: "RENTAL" | "DEPOSIT" = "RENTAL"
  ): Promise<InitiateResult> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true },
    });
    if (!booking) return { success: false, error: "Booking not found" };

    const transactionRef =
      method === "BANK_TRANSFER" ? generateBankTransferReference() : undefined;

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

    // CASH (pay on pickup): use payment id as ref so admin can confirm later
    const finalRef =
      method === "CASH"
        ? (await prisma.payment
            .update({
              where: { id: payment.id },
              data: { transactionRef: payment.id },
            })
            .then((p) => p.transactionRef ?? undefined))
        : payment.transactionRef ?? undefined;

    return {
      success: true,
      paymentId: payment.id,
      transactionRef: finalRef,
    };
  }

  /**
   * Confirm a payment (e.g. after gateway callback or manual bank verification).
   * Look up by transactionRef or by paymentId (for CASH / admin).
   * Mock: succeeds after 2s delay.
   */
  async confirmPayment(transactionRefOrPaymentId: string): Promise<ConfirmResult> {
    await new Promise((r) => setTimeout(r, MOCK_GATEWAY_DELAY_MS));

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
    if (payment.status === "COMPLETED") {
      return { success: true };
    }

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

      const updated = await tx.booking.findUnique({
        where: { id: booking.id },
      });
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
   * Refund a payment. Mock: succeeds after 2s delay.
   */
  async refundPayment(paymentId: string): Promise<RefundResult> {
    await new Promise((r) => setTimeout(r, MOCK_GATEWAY_DELAY_MS));

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });
    if (!payment) return { success: false, error: "Payment not found" };
    if (payment.status !== "COMPLETED") {
      return { success: false, error: "Payment is not completed" };
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
