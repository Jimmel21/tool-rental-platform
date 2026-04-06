import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendBookingReminderEmail, sendBookingCompletedEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(request: Request) {
  // Verify CRON_SECRET
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron] CRON_SECRET is not set");
    return unauthorized();
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return unauthorized();
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const siteUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const results = { activated: 0, completed: 0, errors: [] as string[] };

  // ── 1. PENDING bookings whose start date has arrived → ACTIVE ──────────────
  const pendingToActivate = await prisma.booking.findMany({
    where: {
      status: "PENDING",
      startDate: { lte: today },
    },
    include: {
      customer: { select: { name: true, email: true } },
      tool: { select: { name: true, slug: true } },
    },
  });

  for (const booking of pendingToActivate) {
    try {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "ACTIVE" },
      });

      await sendBookingReminderEmail(booking.customer.email, booking.customer.name, {
        customerName: booking.customer.name,
        bookingRef: booking.id.slice(0, 8).toUpperCase(),
        toolName: booking.tool.name,
        startDate: booking.startDate.toISOString().slice(0, 10),
        deliveryOption: booking.deliveryOption as "PICKUP" | "DELIVERY",
        balanceDue: Number(booking.balanceDue),
        manageUrl: `${siteUrl}/dashboard/bookings/${booking.id}`,
      });

      results.activated += 1;
      console.info(`[cron] Activated booking ${booking.id}`);
    } catch (err) {
      const msg = `Failed to activate booking ${booking.id}: ${err instanceof Error ? err.message : String(err)}`;
      console.error(`[cron] ${msg}`);
      results.errors.push(msg);
    }
  }

  // ── 2. ACTIVE bookings whose end date has passed → COMPLETED ───────────────
  const activeToComplete = await prisma.booking.findMany({
    where: {
      status: "ACTIVE",
      endDate: { lt: today },
    },
    include: {
      customer: { select: { name: true, email: true } },
      tool: { select: { name: true, slug: true } },
    },
  });

  for (const booking of activeToComplete) {
    try {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "COMPLETED" },
      });

      await sendBookingCompletedEmail(booking.customer.email, booking.customer.name, {
        customerName: booking.customer.name,
        bookingRef: booking.id.slice(0, 8).toUpperCase(),
        toolName: booking.tool.name,
        depositReleased: booking.depositStatus === "RELEASED",
        reviewUrl: `${siteUrl}/tools/${booking.tool.slug}`,
      });

      results.completed += 1;
      console.info(`[cron] Completed booking ${booking.id}`);
    } catch (err) {
      const msg = `Failed to complete booking ${booking.id}: ${err instanceof Error ? err.message : String(err)}`;
      console.error(`[cron] ${msg}`);
      results.errors.push(msg);
    }
  }

  console.info(
    `[cron] booking-lifecycle done — activated=${results.activated} completed=${results.completed} errors=${results.errors.length}`
  );

  return NextResponse.json({
    ok: true,
    activated: results.activated,
    completed: results.completed,
    errors: results.errors,
  });
}
