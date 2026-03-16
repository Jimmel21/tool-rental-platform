import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminToolDetail } from "@/lib/data/admin-tools";
import { getCategories } from "@/lib/data/categories";
import { prisma } from "@/lib/db";
import { ToolForm } from "@/app/(admin)/admin/tools/ToolForm";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminEditToolPage({ params }: PageProps) {
  const { id } = await params;
  const [tool, categories, partners] = await Promise.all([
    getAdminToolDetail(id),
    getCategories(),
    prisma.user.findMany({
      where: { role: "PARTNER" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!tool) notFound();

  return (
    <div>
      <Link href={`/admin/tools/${id}`} className="text-sm font-medium text-gray-600 hover:text-gray-900">
        ← {tool.name}
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">Edit tool</h1>
      <p className="mt-1 text-gray-600">{tool.name}</p>
      <ToolForm
        initial={{
          id: tool.id,
          name: tool.name,
          description: tool.description,
          categoryId: tool.categoryId,
          brand: tool.brand,
          model: tool.model,
          dailyRate: tool.dailyRate,
          weeklyRate: tool.weeklyRate,
          depositAmount: tool.depositAmount,
          images: tool.images,
          status: tool.status,
          ownerId: tool.ownerId,
          conditionNotes: tool.conditionNotes,
          gpsTrackerId: tool.gpsTrackerId,
          nextMaintenanceAt: tool.nextMaintenanceAt,
          maintenanceNotes: tool.maintenanceNotes,
        }}
        categories={categories}
        partners={partners}
      />
    </div>
  );
}
