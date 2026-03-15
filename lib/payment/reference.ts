/**
 * Generate a unique bank transfer reference (e.g. BT-TTRP-XXXXX)
 */
export function generateBankTransferReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BT-TTRP-${suffix}`;
}
