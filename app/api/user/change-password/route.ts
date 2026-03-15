import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { compare, hash } from "bcrypt";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { validatePassword } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { currentPassword, newPassword } = body as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "currentPassword and newPassword are required" },
      { status: 400 }
    );
  }

  const pv = validatePassword(newPassword);
  if (!pv.valid) {
    return NextResponse.json({ error: pv.message }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user?.password) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const match = await compare(currentPassword, user.password);
  if (!match) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  const hashed = await hash(newPassword, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  });

  return NextResponse.json({ success: true, message: "Password updated" });
}
