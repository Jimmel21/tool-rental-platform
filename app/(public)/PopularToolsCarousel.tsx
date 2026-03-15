"use client";

import { useRef } from "react";
import { ToolCard } from "@/components/ui/ToolCard";

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

export function PopularToolsCarousel({ tools }: { tools: ToolItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (tools.length === 0) {
    return (
      <p className="mt-6 text-gray-500">
        No tools yet. Run <code className="rounded bg-gray-100 px-1 py-0.5">npx prisma db seed</code> to add sample data.
      </p>
    );
  }

  return (
    <div className="relative mt-6">
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-2 scroll-smooth md:gap-8"
        style={{ scrollbarWidth: "thin" }}
      >
        {tools.map((t) => (
          <div
            key={t.slug}
            className="w-72 flex-shrink-0 md:w-80"
          >
            <ToolCard
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
          </div>
        ))}
      </div>
    </div>
  );
}
