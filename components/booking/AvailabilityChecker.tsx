"use client";

import { useState } from "react";
import { formatTTD } from "@/lib/utils/currency";

interface AvailabilityCheckerProps {
  toolId: string;
  toolSlug: string;
  onAvailable?: (params: { startDate: string; endDate: string }) => void;
}

export function AvailabilityChecker({
  toolId,
  toolSlug,
  onAvailable,
}: AvailabilityCheckerProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [result, setResult] = useState<{
    available: boolean;
    days?: number;
    dailyRate?: number;
    rentalSubtotal?: number;
    depositAmount?: number;
    deliveryFee?: number;
    total?: number;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const minStart = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  })();

  async function handleCheck() {
    if (!startDate || !endDate) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/tools/check-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId,
          startDate,
          endDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ available: false, error: data.error ?? "Invalid dates" });
        return;
      }
      setResult({
        available: data.available,
        days: data.days,
        dailyRate: data.dailyRate,
        rentalSubtotal: data.rentalSubtotal,
        depositAmount: data.depositAmount,
        deliveryFee: data.deliveryFee,
        total: data.total,
        error: data.error,
      });
    } catch {
      setResult({ available: false, error: "Could not check availability." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start date</label>
          <input
            type="date"
            min={minStart}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End date</label>
          <input
            type="date"
            min={startDate || minStart}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleCheck}
        disabled={!startDate || !endDate || loading}
        className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "Checking…" : "Check availability"}
      </button>

      {result && (
        <div
          className={`rounded-lg border p-4 ${
            result.available
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          {result.error && (
            <p className="text-sm font-medium text-red-800">{result.error}</p>
          )}
          {result.available && result.days != null && (
            <>
              <p className="text-sm font-medium text-green-800">Available for your dates</p>
              <dl className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">
                    {result.days} day{result.days !== 1 ? "s" : ""} × {formatTTD(result.dailyRate ?? 0)}
                  </dt>
                  <dd>{formatTTD(result.rentalSubtotal ?? 0)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Deposit</dt>
                  <dd>{formatTTD(result.depositAmount ?? 0)}</dd>
                </div>
                {(result.deliveryFee ?? 0) > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Delivery</dt>
                    <dd>{formatTTD(result.deliveryFee ?? 0)}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-green-200 pt-2 font-semibold">
                  <dt>Total</dt>
                  <dd>{formatTTD(result.total ?? 0)}</dd>
                </div>
              </dl>
              {onAvailable && (
                <a
                  href={`/tools/${toolSlug}/book?start=${startDate}&end=${endDate}`}
                  className="mt-4 inline-block w-full rounded-md bg-green-700 px-4 py-2 text-center text-sm font-medium text-white hover:bg-green-800"
                >
                  Book now
                </a>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
