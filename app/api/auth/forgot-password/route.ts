import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateEmail } from "@/lib/validations/auth";
import {
  countRecentResetRequests,
  generateResetToken,
} from "@/lib/auth/password-reset";
import { sendPasswordResetEmail, sendAdminAlertEmail } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { email } = body as { email?: string };

  const genericMessage =
    "If an account exists for this email, we'll send instructions to reset your password.";

  if (!email?.trim()) {
    return NextResponse.json({ message: genericMessage });
  }

  const emailLower = email.trim().toLowerCase();
  if (!validateEmail(emailLower)) {
    // Still return success to avoid leaking whether email is valid/exists
    return NextResponse.json({ message: genericMessage });
  }

  const user = await prisma.user.findUnique({
    where: { email: emailLower },
  });

  // Always act as if successful, but only proceed if user exists
  if (!user) {
    console.info("[password-reset] Request for non-existent email", { email: emailLower });
    return NextResponse.json({ message: genericMessage });
  }

  const recentCount = await countRecentResetRequests(emailLower, 60);
  if (recentCount >= 3) {
    console.warn("[password-reset] Rate limited", { email: emailLower });
    return NextResponse.json({ message: genericMessage });
  }

  const token = await generateResetToken(emailLower);
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000";
  const resetUrl = `${baseUrl.replace(/\/+$/, "")}/reset-password/${token}`;

  await sendPasswordResetEmail(user.email, user.name, {
    name: user.name,
    resetUrl,
    expiresMinutes: 60,
  });

  await sendAdminAlertEmail(
    "Password reset requested",
    `Password reset requested for ${user.email} at ${new Date().toISOString()}`
  );

  return NextResponse.json({ message: genericMessage });
}

