/**
 * Trinidad & Tobago delivery zones — backed by the DeliveryZone database table.
 * Use getDeliveryZones() / getDeliveryFeeByZone() / getDeliveryZoneName() in
 * server contexts (API routes, Server Components).
 * Pass the zones array as a prop to client components (e.g. BookingForm).
 */
import { prisma } from "@/lib/db";

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  estimatedDays: number;
  active: boolean;
}

export async function getDeliveryZones(): Promise<DeliveryZone[]> {
  const rows = await prisma.deliveryZone.findMany({
    where: { active: true },
    orderBy: { id: "asc" },
  });
  return rows.map((r) => ({ ...r, fee: Number(r.fee) }));
}

export async function getDeliveryFeeByZone(zoneId: string): Promise<number> {
  const row = await prisma.deliveryZone.findUnique({ where: { id: zoneId } });
  return row ? Number(row.fee) : 0;
}

export async function getDeliveryZoneName(zoneId: string): Promise<string> {
  const row = await prisma.deliveryZone.findUnique({ where: { id: zoneId } });
  return row?.name ?? zoneId;
}
