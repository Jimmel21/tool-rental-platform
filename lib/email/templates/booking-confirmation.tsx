import { renderLayout } from "./base";

export interface BookingConfirmationEmailProps {
  customerName: string;
  bookingRef: string;
  toolName: string;
  toolImageUrl?: string | null;
  startDate: string;
  endDate: string;
  days: number;
  rentalSubtotal: number;
  depositAmount: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryOption: "PICKUP" | "DELIVERY";
  pickupLocation?: string;
  deliveryWindow?: string;
  paymentInstructions: string;
  manageUrl?: string;
}

function formatTT(amount: number): string {
  return `TT$${amount.toFixed(2)}`;
}

export function renderBookingConfirmationEmail(
  props: BookingConfirmationEmailProps
): { subject: string; html: string; text: string } {
  const {
    customerName,
    bookingRef,
    toolName,
    toolImageUrl,
    startDate,
    endDate,
    days,
    rentalSubtotal,
    depositAmount,
    deliveryFee,
    totalAmount,
    deliveryOption,
    pickupLocation,
    deliveryWindow,
    paymentInstructions,
    manageUrl,
  } = props;

  const subject = `Booking confirmed – ${toolName} (${bookingRef})`;

  const html = renderLayout({
    title: subject,
    previewText: `Your booking ${bookingRef} is pending payment for ${toolName}.`,
    children: `
      <p>Hi ${customerName},</p>
      <p>Thanks for booking with <strong>Tool Rental TT</strong>. Here are your booking details:</p>

      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-top:12px;margin-bottom:12px;font-size:14px;">
        <tr>
          <td style="vertical-align:top;padding-right:12px;">
            <p style="margin:0 0 4px 0;"><strong>Booking reference:</strong> ${bookingRef}</p>
            <p style="margin:0 0 4px 0;"><strong>Tool:</strong> ${toolName}</p>
            <p style="margin:0 0 4px 0;"><strong>Dates:</strong> ${startDate} – ${endDate} (${days} day${days !== 1 ? "s" : ""})</p>
          </td>
          ${
            toolImageUrl
              ? `<td style="width:120px;text-align:right;">
                  <img src="${toolImageUrl}" alt="${toolName}" style="max-width:110px;border-radius:8px;border:1px solid #e5e7eb;" />
                </td>`
              : ""
          }
        </tr>
      </table>

      <h3 style="margin-top:16px;margin-bottom:8px;font-size:15px;color:#111827;">Cost breakdown</h3>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;">
        <tr>
          <td>Rental (${days} day${days !== 1 ? "s" : ""})</td>
          <td style="text-align:right;">${formatTT(rentalSubtotal)}</td>
        </tr>
        <tr>
          <td>Refundable deposit</td>
          <td style="text-align:right;">${formatTT(depositAmount)}</td>
        </tr>
        <tr>
          <td>${
            deliveryOption === "DELIVERY" ? "Delivery fee" : "Pickup (no delivery fee)"
          }</td>
          <td style="text-align:right;">${
            deliveryOption === "DELIVERY" ? formatTT(deliveryFee) : "TT$0.00"
          }</td>
        </tr>
        <tr>
          <td style="padding-top:6px;border-top:1px solid #e5e7eb;"><strong>Total</strong></td>
          <td style="padding-top:6px;border-top:1px solid #e5e7eb;text-align:right;"><strong>${formatTT(
            totalAmount
          )}</strong></td>
        </tr>
      </table>

      <h3 style="margin-top:18px;margin-bottom:8px;font-size:15px;color:#111827;">Pickup / delivery</h3>
      ${
        deliveryOption === "DELIVERY"
          ? `<p style="margin:0 0 8px 0;"><strong>Delivery:</strong> ${deliveryWindow ?? "We’ll confirm your delivery window by WhatsApp."}</p>`
          : `<p style="margin:0 0 8px 0;"><strong>Pickup:</strong> ${pickupLocation ?? "We’ll confirm the pickup location by WhatsApp."}</p>`
      }

      <h3 style="margin-top:18px;margin-bottom:8px;font-size:15px;color:#111827;">Payment instructions</h3>
      <p style="margin:0 0 12px 0;">${paymentInstructions}</p>

      ${
        manageUrl
          ? `<p style="margin:16px 0 0 0;">
              <a href="${manageUrl}" class="btn">View booking</a>
            </p>`
          : ""
      }

      <p style="margin-top:18px;">If anything looks incorrect, reply to this email or WhatsApp us and we’ll help.</p>
    `,
  });

  const text = [
    `Hi ${customerName},`,
    ``,
    `Thanks for booking with Tool Rental TT.`,
    ``,
    `Booking reference: ${bookingRef}`,
    `Tool: ${toolName}`,
    `Dates: ${startDate} – ${endDate} (${days} day${days !== 1 ? "s" : ""})`,
    ``,
    `Rental: ${formatTT(rentalSubtotal)}`,
    `Deposit: ${formatTT(depositAmount)}`,
    `Delivery: ${
      deliveryOption === "DELIVERY" ? formatTT(deliveryFee) : "TT$0.00 (pickup)"
    }`,
    `Total: ${formatTT(totalAmount)}`,
    ``,
    `Pickup / delivery: ${
      deliveryOption === "DELIVERY"
        ? deliveryWindow ?? "We’ll confirm your delivery window by WhatsApp."
        : pickupLocation ?? "We’ll confirm the pickup location by WhatsApp."
    }`,
    ``,
    `Payment instructions:`,
    paymentInstructions,
    ``,
    manageUrl ? `View booking: ${manageUrl}` : ``,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

