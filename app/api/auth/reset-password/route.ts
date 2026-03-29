import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "@/lib/db";
import { validatePassword } from "@/lib/validations/auth";
import {
  consumeResetToken,
  validateResetToken,
} from "@/lib/auth/password-reset";
import { sendAdminAlertEmail } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { token, newPassword } = body as {
    token?: string;
    newPassword?: string;
  };

  if (!token || !newPassword) {
    return NextResponse.json(
      { error: "token and newPassword are required" },
      { status: 400 }
    );
  }

  const validation = await validateResetToken(token);
  if (!validation.valid || !validation.email) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired." },
      { status: 400 }
    );
  }

  const pv = validatePassword(newPassword);
  if (!pv.valid) {
    return NextResponse.json({ error: pv.message }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: validation.email },
  });
  if (!user) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired." },
      { status: 400 }
    );
  }

  const hashed = await hash(newPassword, 12);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    await consumeResetToken(token);
  });

  await sendAdminAlertEmail(
    "Password reset completed",
    `Password reset completed for ${validation.email} at ${new Date().toISOString()}`
  );

  return NextResponse.json({
    success: true,
    message: "Your password has been reset. You can now sign in with your new password.",
  });
}

