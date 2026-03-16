"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import type { BookingCard } from "@/lib/data/dashboard";
import type { BookingTab } from "@/lib/data/dashboard";

const TABS: { key: BookingTab; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    ACTIVE: "bg-green-100 text-green-800",
    COMPLETED: "bg-gray-100 text-gray-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-800"}`}
    >
      {status}
    </span>
  );
}

function BookingCardRow({
  booking,
  onCancel,
}: {
  booking: BookingCard;
  onCancel: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const canCancel =
    (booking.status === "PENDING" || booking.status === "CONFIRMED") &&
    new Date(booking.startDate) > new Date();

  const handleCancel = async () => {
    if (!canCancel || !confirm("Cancel this booking?")) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: "POST",
      });
      if (res.ok) {
        onCancel();
      } else {
        const data = await res.json();
        alert(data.error ?? "Failed to cancel");
      }
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div
        className="flex cursor-pointer flex-wrap items-center gap-4 p-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
          {booking.tool.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element -- dynamic tool images
            <img
              src={booking.tool.images[0]}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-gray-400">
              No image
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-900">{booking.tool.name}</p>
          <p className="text-sm text-gray-500">
            {booking.startDate} → {booking.endDate}
          </p>
        </div>
        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:flex-col sm:items-end">
          <PriceDisplay amount={booking.totalAmount} />
          <span className="flex items-center gap-2">
            <StatusBadge status={booking.status} />
            <span className="text-gray-400">{expanded ? "▼" : "▶"}</span>
          </span>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4">
          <p className="text-sm text-gray-600">
            Reference: <span className="font-mono">{booking.reference}</span>
          </p>
          <p className="text-sm text-gray-600">
            Delivery: {booking.deliveryOption === "PICKUP" ? "Pickup" : "Delivery"}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/dashboard/bookings/${booking.id}`}
              className="text-sm font-medium text-gray-900 underline hover:no-underline"
              onClick={(e) => e.stopPropagation()}
            >
              View details
            </Link>
            {canCancel && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
                disabled={cancelling}
                className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                {cancelling ? "Cancelling…" : "Cancel booking"}
              </button>
            )}
            <a
              href={getWhatsAppUrl("Hi, I have a question about my booking.")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              Contact support
            </a>
            {booking.status === "COMPLETED" && (
              <Link
                href={`/tools/${booking.tool.slug}/book`}
                className="text-sm font-medium text-gray-900 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Re-book this tool
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function BookingsPageClient({
  bookings,
  currentTab,
}: {
  bookings: BookingCard[];
  currentTab: BookingTab;
}) {
  const router = useRouter();

  function handleCancel() {
    router.refresh();
  }

  return (
    <div className="mt-8">
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="-mb-px flex min-w-0 gap-4 sm:gap-6" aria-label="Tabs">
          {TABS.map(({ key, label }) => (
            <Link
              key={key}
              href={`/dashboard/bookings?tab=${key}`}
              className={`border-b-2 py-4 text-sm font-medium ${
                currentTab === key
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <PullToRefresh className="mt-6">
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <p className="text-gray-500">No bookings in this category.</p>
          ) : (
            bookings.map((b) => (
              <BookingCardRow
                key={b.id}
                booking={b}
                onCancel={handleCancel}
              />
            ))
          )}
        </div>
      </PullToRefresh>
    </div>
  );
}
