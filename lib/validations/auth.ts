export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" };
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" };
  }
  return { valid: true };
}

export function validatePhoneTT(phone: string): boolean {
  const digitsOnly = phone.replace(/\D/g, "");
  // Trinidad: 1 + 868 + 7 digits = 11 digits, or 868 + 7 = 10 digits
  if (digitsOnly.length === 10 && digitsOnly.startsWith("868")) return true;
  if (digitsOnly.length === 11 && digitsOnly.startsWith("1868")) return true;
  return false;
}

export function normalizePhoneTT(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length === 10 && digits.startsWith("868")) return `+1${digits}`;
  return phone;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
