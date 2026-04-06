"use client";

import { useState, useRef } from "react";
import Image from "next/image";

// ---------------------------------------------------------------------------
// Review submission form
// ---------------------------------------------------------------------------

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          className="text-2xl leading-none focus:outline-none"
          style={{ color: star <= (hovered || value) ? "#f59e0b" : "#d1d5db" }}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          ★
        </button>
      ))}
    </div>
  );
}

interface ReviewFormProps {
  bookingId: string;
  onSubmitted: (review: Review) => void;
}

function ReviewForm({ bookingId, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, rating, comment: comment.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      onSubmitted({
        id: crypto.randomUUID(),
        rating,
        comment: comment.trim() || null,
        customerName: "You",
        createdAt: new Date().toISOString(),
      });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-gray-200 bg-white p-5 space-y-4">
      <h3 className="font-semibold text-navy">Leave a Review</h3>

      <div>
        <label className="block text-sm text-muted mb-1">Rating</label>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <div>
        <label htmlFor="review-comment" className="block text-sm text-muted mb-1">
          Comment <span className="text-xs">(optional)</span>
        </label>
        <textarea
          id="review-comment"
          rows={3}
          maxLength={1000}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="How was your experience with this tool?"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-navy placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}

const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600' fill='%23e5e7eb'%3E%3Crect width='800' height='600' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%239ca3af'%3ETool%3C/text%3E%3C/svg%3E";

const SWIPE_THRESHOLD = 50;

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
  /** Booking ID eligible for review (COMPLETED, no existing review). Null if not eligible. */
  eligibleBookingId: string | null;
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
  reviews: initialReviews,
  eligibleBookingId,
}: ToolDetailContentProps) {
  const [galleryIndex, setGalleryIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const list = images?.length ? images : [placeholderImage];
  const current = list[galleryIndex] ?? list[0];
  const isDataUrl = typeof current === "string" && current.startsWith("data:");

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null || list.length <= 1) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) < SWIPE_THRESHOLD) return;
    if (diff > 0) {
      setGalleryIndex((i) => (i + 1) % list.length);
    } else {
      setGalleryIndex((i) => (i - 1 + list.length) % list.length);
    }
    touchStartX.current = null;
  };

  return (
    <>
      {/* Image gallery - swipeable on touch */}
      <div className="space-y-2">
        <div
          className="relative aspect-[4/3] touch-pan-y overflow-hidden rounded-xl bg-gray-100"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
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
                className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded border-2 ${i === galleryIndex ? "border-primary" : "border-transparent"}`}
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
        <h1 className="text-2xl font-bold text-navy">{name}</h1>
        {(averageRating != null || reviewCount > 0) && (
          <p className="mt-1 text-sm text-muted">
            ★ {averageRating ?? "—"} {reviewCount > 0 && `(${reviewCount} review${reviewCount !== 1 ? "s" : ""})`}
          </p>
        )}
        {description && (
          <div className="mt-4 text-navy whitespace-pre-wrap">{description}</div>
        )}
      </div>

      {/* Specs */}
      {(brand || model || conditionNotes) && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="font-semibold text-navy">Details</h2>
          <dl className="mt-2 space-y-1 text-sm">
            {brand && (
              <>
                <dt className="text-muted">Brand</dt>
                <dd className="font-medium text-navy">{brand}</dd>
              </>
            )}
            {model && (
              <>
                <dt className="text-muted">Model</dt>
                <dd className="font-medium text-navy">{model}</dd>
              </>
            )}
            {conditionNotes && (
              <>
                <dt className="text-muted">Condition</dt>
                <dd className="text-navy">{conditionNotes}</dd>
              </>
            )}
          </dl>
        </div>
      )}

      {/* Reviews */}
      <div>
        <h2 className="text-lg font-semibold text-navy">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No reviews yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-navy">★ {r.rating}</span>
                  <span className="text-sm text-muted">{r.customerName}</span>
                  <span className="text-xs text-muted">
                    {new Date(r.createdAt).toLocaleDateString("en-TT")}
                  </span>
                </div>
                {r.comment && <p className="mt-1 text-sm text-navy">{r.comment}</p>}
              </li>
            ))}
          </ul>
        )}

        {eligibleBookingId && !reviewSubmitted && (
          <ReviewForm
            bookingId={eligibleBookingId}
            onSubmitted={(newReview) => {
              setReviews((prev) => [newReview, ...prev]);
              setReviewSubmitted(true);
            }}
          />
        )}

        {reviewSubmitted && (
          <p className="mt-4 text-sm text-green-700 font-medium">
            Thanks for your review!
          </p>
        )}
      </div>
    </>
  );
}
