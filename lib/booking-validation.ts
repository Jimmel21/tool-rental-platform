const MIN_RENTAL_DAYS = 1;
const MAX_RENTAL_DAYS = 30;
const MIN_HOURS_FROM_NOW = 24;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateBookingDates(
  startDate: Date,
  endDate: Date
): ValidationResult {
  const now = new Date();
  const minStart = new Date(now);
  minStart.setHours(minStart.getHours() + MIN_HOURS_FROM_NOW);
  minStart.setMinutes(0, 0, 0);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  if (start < minStart) {
    return {
      valid: false,
      error: `Start date must be at least ${MIN_HOURS_FROM_NOW} hours from now.`,
    };
  }
  if (end <= start) {
    return { valid: false, error: "End date must be after start date." };
  }
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (days < MIN_RENTAL_DAYS) {
    return { valid: false, error: `Minimum rental is ${MIN_RENTAL_DAYS} day(s).` };
  }
  if (days > MAX_RENTAL_DAYS) {
    return { valid: false, error: `Maximum rental is ${MAX_RENTAL_DAYS} days.` };
  }
  return { valid: true };
}

export function getRentalDays(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}
