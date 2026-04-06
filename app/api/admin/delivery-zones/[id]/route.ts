import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as { role?: string }).role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: { fee?: number; estimatedDays?: number; active?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { fee, estimatedDays, active } = body;

  if (fee !== undefined && (typeof fee !== "number" || fee < 0)) {
    return NextResponse.json({ error: "Invalid fee" }, { status: 400 });
  }
  if (estimatedDays !== undefined && (!Number.isInteger(estimatedDays) || estimatedDays < 1)) {
    return NextResponse.json({ error: "Invalid estimatedDays" }, { status: 400 });
  }
  if (active !== undefined && typeof active !== "boolean") {
    return NextResponse.json({ error: "Invalid active value" }, { status: 400 });
  }

  const existing = await prisma.deliveryZone.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Zone not found" }, { status: 404 });
  }

  const updated = await prisma.deliveryZone.update({
    where: { id },
    data: {
      ...(fee !== undefined && { fee }),
      ...(estimatedDays !== undefined && { estimatedDays }),
      ...(active !== undefined && { active }),
    },
  });

  return NextResponse.json(updated);
}
