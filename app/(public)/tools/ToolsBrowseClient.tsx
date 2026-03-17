"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ToolCard } from "@/components/ui/ToolCard";

interface Category {
  id: string;
  name: string;
  slug: string;
  toolCount?: number;
}

interface ToolItem {
  slug: string;
  name: string;
  description?: string | null;
  dailyRate: number;
  images: string[];
  status: string;
  averageRating?: number | null;
  reviewCount?: number;
  categoryName?: string;
}

interface ToolsBrowseClientProps {
  categories: Category[];
  initialItems: ToolItem[];
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
  initialParams: {
    category?: string;
    minPrice: string;
    maxPrice: string;
    startDate: string;
    endDate: string;
    sort: string;
    search?: string;
  };
}

function buildQuery(params: Record<string, string | undefined>, currentPage?: number) {
  const sp = new URLSearchParams();
  const withPage = currentPage != null ? { ...params, page: String(currentPage) } : params;
  Object.entries(withPage).forEach(([k, v]) => {
    if (v != null && v !== "") sp.set(k, v);
  });
  const q = sp.toString();
  return q ? `?${q}` : "";
}

export function ToolsBrowseClient({
  categories,
  initialItems,
  initialTotal,
  initialPage,
  initialTotalPages,
  initialParams,
}: ToolsBrowseClientProps) {
  const router = useRouter();
  const currentParams = {
    category: initialParams.category ?? "",
    minPrice: initialParams.minPrice ?? "",
    maxPrice: initialParams.maxPrice ?? "",
    startDate: initialParams.startDate ?? "",
    endDate: initialParams.endDate ?? "",
    sort: initialParams.sort ?? "popular",
    search: initialParams.search ?? "",
  };

  const applyFilters = (updates: Partial<typeof currentParams>, resetPage = true) => {
    const next: Record<string, string> = { ...currentParams, ...updates };
    if (resetPage) next.page = "1";
    const q = buildQuery(next);
    router.push(`/tools${q}`);
  };

  return (
    <div className="mt-8 flex flex-col gap-8 lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full shrink-0 lg:w-64">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="font-semibold text-navy">Category</h2>
          <ul className="mt-2 space-y-1">
            <li>
              <Link
                href="/tools"
                className={`block rounded px-2 py-1.5 text-sm ${!currentParams.category ? "font-medium text-navy bg-primary/10 text-primary" : "text-muted hover:text-primary"}`}
              >
                All
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/tools${buildQuery({ ...currentParams, category: c.slug }, 1)}`}
                  className={`block rounded px-2 py-1.5 text-sm ${currentParams.category === c.slug ? "font-medium text-navy bg-primary/10 text-primary" : "text-muted hover:text-primary"}`}
                >
                  {c.name}
                  {c.toolCount != null && (
                    <span className="ml-1 text-muted">({c.toolCount})</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <h2 className="mt-6 font-semibold text-navy">Price range (TT$/day)</h2>
          <form
            className="mt-2 grid grid-cols-[auto,auto,auto,1fr] items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const min = (form.querySelector('[name="minPrice"]') as HTMLInputElement)?.value;
              const max = (form.querySelector('[name="maxPrice"]') as HTMLInputElement)?.value;
              applyFilters({ minPrice: min || undefined, maxPrice: max || undefined });
            }}
          >
            <input
              name="minPrice"
              type="number"
              min={0}
              placeholder="Min"
              defaultValue={currentParams.minPrice}
              className="w-20 rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
            <span className="self-center text-gray-400">–</span>
            <input
              name="maxPrice"
              type="number"
              min={0}
              placeholder="Max"
              defaultValue={currentParams.maxPrice}
              className="w-20 rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
            <button
              type="submit"
              className="justify-self-start rounded bg-primary px-3 py-1.5 text-xs text-white hover:bg-primary/90"
            >
              Apply
            </button>
          </form>

          <h2 className="mt-6 font-semibold text-navy">Availability</h2>
          <form
            className="mt-2 grid grid-cols-[1fr,1fr] items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const start = (form.querySelector('[name="startDate"]') as HTMLInputElement)?.value;
              const end = (form.querySelector('[name="endDate"]') as HTMLInputElement)?.value;
              applyFilters(
                {
                  startDate: start || undefined,
                  endDate: end || undefined,
                },
                true
              );
            }}
          >
            <input
              name="startDate"
              type="date"
              defaultValue={currentParams.startDate}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
            <input
              name="endDate"
              type="date"
              defaultValue={currentParams.endDate}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
            <button
              type="submit"
              className="col-span-2 mt-1 w-full rounded bg-primary px-3 py-1.5 text-xs text-white hover:bg-primary/90"
            >
              Apply dates
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted">
            {initialTotal} tool{initialTotal !== 1 ? "s" : ""} found
          </p>
          <select
            value={currentParams.sort}
            onChange={(e) => applyFilters({ sort: e.target.value })}
            className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-navy"
          >
            <option value="popular">Most popular</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>

        {initialItems.length === 0 ? (
          <div className="mt-12 rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center text-muted">
            No tools match your filters. Try adjusting or{" "}
            <Link href="/tools" className="font-medium text-primary hover:underline">
              clear filters
            </Link>
            .
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {initialItems.map((t) => (
                <ToolCard
                  key={t.slug}
                  slug={t.slug}
                  name={t.name}
                  description={t.description}
                  dailyRate={t.dailyRate}
                  images={t.images}
                  status={t.status as "AVAILABLE" | "RENTED" | "MAINTENANCE" | "RETIRED"}
                  averageRating={t.averageRating}
                  reviewCount={t.reviewCount}
                  categoryName={t.categoryName}
                />
              ))}
            </div>

            {/* Pagination */}
            {initialTotalPages > 1 && (
              <nav className="mt-10 flex justify-center gap-2" aria-label="Pagination">
                {initialPage > 1 && (
                  <Link
                    href={`/tools${buildQuery(currentParams, initialPage - 1)}`}
                    className="rounded border border-primary bg-white px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
                  >
                    Previous
                  </Link>
                )}
                <span className="flex items-center px-4 py-2 text-sm text-muted">
                  Page {initialPage} of {initialTotalPages}
                </span>
                {initialPage < initialTotalPages && (
                  <Link
                    href={`/tools${buildQuery(currentParams, initialPage + 1)}`}
                    className="rounded border border-primary bg-white px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
                  >
                    Next
                  </Link>
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
