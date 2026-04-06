/**
 * Legacy webhook path — delegates to the canonical WiPay handler.
 * Kept for backwards compatibility; configure WiPay to use /api/payments/webhook.
 */
export { POST } from "@/app/api/payments/webhook/route";
