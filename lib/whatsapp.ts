/**
 * WhatsApp click-to-chat for T&T market.
 * Phone format: +1868 XXXXXXX — store in env as 1868XXXXXXX (no spaces, no +).
 */

const DEFAULT_NUMBER = "18681234567";

/** E.164-style number for wa.me (digits only, no +). T&T: 1868 + 7 digits. */
function getWhatsAppNumber(): string {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? DEFAULT_NUMBER;
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 10 ? digits : DEFAULT_NUMBER;
}

/**
 * Build WhatsApp click-to-chat URL.
 * @param message - Optional pre-filled message (URL-encoded internally).
 * @returns Full wa.me link.
 */
export function getWhatsAppUrl(message?: string): string {
  let num = getWhatsAppNumber();
  if (!num.startsWith("1")) num = `1${num}`;
  const base = `https://wa.me/${num}`;
  if (message?.trim()) {
    return `${base}?text=${encodeURIComponent(message.trim())}`;
  }
  return base;
}

/** Pre-filled message: interested in renting a tool. */
export function whatsAppMessageToolInterest(toolName: string): string {
  return `Hi, I'm interested in renting ${toolName}`;
}

/** Pre-filled message: question about a booking. */
export function whatsAppMessageBookingQuestion(bookingReference: string): string {
  return `Hi, I have a question about booking #${bookingReference}`;
}

/** Pre-filled message: general inquiry. */
export function whatsAppMessageGeneral(): string {
  return "Hi, I'd like to inquire about tool rentals";
}
