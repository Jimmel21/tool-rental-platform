import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { bookingId, rating, comment } = body as {
    bookingId?: string;
    rating?: number;
    comment?: string | null;
  };

  if (!bookingId?.trim()) {
    return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
  }

  const ratingNum = typeof rating === "number" ? rating : parseInt(String(rating), 10);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return NextResponse.json({ error: "rating must be 1–5" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { review: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.customerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (booking.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "You can only review completed bookings" },
      { status: 400 }
    );
  }

  if (booking.review) {
    return NextResponse.json(
      { error: "You have already reviewed this booking" },
      { status: 400 }
    );
  }

  await prisma.review.create({
    data: {
      bookingId: booking.id,
      customerId: session.user.id,
      toolId: booking.toolId,
      rating: ratingNum,
      comment: typeof comment === "string" ? comment.trim() || null : null,
    },
  });

  return NextResponse.json({ success: true, message: "Review submitted" });
}
