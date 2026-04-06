import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { VerificationsClient } from "./VerificationsClient";

export const dynamic = "force-dynamic";

export default async function VerificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/");

  // Users who have submitted ID details but are not yet verified
  const pending = await prisma.user.findMany({
    where: {
      idType: { not: null },
      idNumber: { not: null },
      idVerified: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      idType: true,
      idNumber: true,
      idDocumentPath: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const users = pending.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    idType: u.idType!,
    idNumber: u.idNumber!,
    idDocumentPath: u.idDocumentPath,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ID Verifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            {users.length} pending review
          </p>
        </div>
      </div>

      <VerificationsClient users={users} />
    </div>
  );
}
