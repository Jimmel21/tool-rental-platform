import { Container } from "@/components/layout/Container";
import { getCategories } from "@/lib/data/categories";
import { getToolsList } from "@/lib/data/tools";
import { ToolsBrowseClient } from "./ToolsBrowseClient";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    startDate?: string;
    endDate?: string;
    sort?: string;
    page?: string;
    search?: string;
    q?: string;
  }>;
}

export default async function ToolsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const search = params.search?.trim() ?? params.q?.trim();

  const minPrice = params.minPrice ? parseInt(params.minPrice, 10) : undefined;
  const maxPrice = params.maxPrice ? parseInt(params.maxPrice, 10) : undefined;

  const [categories, data] = await Promise.all([
    getCategories(),
    getToolsList({
      page,
      limit: 12,
      categorySlug: params.category ?? undefined,
      minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
      sort:
        params.sort === "price-asc"
          ? "price-asc"
          : params.sort === "price-desc"
            ? "price-desc"
            : "popular",
      search: search ?? undefined,
    }),
  ]);

  return (
    <div className="py-8">
      <Container>
        <h1 className="text-3xl font-bold text-gray-900">Browse tools</h1>
        <p className="mt-1 text-gray-600">
          Filter and sort to find the right equipment
        </p>
        <ToolsBrowseClient
          categories={categories}
          initialItems={data.items}
          initialTotal={data.total}
          initialPage={data.page}
          initialTotalPages={data.totalPages}
          initialParams={{
            category: params.category,
            minPrice: params.minPrice ?? "",
            maxPrice: params.maxPrice ?? "",
            startDate: params.startDate ?? "",
            endDate: params.endDate ?? "",
            sort: params.sort ?? "popular",
            search: search ?? undefined,
          }}
        />
      </Container>
    </div>
  );
}
