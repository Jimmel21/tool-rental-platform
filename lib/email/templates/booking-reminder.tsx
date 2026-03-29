import { renderLayout } from "./base";

export interface BookingReminderEmailProps {
  customerName: string;
  bookingRef: string;
  toolName: string;
  startDate: string;
  pickupTimeWindow?: string;
  pickupLocation?: string;
  deliveryWindow?: string;
  deliveryOption: "PICKUP" | "DELIVERY";
  balanceDue: number;
  manageUrl?: string;
}

function formatTT(amount: number): string {
  return `TT$${amount.toFixed(2)}`;
}

export function renderBookingReminderEmail(
  props: BookingReminderEmailProps
): { subject: string; html: string; text: string } {
  const {
    customerName,
    bookingRef,
    toolName,
    startDate,
    pickupTimeWindow,
    pickupLocation,
    deliveryWindow,
    deliveryOption,
    balanceDue,
    manageUrl,
  } = props;

  const subject = `Reminder – ${toolName} booking starts tomorrow (${bookingRef})`;

  const whereLine =
    deliveryOption === "DELIVERY"
      ? `Delivery window: ${deliveryWindow ?? "We’ll confirm your delivery time by WhatsApp."}`
      : `Pickup: ${pickupLocation ?? "We’ll confirm the pickup location by WhatsApp."}${
          pickupTimeWindow ? ` (${pickupTimeWindow})` : ""
        }`;

  const html = renderLayout({
    title: subject,
    previewText: `Your booking for ${toolName} starts on ${startDate}.`,
    children: `
      <p>Hi ${customerName},</p>
      <p>Just a quick reminder that your booking <strong>${bookingRef}</strong> for <strong>${toolName}</strong> starts tomorrow (${startDate}).</p>

      <p style="margin:0 0 6px 0;">${whereLine}</p>
      <p style="margin:0 0 6px 0;"><strong>Balance due:</strong> ${
        balanceDue > 0 ? formatTT(balanceDue) : "TT$0.00 (fully paid)"
      }</p>

      <p style="margin:12px 0 8px 0;"><strong>What to bring:</strong></p>
      <ul style="margin:0 0 12px 18px;padding:0;font-size:14px;">
        <li>Valid photo ID (same name as booking)</li>
        ${
          balanceDue > 0
            ? "<li>Payment method for any remaining balance (cash or as arranged)</li>"
            : ""
        }
        <li>Any safety gear required for the tool (e.g. boots, gloves, eye protection)</li>
      </ul>

      ${
        manageUrl
          ? `<p style="margin:16px 0 0 0;">
              <a href=\"${manageUrl}\" class=\"btn\">View booking</a>
            </p>`
          : ""
      }

      <p style="margin-top:18px;">If your plans change, please let us know as soon as possible so we can adjust your booking.</p>
    `,
  });

  const text = [
    `Hi ${customerName},`,
    ``,
    `Reminder: your booking ${bookingRef} for ${toolName} starts tomorrow (${startDate}).`,
    ``,
    whereLine,
    `Balance due: ${
      balanceDue > 0 ? formatTT(balanceDue) : "TT$0.00 (fully paid)"
    }`,
    ``,
    `What to bring:`,
    `- Valid photo ID`,
    balanceDue > 0
      ? `- Payment method for remaining balance (cash or as arranged)`
      : ``,
    `- Any safety gear needed for the tool`,
    ``,
    manageUrl ? `View booking: ${manageUrl}` : ``,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

