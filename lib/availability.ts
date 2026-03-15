import { prisma } from "@/lib/db";

/**
 * Check if a tool has any overlapping confirmed/active bookings for the given date range.
 */
export async function isToolAvailable(
  toolId: string,
  startDate: Date,
  endDate: Date,
  excludeBookingId?: string
): Promise<boolean> {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const overlapping = await prisma.booking.findFirst({
    where: {
      toolId,
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      status: { in: ["PENDING", "CONFIRMED", "ACTIVE"] },
      OR: [
        { startDate: { lte: end }, endDate: { gte: start } },
      ],
    },
  });

  return !overlapping;
}
