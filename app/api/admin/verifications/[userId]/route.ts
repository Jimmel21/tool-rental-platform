import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendIdVerificationEmail } from "@/lib/email";

type Params = { params: Promise<{ userId: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  const body = await request.json().catch(() => ({}));
  const { action, rejectionReason } = body as {
    action?: "approve" | "reject";
    rejectionReason?: string;
  };

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "action must be approve or reject" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, idType: true, idNumber: true, idDocumentPath: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (!user.idType || !user.idNumber) {
    return NextResponse.json({ error: "User has not submitted ID details" }, { status: 400 });
  }

  const siteUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  if (action === "approve") {
    await prisma.user.update({
      where: { id: userId },
      data: { idVerified: true },
    });

    await sendIdVerificationEmail(user.email, user.name, {
      name: user.name,
      approved: true,
      profileUrl: `${siteUrl}/dashboard/profile`,
    });

    return NextResponse.json({ success: true, message: "User verified." });
  }

  // Reject: clear submission so they can resubmit
  await prisma.user.update({
    where: { id: userId },
    data: {
      idVerified: false,
      idType: null,
      idNumber: null,
      idDocumentPath: null,
    },
  });

  await sendIdVerificationEmail(user.email, user.name, {
    name: user.name,
    approved: false,
    rejectionReason: rejectionReason?.trim() || undefined,
    profileUrl: `${siteUrl}/dashboard/profile`,
  });

  return NextResponse.json({ success: true, message: "Submission rejected and cleared." });
}
