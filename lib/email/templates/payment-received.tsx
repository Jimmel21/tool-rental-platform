import { renderLayout } from "./base";

export interface PaymentReceivedEmailProps {
  customerName: string;
  bookingRef: string;
  amount: number;
  method: string;
  balanceDue: number;
  status: string;
  manageUrl?: string;
}

function formatTT(amount: number): string {
  return `TT$${amount.toFixed(2)}`;
}

export function renderPaymentReceivedEmail(
  props: PaymentReceivedEmailProps
): { subject: string; html: string; text: string } {
  const { customerName, bookingRef, amount, method, balanceDue, status, manageUrl } =
    props;

  const subject = `Payment received – ${formatTT(amount)} for booking ${bookingRef}`;

  const html = renderLayout({
    title: subject,
    previewText: `We’ve received your payment of ${formatTT(
      amount
    )} for booking ${bookingRef}.`,
    children: `
      <p>Hi ${customerName},</p>
      <p>Good news — we’ve received your payment for booking <strong>${bookingRef}</strong>.</p>

      <p style="margin:0 0 6px 0;"><strong>Amount:</strong> ${formatTT(amount)}</p>
      <p style="margin:0 0 6px 0;"><strong>Method:</strong> ${method}</p>
      <p style="margin:0 0 6px 0;"><strong>Booking status:</strong> ${status}</p>
      <p style="margin:0 0 12px 0;"><strong>Balance due:</strong> ${
        balanceDue > 0
          ? `${formatTT(balanceDue)} (payable on pickup/delivery)`
          : "TT$0.00 (fully paid)"
      }</p>

      ${
        manageUrl
          ? `<p style="margin:16px 0 0 0;">
              <a href="${manageUrl}" class="btn">View booking</a>
            </p>`
          : ""
      }

      <p style="margin-top:18px;">If you have any questions about this payment, reply to this email or WhatsApp us.</p>
    `,
  });

  const text = [
    `Hi ${customerName},`,
    ``,
    `We’ve received your payment for booking ${bookingRef}.`,
    ``,
    `Amount: ${formatTT(amount)}`,
    `Method: ${method}`,
    `Booking status: ${status}`,
    `Balance due: ${
      balanceDue > 0
        ? `${formatTT(balanceDue)} (payable on pickup/delivery)`
        : "TT$0.00 (fully paid)"
    }`,
    ``,
    manageUrl ? `View booking: ${manageUrl}` : ``,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

