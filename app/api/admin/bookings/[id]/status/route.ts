import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { BookingStatus } from "@prisma/client";

const VALID: BookingStatus[] = ["PENDING", "CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { status } = body as { status?: string };

  if (!status || !VALID.includes(status as BookingStatus)) {
    return NextResponse.json(
      { error: "status must be one of: PENDING, CONFIRMED, ACTIVE, COMPLETED, CANCELLED" },
      { status: 400 }
    );
  }

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  await prisma.booking.update({
    where: { id },
    data: { status: status as BookingStatus },
  });

  return NextResponse.json({ success: true, status });
}
