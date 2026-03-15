import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { name, phone, address } = body as {
    name?: string;
    phone?: string | null;
    address?: string | null;
  };

  const data: { name?: string; phone?: string | null; address?: string | null } = {};
  if (typeof name === "string" && name.trim()) data.name = name.trim();
  if (phone !== undefined) data.phone = typeof phone === "string" ? phone.trim() || null : null;
  if (address !== undefined) data.address = typeof address === "string" ? address.trim() || null : null;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
  });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    phone: user.phone,
    address: user.address,
  });
}
