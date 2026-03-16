"use client";

import Link from "next/link";
import { PriceDisplay } from "@/components/ui/PriceDisplay";

interface ToolDetailStickyBarProps {
  toolSlug: string;
  dailyRate: number;
}

export function ToolDetailStickyBar({ toolSlug, dailyRate }: ToolDetailStickyBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between gap-4 border-t border-gray-200 bg-white px-4 py-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] safe-area-pb md:hidden">
      <div>
        <p className="text-xs text-muted">From</p>
        <PriceDisplay amount={dailyRate} perDay className="text-lg font-bold text-primary" />
      </div>
      <Link
        href={`/tools/${toolSlug}/book`}
        className="flex flex-1 justify-center rounded-lg bg-primary px-6 py-3.5 text-base font-semibold text-white hover:bg-primary/90 active:bg-primary/80"
      >
        Book now
      </Link>
    </div>
  );
}
