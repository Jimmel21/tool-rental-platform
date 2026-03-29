import { renderLayout } from "./base";

export interface BookingCompletedEmailProps {
  customerName: string;
  bookingRef: string;
  toolName: string;
  reviewUrl?: string;
  depositReleased: boolean;
}

export function renderBookingCompletedEmail(
  props: BookingCompletedEmailProps
): { subject: string; html: string; text: string } {
  const { customerName, bookingRef, toolName, reviewUrl, depositReleased } = props;

  const subject = `Thanks for renting ${toolName} – booking ${bookingRef}`;

  const html = renderLayout({
    title: subject,
    previewText: "Thanks for renting with Tool Rental TT.",
    children: `
      <p>Hi ${customerName},</p>
      <p>Thank you for renting <strong>${toolName}</strong> with <strong>Tool Rental TT</strong>.</p>

      <p style="margin:0 0 6px 0;"><strong>Booking reference:</strong> ${bookingRef}</p>
      <p style="margin:0 0 12px 0;"><strong>Deposit status:</strong> ${
        depositReleased
          ? "Your deposit has been marked for release. Depending on your bank, it may take a few business days to reflect."
          : "Your deposit is still held. If you have any questions about this, please contact us."
      }</p>

      <p style="margin:0 0 12px 0;">We’d really appreciate a quick review – it helps other customers in Trinidad & Tobago find the right tools.</p>

      ${
        reviewUrl
          ? `<p style="margin:16px 0 0 0;">
              <a href="${reviewUrl}" class="btn">Leave a review</a>
            </p>`
          : ""
      }

      <p style="margin-top:18px;">If there’s anything we can improve, just reply to this email or WhatsApp us.</p>
    `,
  });

  const text = [
    `Hi ${customerName},`,
    ``,
    `Thank you for renting ${toolName} with Tool Rental TT.`,
    ``,
    `Booking reference: ${bookingRef}`,
    `Deposit status: ${
      depositReleased
        ? "Your deposit has been marked for release. It may take a few days to reflect."
        : "Your deposit is still held. Contact us if you have questions."
    }`,
    ``,
    `We’d really appreciate a quick review.`,
    reviewUrl ? `Leave a review: ${reviewUrl}` : ``,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

