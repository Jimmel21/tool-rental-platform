import crypto from "crypto";
import { prisma } from "@/lib/db";

const RESET_TOKEN_EXPIRY_MINUTES = 60;

export async function generateResetToken(email: string): Promise<string> {
  const normalizedEmail = email.trim().toLowerCase();
  const token = crypto.randomBytes(32).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      email: normalizedEmail,
      token,
      expiresAt,
    },
  });

  console.info("[password-reset] Token created", {
    email: normalizedEmail,
    expiresAt: expiresAt.toISOString(),
  });

  return token;
}

export async function validateResetToken(token: string): Promise<{
  valid: boolean;
  email?: string;
  reason?: string;
}> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!record) {
    return { valid: false, reason: "invalid" };
  }
  if (record.usedAt) {
    return { valid: false, reason: "used" };
  }
  const now = new Date();
  if (record.expiresAt.getTime() < now.getTime()) {
    return { valid: false, reason: "expired" };
  }

  return { valid: true, email: record.email };
}

export async function consumeResetToken(token: string): Promise<void> {
  await prisma.passwordResetToken.update({
    where: { token },
    data: { usedAt: new Date() },
  });
}

export async function countRecentResetRequests(
  email: string,
  windowMinutes = 60
): Promise<number> {
  const normalizedEmail = email.trim().toLowerCase();
  const since = new Date(Date.now() - windowMinutes * 60 * 1000);
  return prisma.passwordResetToken.count({
    where: {
      email: normalizedEmail,
      createdAt: { gte: since },
    },
  });
}

