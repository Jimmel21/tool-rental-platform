import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const VALID_STATUSES = ["AVAILABLE", "RENTED", "MAINTENANCE", "RETIRED"] as const;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { toolIds, status } = body as { toolIds?: string[]; status?: string };

  if (!Array.isArray(toolIds) || toolIds.length === 0 || !VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
    return NextResponse.json(
      { error: "toolIds (array) and status (AVAILABLE|RENTED|MAINTENANCE|RETIRED) required" },
      { status: 400 }
    );
  }

  await prisma.tool.updateMany({
    where: { id: { in: toolIds } },
    data: { status: status as typeof VALID_STATUSES[number] },
  });

  return NextResponse.json({ success: true, updated: toolIds.length });
}
