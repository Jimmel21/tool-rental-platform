/**
 * TTD (Trinidad & Tobago Dollar) currency formatting
 * ISO 4217: TTD, Symbol: TT$
 */

const TTD_LOCALE = "en-TT";
const TTD_CURRENCY = "TTD";

/**
 * Format a number as TTD currency (e.g. "TT$1,234.56")
 */
export function formatTTD(amount: number): string {
  return new Intl.NumberFormat(TTD_LOCALE, {
    style: "currency",
    currency: TTD_CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number as TTD without symbol (e.g. "1,234.56")
 */
export function formatTTDNumber(amount: number): string {
  return new Intl.NumberFormat(TTD_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Parse a TTD currency string or number to number (for forms/inputs)
 */
export function parseTTD(value: string | number): number {
  if (typeof value === "number") return value;
  const cleaned = value.replace(/[^0-9.-]/g, "");
  return parseFloat(cleaned) || 0;
}
