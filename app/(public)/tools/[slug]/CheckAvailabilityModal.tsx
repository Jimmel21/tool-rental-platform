"use client";

import { useEffect } from "react";
import { AvailabilityChecker } from "@/components/booking/AvailabilityChecker";

interface CheckAvailabilityModalProps {
  open: boolean;
  onClose: () => void;
  toolId: string;
  toolSlug: string;
}

export function CheckAvailabilityModal({
  open,
  onClose,
  toolId,
  toolSlug,
}: CheckAvailabilityModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:max-w-md sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
            Check availability
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Pick your dates to see availability and price breakdown.
        </p>
        <div className="mt-6">
          <AvailabilityChecker
            toolId={toolId}
            toolSlug={toolSlug}
            onAvailable={() => {}}
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  );
}
