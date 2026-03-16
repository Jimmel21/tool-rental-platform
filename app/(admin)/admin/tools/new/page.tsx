import Link from "next/link";
import { getCategories } from "@/lib/data/categories";
import { prisma } from "@/lib/db";
import { ToolForm } from "@/app/(admin)/admin/tools/ToolForm";

export const dynamic = "force-dynamic";

export default async function AdminNewToolPage() {
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
      <Link href="/admin/tools" className="text-sm font-medium text-gray-600 hover:text-gray-900">
        ← Tools
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">Add tool</h1>
      <p className="mt-1 text-gray-600">Create a new tool listing.</p>
      <ToolForm
        initial={null}
        categories={categories}
        partners={partners}
      />
    </div>
  );
}
