import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAdminPayments } from "@/lib/data/admin-payments";
import type { PaymentMethod, PaymentStatus } from "@prisma/client";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const method = (searchParams.get("method") as PaymentMethod | null) ?? undefined;
  const status = (searchParams.get("status") as PaymentStatus | null) ?? undefined;
  const dateFrom = searchParams.get("dateFrom") ?? undefined;
  const dateTo = searchParams.get("dateTo") ?? undefined;

  const list = await getAdminPayments({ method, status, dateFrom, dateTo });
  return NextResponse.json(list);
}
