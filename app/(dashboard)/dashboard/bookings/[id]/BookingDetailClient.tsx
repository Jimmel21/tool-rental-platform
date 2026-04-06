"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getWhatsAppUrl, whatsAppMessageBookingQuestion } from "@/lib/whatsapp";

export function BookingDetailClient({
  bookingId,
  bookingReference,
  status,
  hasReview,
  toolSlug,
}: {
  bookingId: string;
  bookingReference: string;
  status: string;
  hasReview: boolean;
  toolSlug: string;
}) {
  const router = useRouter();
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Return form state
  const [returnCondition, setReturnCondition] = useState("Excellent");
  const [damageNotes, setDamageNotes] = useState("");
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnError, setReturnError] = useState("");

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setReturnSubmitting(true);
    setReturnError("");
    try {
      const res = await fetch(`/api/bookings/${bookingId}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ condition: returnCondition, damageNotes: damageNotes.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.refresh();
      } else {
        setReturnError(data.error ?? "Failed to submit return");
      }
    } finally {
      setReturnSubmitting(false);
    }
  };

  const canCancel = status === "PENDING" || status === "CONFIRMED";

  const handleCancel = async () => {
    if (!canCancel || !confirm("Cancel this booking?")) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.refresh();
      } else {
        setError(data.error ?? "Failed to cancel");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasReview) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          rating: reviewRating,
          comment: reviewComment.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.refresh();
      } else {
        setError(data.error ?? "Failed to submit review");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="font-semibold text-gray-900">Actions</h3>
        <div className="mt-4 flex flex-col gap-3">
          <a
            href={getWhatsAppUrl(whatsAppMessageBookingQuestion(bookingReference))}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-2 text-sm font-medium text-white hover:bg-[#20BD5A]"
          >
            Question about this booking (WhatsApp)
          </a>
          <a
            href={getWhatsAppUrl(`Report issue for booking #${bookingReference}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex justify-center rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100"
          >
            Report issue
          </a>
          {canCancel && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="inline-flex justify-center rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              {submitting ? "Cancelling…" : "Cancel booking"}
            </button>
          )}
          {status === "COMPLETED" && (
            <Link
              href={`/tools/${toolSlug}/book`}
              className="inline-flex justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Re-book this tool
            </Link>
          )}
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}
      </div>

      {status === "ACTIVE" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Submit return</h3>
          <form onSubmit={handleReturn} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tool condition
              </label>
              <select
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              >
                <option value="Excellent">Excellent — no issues</option>
                <option value="Good">Good — minor wear</option>
                <option value="Damaged">Damaged</option>
                <option value="Missing">Missing parts</option>
              </select>
            </div>
            {(returnCondition === "Damaged" || returnCondition === "Missing") && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Damage / missing parts notes
                </label>
                <textarea
                  value={damageNotes}
                  onChange={(e) => setDamageNotes(e.target.value)}
                  rows={3}
                  placeholder="Describe the damage or missing parts…"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
            )}
            {returnError && (
              <p className="text-sm text-red-600">{returnError}</p>
            )}
            <button
              type="submit"
              disabled={returnSubmitting}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {returnSubmitting ? "Submitting…" : "Confirm return"}
            </button>
          </form>
        </div>
      )}

      {status === "COMPLETED" && !hasReview && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Leave a review</h3>
          <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rating
              </label>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} star{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Comment (optional)
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit review"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
