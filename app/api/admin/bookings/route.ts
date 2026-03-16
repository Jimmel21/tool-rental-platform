import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAdminBookings } from "@/lib/data/admin-bookings";
import type { BookingStatus } from "@prisma/client";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = (searchParams.get("status") as BookingStatus | null) ?? undefined;
  const dateFrom = searchParams.get("dateFrom") ?? undefined;
  const dateTo = searchParams.get("dateTo") ?? undefined;
  const paymentStatus = searchParams.get("paymentStatus") as "paid" | "partial" | "pending" | null ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  const list = await getAdminBookings({
    status,
    dateFrom,
    dateTo,
    paymentStatus,
    search,
  });
  return NextResponse.json(list);
}
