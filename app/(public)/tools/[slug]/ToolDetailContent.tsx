"use client";

import { useState } from "react";
import Image from "next/image";

const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600' fill='%23e5e7eb'%3E%3Crect width='800' height='600' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%239ca3af'%3ETool%3C/text%3E%3C/svg%3E";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  customerName: string;
  createdAt: string;
}

interface ToolDetailContentProps {
  name: string;
  description: string | null;
  images: string[];
  status: string;
  brand: string | null;
  model: string | null;
  conditionNotes: string | null;
  averageRating: number | null;
  reviewCount: number;
  reviews: Review[];
}

export function ToolDetailContent({
  name,
  description,
  images,
  brand,
  model,
  conditionNotes,
  averageRating,
  reviewCount,
  reviews,
}: ToolDetailContentProps) {
  const [galleryIndex, setGalleryIndex] = useState(0);
  const list = images?.length ? images : [placeholderImage];
  const current = list[galleryIndex] ?? list[0];
  const isDataUrl = typeof current === "string" && current.startsWith("data:");

  return (
    <>
      {/* Image gallery */}
      <div className="space-y-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
          {isDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={current}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <Image
              src={current}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 66vw"
              priority
            />
          )}
        </div>
        {list.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {list.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setGalleryIndex(i)}
                className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded border-2 ${i === galleryIndex ? "border-gray-900" : "border-transparent"}`}
              >
                {src.startsWith("data:") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Image src={src} alt="" fill className="object-cover" sizes="96px" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
        {(averageRating != null || reviewCount > 0) && (
          <p className="mt-1 text-sm text-gray-600">
            ★ {averageRating ?? "—"} {reviewCount > 0 && `(${reviewCount} review${reviewCount !== 1 ? "s" : ""})`}
          </p>
        )}
        {description && (
          <div className="mt-4 text-gray-700 whitespace-pre-wrap">{description}</div>
        )}
      </div>

      {/* Specs */}
      {(brand || model || conditionNotes) && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h2 className="font-semibold text-gray-900">Details</h2>
          <dl className="mt-2 space-y-1 text-sm">
            {brand && (
              <>
                <dt className="text-gray-500">Brand</dt>
                <dd className="font-medium text-gray-900">{brand}</dd>
              </>
            )}
            {model && (
              <>
                <dt className="text-gray-500">Model</dt>
                <dd className="font-medium text-gray-900">{model}</dd>
              </>
            )}
            {conditionNotes && (
              <>
                <dt className="text-gray-500">Condition</dt>
                <dd className="text-gray-700">{conditionNotes}</dd>
              </>
            )}
          </dl>
        </div>
      )}

      {/* Reviews */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No reviews yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">★ {r.rating}</span>
                  <span className="text-sm text-gray-500">{r.customerName}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {r.comment && <p className="mt-1 text-sm text-gray-700">{r.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
