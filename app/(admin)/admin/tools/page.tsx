import Link from "next/link";
import { getCategories } from "@/lib/data/categories";
import { prisma } from "@/lib/db";
import { AdminToolsClient } from "@/app/(admin)/admin/tools/AdminToolsClient";

export const dynamic = "force-dynamic";

export default async function AdminToolsPage() {
  const [categories, partners] = await Promise.all([
    getCategories(),
    prisma.user.findMany({
      where: { role: "PARTNER" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tools</h1>
        <Link
          href="/admin/tools/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          Add tool
        </Link>
      </div>
      <p className="mt-1 text-gray-600">Manage inventory and pricing.</p>
      <AdminToolsClient categories={categories} partners={partners} />
    </div>
  );
}
