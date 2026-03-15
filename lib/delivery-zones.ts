/**
 * Trinidad & Tobago delivery zones and fees (TTD)
 */
export const DELIVERY_ZONES = [
  { id: "north", name: "North", fee: 75 },
  { id: "central", name: "Central", fee: 50 },
  { id: "south", name: "South", fee: 100 },
  { id: "tobago", name: "Tobago", fee: 200 },
] as const;

export type DeliveryZoneId = (typeof DELIVERY_ZONES)[number]["id"];

export function getDeliveryFeeByZone(zoneId: string): number {
  const zone = DELIVERY_ZONES.find((z) => z.id === zoneId);
  return zone?.fee ?? 0;
}

export function getDeliveryZoneName(zoneId: string): string {
  const zone = DELIVERY_ZONES.find((z) => z.id === zoneId);
  return zone?.name ?? zoneId;
}
