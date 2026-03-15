import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { validateBookingDates, getRentalDays } from "@/lib/booking-validation";
import { isToolAvailable } from "@/lib/availability";
import { getDeliveryFeeByZone } from "@/lib/delivery-zones";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      toolId,
      startDate: startStr,
      endDate: endStr,
      deliveryOption,
      deliveryAddress,
      deliveryZone,
      notes,
    } = body as {
      toolId: string;
      startDate: string;
      endDate: string;
      deliveryOption: "PICKUP" | "DELIVERY";
      deliveryAddress?: string;
      deliveryZone?: string;
      notes?: string;
    };

    if (!toolId || !startStr || !endStr || !deliveryOption) {
      return NextResponse.json(
        { error: "toolId, startDate, endDate, and deliveryOption are required" },
        { status: 400 }
      );
    }

    const startDate = new Date(startStr);
    const endDate = new Date(endStr);

    const dateValidation = validateBookingDates(startDate, endDate);
    if (!dateValidation.valid) {
      return NextResponse.json({ error: dateValidation.error }, { status: 400 });
    }

    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
    });
    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    const available = await isToolAvailable(tool.id, startDate, endDate);
    if (!available) {
      return NextResponse.json(
        { error: "Tool is not available for the selected dates" },
        { status: 409 }
      );
    }

    const dailyRate = Number(tool.dailyRate);
    const depositAmount = Number(tool.depositAmount);
    const days = getRentalDays(startDate, endDate);
    const rentalSubtotal = days * dailyRate;
    const deliveryFee =
      deliveryOption === "DELIVERY" && deliveryZone
        ? getDeliveryFeeByZone(deliveryZone)
        : 0;
    const totalAmount = rentalSubtotal + depositAmount + deliveryFee;

    const booking = await prisma.booking.create({
      data: {
        toolId: tool.id,
        customerId: session.user.id,
        startDate,
        endDate,
        status: "PENDING",
        totalAmount,
        depositPaid: 0,
        balanceDue: totalAmount,
        deliveryOption,
        deliveryAddress: deliveryOption === "DELIVERY" ? deliveryAddress ?? null : null,
        deliveryFee: deliveryOption === "DELIVERY" ? deliveryFee : null,
        notes: notes ?? null,
      },
      include: {
        tool: { select: { name: true, slug: true } },
      },
    });

    return NextResponse.json({
      id: booking.id,
      reference: booking.id.slice(0, 8).toUpperCase(),
      startDate: booking.startDate.toISOString().slice(0, 10),
      endDate: booking.endDate.toISOString().slice(0, 10),
      totalAmount: Number(booking.totalAmount),
      tool: booking.tool,
    });
  } catch (e) {
    console.error("Create booking error:", e);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
