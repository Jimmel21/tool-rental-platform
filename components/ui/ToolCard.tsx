import Link from "next/link";
import Image from "next/image";
import { PriceDisplay } from "./PriceDisplay";
import { AvailabilityBadge } from "./AvailabilityBadge";
import type { ToolStatus } from "@prisma/client";

interface ToolCardProps {
  slug: string;
  name: string;
  description?: string | null;
  dailyRate: number;
  images: string[];
  status: ToolStatus;
  averageRating?: number | null;
  reviewCount?: number;
  categoryName?: string;
}

const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300' fill='%23e5e7eb'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%239ca3af'%3ETool%3C/text%3E%3C/svg%3E";

export function ToolCard({
  slug,
  name,
  description,
  dailyRate,
  images,
  status,
  averageRating,
  reviewCount = 0,
  categoryName,
}: ToolCardProps) {
  const imgSrc = images?.[0] ?? placeholderImage;
  const isDataUrl = imgSrc.startsWith("data:");

  return (
    <Link
      href={`/tools/${slug}`}
      className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-gray-300 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-gray-100">
        {isDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt=""
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <Image
            src={imgSrc}
            alt=""
            fill
            className="object-cover transition group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        )}
        <div className="absolute right-2 top-2">
          <AvailabilityBadge status={status} />
        </div>
      </div>
      <div className="p-4">
        {categoryName && (
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {categoryName}
          </p>
        )}
        <h3 className="mt-1 font-semibold text-gray-900 group-hover:text-gray-700">
          {name}
        </h3>
        {description && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">{description}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <PriceDisplay amount={dailyRate} perDay className="font-semibold" />
          {averageRating != null && (
            <span className="text-sm text-gray-600">
              ★ {averageRating} {reviewCount > 0 && `(${reviewCount})`}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
