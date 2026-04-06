import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DeliveryZonesClient } from "./DeliveryZonesClient";

export const dynamic = "force-dynamic";

export default async function DeliveryZonesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/login");
  }

  const zones = await prisma.deliveryZone.findMany({ orderBy: { id: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Zones</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage delivery fees and estimated lead times for each zone.
          </p>
        </div>
      </div>
      <DeliveryZonesClient
        zones={zones.map((z) => ({
          id: z.id,
          name: z.name,
          fee: Number(z.fee),
          estimatedDays: z.estimatedDays,
          active: z.active,
        }))}
      />
    </div>
  );
}
