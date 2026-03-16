import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAdminToolsList } from "@/lib/data/admin-tools";
import type { ToolStatus } from "@prisma/client";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const status = (searchParams.get("status") as ToolStatus | null) ?? undefined;
  const ownerId = searchParams.get("ownerId") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  const list = await getAdminToolsList({
    categoryId,
    status,
    ownerId,
    search,
  });
  return NextResponse.json(list);
}
