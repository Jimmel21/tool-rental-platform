import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { getCategories } from "@/lib/data/categories";
import { getToolsList } from "@/lib/data/tools";
import { SearchPageClient } from "./SearchPageClient";

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const [categories, data] = await Promise.all([
    getCategories(),
    q ? getToolsList({ page, limit: 12, search: q, sort: "popular" }) : { items: [], total: 0, page: 1, totalPages: 0, perPage: 12 },
  ]);

  return (
    <div className="py-8">
      <Container>
        <h1 className="text-3xl font-bold text-gray-900">Search tools</h1>
        <Suspense fallback={<div className="mt-4 h-12 animate-pulse rounded bg-gray-200" />}>
          <SearchPageClient
            initialQuery={q}
            initialItems={data.items}
            initialTotal={data.total}
            initialPage={data.page}
            initialTotalPages={data.totalPages}
            categories={categories}
          />
        </Suspense>
      </Container>
    </div>
  );
}
