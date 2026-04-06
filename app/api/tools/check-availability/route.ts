import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateBookingDates, getRentalDays } from "@/lib/booking-validation";
import { isToolAvailable } from "@/lib/availability";
import { getDeliveryFeeByZone } from "@/lib/delivery-zones";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { toolId, slug, startDate: startStr, endDate: endStr, deliveryZone } = body as {
      toolId?: string;
      slug?: string;
      startDate?: string;
      endDate?: string;
      deliveryZone?: string;
    };

    if (!startStr || !endStr) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    const startDate = new Date(startStr);
    const endDate = new Date(endStr);

    const dateValidation = validateBookingDates(startDate, endDate);
    if (!dateValidation.valid) {
      return NextResponse.json(
        { error: dateValidation.error, available: false },
        { status: 400 }
      );
    }

    let tool: { id: string; dailyRate: { toNumber?: () => number }; depositAmount: { toNumber?: () => number } } | null = null;
    if (toolId) {
      tool = await prisma.tool.findUnique({
        where: { id: toolId },
        select: { id: true, dailyRate: true, depositAmount: true },
      });
    } else if (slug) {
      tool = await prisma.tool.findUnique({
        where: { slug },
        select: { id: true, dailyRate: true, depositAmount: true },
      });
    }

    if (!tool) {
      return NextResponse.json({ error: "Tool not found", available: false }, { status: 404 });
    }

    const available = await isToolAvailable(tool.id, startDate, endDate);
    const dailyRate = Number(tool.dailyRate);
    const depositAmount = Number(tool.depositAmount);
    const days = getRentalDays(startDate, endDate);
    const rentalSubtotal = days * dailyRate;
    const deliveryFee = deliveryZone ? await getDeliveryFeeByZone(deliveryZone) : 0;
    const total = rentalSubtotal + depositAmount + deliveryFee;

    return NextResponse.json({
      available,
      toolId: tool.id,
      days,
      dailyRate,
      rentalSubtotal,
      depositAmount,
      deliveryFee,
      total,
      startDate: startDate.toISOString().slice(0, 10),
      endDate: endDate.toISOString().slice(0, 10),
    });
  } catch (e) {
    console.error("Check availability error:", e);
    return NextResponse.json(
      { error: "Something went wrong", available: false },
      { status: 500 }
    );
  }
}
