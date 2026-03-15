"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ToolCard } from "@/components/ui/ToolCard";

interface Category {
  id: string;
  name: string;
  slug: string;
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

interface SearchPageClientProps {
  initialQuery: string;
  initialItems: ToolItem[];
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
  categories: Category[];
}

const DEBOUNCE_MS = 300;

export function SearchPageClient({
  initialQuery,
  initialItems,
  initialTotal,
  initialPage,
  initialTotalPages,
}: SearchPageClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateSearch = useCallback(
    (q: string, page = 1) => {
      const trimmed = q.trim();
      const params = new URLSearchParams();
      if (trimmed) params.set("q", trimmed);
      if (page > 1) params.set("page", String(page));
      router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
    },
    [router]
  );

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (query === initialQuery) return;
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      updateSearch(query);
    }, DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, initialQuery, updateSearch]);

  return (
    <div className="mt-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateSearch(query);
        }}
        className="max-w-xl"
      >
        <label htmlFor="search-q" className="sr-only">
          Search tools
        </label>
        <input
          id="search-q"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, description, or category…"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
        <button type="submit" className="sr-only">
          Search
        </button>
      </form>

      {initialQuery && (
        <p className="mt-4 text-sm text-gray-600">
          {initialTotal} result{initialTotal !== 1 ? "s" : ""} for &quot;{initialQuery}&quot;
        </p>
      )}

      {!initialQuery ? (
        <p className="mt-8 text-gray-500">Enter a search term above.</p>
      ) : initialItems.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center text-gray-600">
          No tools match your search. Try different keywords or{" "}
          <Link href="/tools" className="font-medium text-gray-900 hover:underline">
            browse all tools
          </Link>
          .
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
          {initialTotalPages > 1 && (
            <nav className="mt-10 flex justify-center gap-2" aria-label="Pagination">
              {initialPage > 1 && (
                <Link
                  href={`/search?q=${encodeURIComponent(initialQuery)}&page=${initialPage - 1}`}
                  className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}
              <span className="flex items-center px-4 py-2 text-sm text-gray-600">
                Page {initialPage} of {initialTotalPages}
              </span>
              {initialPage < initialTotalPages && (
                <Link
                  href={`/search?q=${encodeURIComponent(initialQuery)}&page=${initialPage + 1}`}
                  className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Next
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
