"use client";

import { useState } from "react";
import { CheckAvailabilityModal } from "./CheckAvailabilityModal";

interface CheckAvailabilityBlockProps {
  toolId: string;
  toolSlug: string;
}

export function CheckAvailabilityBlock({ toolId, toolSlug }: CheckAvailabilityBlockProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mt-6">
        <p className="mb-2 text-xs text-gray-500">Check availability and see price</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800"
        >
          Check Availability
        </button>
      </div>
      <CheckAvailabilityModal
        open={open}
        onClose={() => setOpen(false)}
        toolId={toolId}
        toolSlug={toolSlug}
      />
    </>
  );
}
