/**
 * WhatsApp notification message templates (for manual send or future Business API).
 * Use with getWhatsAppUrl(template) for "Send via WhatsApp" in admin.
 */

export type WhatsAppTemplateId =
  | "booking_confirmation"
  | "payment_received"
  | "rental_starting_tomorrow"
  | "return_reminder"
  | "return_overdue";

export interface TemplateContext {
  bookingReference: string;
  customerName?: string;
  toolName?: string;
  startDate?: string;
  endDate?: string;
  amount?: string;
}

function fmt(str: string, ctx: TemplateContext): string {
  return str
    .replace(/\{bookingReference\}/g, ctx.bookingReference)
    .replace(/\{customerName\}/g, ctx.customerName ?? "Customer")
    .replace(/\{toolName\}/g, ctx.toolName ?? "your tool")
    .replace(/\{startDate\}/g, ctx.startDate ?? "")
    .replace(/\{endDate\}/g, ctx.endDate ?? "")
    .replace(/\{amount\}/g, ctx.amount ?? "");
}

/** Booking confirmed (after payment/confirmation). */
export function templateBookingConfirmation(ctx: TemplateContext): string {
  return fmt(
    "Hi {customerName}! Your booking #{bookingReference} is confirmed. Tool: {toolName}. Dates: {startDate} to {endDate}. We'll be in touch about pickup/delivery.",
    ctx
  );
}

/** Payment received. */
export function templatePaymentReceived(ctx: TemplateContext): string {
  return fmt(
    "Hi {customerName}! We've received your payment of {amount} TTD for booking #{bookingReference}. Your booking is confirmed. Tool: {toolName}. Dates: {startDate} to {endDate}.",
    ctx
  );
}

/** Rental starting tomorrow reminder. */
export function templateRentalStartingTomorrow(ctx: TemplateContext): string {
  return fmt(
    "Hi {customerName}! Reminder: your rental for {toolName} (booking #{bookingReference}) starts tomorrow ({startDate}). Please ensure pickup/delivery arrangements are set.",
    ctx
  );
}

/** Return reminder (e.g. day before end date). */
export function templateReturnReminder(ctx: TemplateContext): string {
  return fmt(
    "Hi {customerName}! Friendly reminder: please return {toolName} by {endDate} (booking #{bookingReference}). Contact us if you need to extend.",
    ctx
  );
}

/** Return overdue alert. */
export function templateReturnOverdue(ctx: TemplateContext): string {
  return fmt(
    "Hi {customerName}! Your rental for {toolName} (booking #{bookingReference}) was due on {endDate} and is now overdue. Please return the tool as soon as possible or contact us to arrange an extension.",
    ctx
  );
}

const BUILDERS: Record<WhatsAppTemplateId, (ctx: TemplateContext) => string> = {
  booking_confirmation: templateBookingConfirmation,
  payment_received: templatePaymentReceived,
  rental_starting_tomorrow: templateRentalStartingTomorrow,
  return_reminder: templateReturnReminder,
  return_overdue: templateReturnOverdue,
};

export function getWhatsAppTemplateMessage(
  id: WhatsAppTemplateId,
  context: TemplateContext
): string {
  return BUILDERS[id](context);
}
