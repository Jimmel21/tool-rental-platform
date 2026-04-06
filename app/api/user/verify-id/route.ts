import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const VALID_ID_TYPES = ["National ID", "Passport", "Driver's Permit"] as const;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Already verified — no need to resubmit
  const existing = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { idVerified: true },
  });
  if (existing?.idVerified) {
    return NextResponse.json({ error: "ID already verified" }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const idType = (formData.get("idType") as string | null)?.trim();
  const idNumber = (formData.get("idNumber") as string | null)?.trim();
  const file = formData.get("document") as File | null;

  if (!idType || !VALID_ID_TYPES.includes(idType as (typeof VALID_ID_TYPES)[number])) {
    return NextResponse.json({ error: "Invalid ID type" }, { status: 400 });
  }
  if (!idNumber || idNumber.length < 3) {
    return NextResponse.json({ error: "ID number is required" }, { status: 400 });
  }
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "Document file is required" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File must be under 5 MB" }, { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "File must be a JPG, PNG, WebP image or PDF" },
      { status: 400 }
    );
  }

  // Write file to /public/uploads/id/{userId}.{ext}
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "id");
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${session.user.id}.${ext}`;
  const filePath = path.join(uploadsDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const documentPath = `/uploads/id/${filename}`;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      idType,
      idNumber,
      idDocumentPath: documentPath,
      // Reset verified flag in case they're resubmitting after a rejection
      idVerified: false,
    },
  });

  return NextResponse.json({ success: true, documentPath });
}
