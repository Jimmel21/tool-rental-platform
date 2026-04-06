import crypto from "crypto";

const WIPAY_ACCOUNT_NUMBER = process.env.WIPAY_ACCOUNT_NUMBER ?? "";
const WIPAY_API_KEY = process.env.WIPAY_API_KEY ?? "";
const WIPAY_BASE_URL =
  process.env.WIPAY_BASE_URL ?? "https://checkout.wipay.co.tt";

export interface WiPayCheckoutOptions {
  /** Your internal order/transaction reference (stored as transactionRef in DB) */
  orderId: string;
  /** Amount as a decimal string, e.g. "150.00" */
  total: string;
  /** ISO currency code — defaults to "TTD" */
  currency?: string;
  /** Full URL WiPay will POST the result to (your webhook endpoint) */
  responseUrl: string;
  /** Full URL of your site (shown on WiPay hosted page) */
  originUrl: string;
}

/**
 * Build the HMAC-SHA256 signature for a WiPay checkout request.
 *
 * Signed payload (order matters):
 *   account_number + api_key + currency + order_id + total
 */
export function buildWiPaySignature(
  orderId: string,
  total: string,
  currency: string
): string {
  const payload = `${WIPAY_ACCOUNT_NUMBER}${WIPAY_API_KEY}${currency}${orderId}${total}`;
  return crypto.createHmac("sha256", WIPAY_API_KEY).update(payload).digest("hex");
}

/**
 * Build the WiPay hosted-checkout redirect URL.
 * Redirect the customer's browser to this URL to start the card payment flow.
 */
export function buildWiPayCheckoutUrl(opts: WiPayCheckoutOptions): string {
  const currency = opts.currency ?? "TTD";
  const hash = buildWiPaySignature(opts.orderId, opts.total, currency);

  const params = new URLSearchParams({
    account_number: WIPAY_ACCOUNT_NUMBER,
    avs: "0",
    currency,
    environment: process.env.NODE_ENV === "production" ? "live" : "sandbox",
    fee_structure: "merchant_absorb",
    method: "credit_card",
    order_id: opts.orderId,
    origin: opts.originUrl,
    response_url: opts.responseUrl,
    total: opts.total,
    hash,
  });

  return `${WIPAY_BASE_URL}/checkout?${params.toString()}`;
}

/**
 * Verify the HMAC-SHA256 signature on an incoming WiPay webhook POST.
 *
 * WiPay signs the response with:
 *   account_number + api_key + currency + order_id + total + status + payment_gateway_id
 *
 * Returns true if the signature is valid, false otherwise.
 */
export function verifyWiPayWebhook(
  body: Record<string, string | undefined>
): boolean {
  const {
    order_id,
    total,
    currency = "TTD",
    status,
    payment_gateway_id = "",
    hash,
  } = body;

  if (!hash || !order_id || !total || !status) return false;

  const payload = `${WIPAY_ACCOUNT_NUMBER}${WIPAY_API_KEY}${currency}${order_id}${total}${status}${payment_gateway_id}`;
  const expected = crypto
    .createHmac("sha256", WIPAY_API_KEY)
    .update(payload)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(hash, "utf8"),
      Buffer.from(expected, "utf8")
    );
  } catch {
    return false;
  }
}

/** Generate a unique WiPay order reference, e.g. WP-TTRP-A3X9KZ */
export function generateWiPayReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `WP-TTRP-${suffix}`;
}

export function isWiPayConfigured(): boolean {
  return Boolean(WIPAY_ACCOUNT_NUMBER && WIPAY_API_KEY);
}
