"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatTTD } from "@/lib/utils/currency";
import { DELIVERY_ZONES } from "@/lib/delivery-zones";

interface BookingFormProps {
  tool: { id: string; slug: string; name: string; dailyRate: number; depositAmount: number };
  defaultStart?: string;
  defaultEnd?: string;
}

const PICKUP_MESSAGE = "Pickup location will be shared after booking confirmation. Contact owner for details.";

export function BookingForm({ tool, defaultStart, defaultEnd }: BookingFormProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState(defaultStart ?? "");
  const [endDate, setEndDate] = useState(defaultEnd ?? "");
  const [deliveryOption, setDeliveryOption] = useState<"PICKUP" | "DELIVERY">("PICKUP");
  const [deliveryZone, setDeliveryZone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const minStart = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  })();

  useEffect(() => {
    if (defaultStart) setStartDate(defaultStart);
    if (defaultEnd) setEndDate(defaultEnd);
  }, [defaultStart, defaultEnd]);

  const deliveryFee = deliveryOption === "DELIVERY" && deliveryZone
    ? DELIVERY_ZONES.find((z) => z.id === deliveryZone)?.fee ?? 0
    : 0;

  const days = (() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  })();

  const rentalSubtotal = days * tool.dailyRate;
  const total = rentalSubtotal + tool.depositAmount + deliveryFee;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!acceptTerms) {
      setError("You must accept the terms and conditions.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Please select start and end dates.");
      return;
    }
    if (deliveryOption === "DELIVERY" && (!deliveryZone || !deliveryAddress.trim())) {
      setError("Please select a delivery zone and enter your address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: tool.id,
          startDate,
          endDate,
          deliveryOption,
          deliveryAddress: deliveryOption === "DELIVERY" ? deliveryAddress.trim() : undefined,
          deliveryZone: deliveryOption === "DELIVERY" ? deliveryZone : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create booking.");
        setLoading(false);
        return;
      }
      router.push(`/bookings/${data.id}/confirm`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div>
            <h2 className="font-semibold text-gray-900">Dates</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start date</label>
                <input
                  type="date"
                  min={minStart}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End date</label>
                <input
                  type="date"
                  min={startDate || minStart}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">Delivery</h2>
            <div className="mt-3 space-y-4">
              <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 has-[:checked]:border-gray-900 has-[:checked]:ring-1 has-[:checked]:ring-gray-900">
                <input
                  type="radio"
                  name="delivery"
                  value="PICKUP"
                  checked={deliveryOption === "PICKUP"}
                  onChange={() => setDeliveryOption("PICKUP")}
                  className="mt-1"
                />
                <div>
                  <span className="font-medium">Pickup</span>
                  <span className="ml-2 text-green-600">Free</span>
                  <p className="mt-1 text-sm text-gray-500">{PICKUP_MESSAGE}</p>
                </div>
              </label>
              <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 has-[:checked]:border-gray-900 has-[:checked]:ring-1 has-[:checked]:ring-gray-900">
                <input
                  type="radio"
                  name="delivery"
                  value="DELIVERY"
                  checked={deliveryOption === "DELIVERY"}
                  onChange={() => setDeliveryOption("DELIVERY")}
                  className="mt-1"
                />
                <div className="flex-1">
                  <span className="font-medium">Delivery</span>
                  <span className="ml-2 text-gray-600">Fee by zone</span>
                  {deliveryOption === "DELIVERY" && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Area</label>
                        <select
                          value={deliveryZone}
                          onChange={(e) => setDeliveryZone(e.target.value)}
                          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                        >
                          <option value="">Select zone</option>
                          {DELIVERY_ZONES.map((z) => (
                            <option key={z.id} value={z.id}>
                              {z.name} — {formatTTD(z.fee)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Delivery address</label>
                        <textarea
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          rows={2}
                          placeholder="Street, area, landmark"
                          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input
              id="terms"
              type="checkbox"
              required
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              I accept the{" "}
              <Link href="/terms" className="font-medium text-gray-900 underline">
                terms and conditions
              </Link>{" "}
              and understand the deposit and cancellation policy.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 lg:w-auto lg:min-w-[200px]"
          >
            {loading ? "Creating booking…" : "Proceed to Payment"}
          </button>
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-8 rounded-xl border border-gray-200 bg-gray-50 p-6">
            <h3 className="font-semibold text-gray-900">Order summary</h3>
            <p className="mt-1 text-sm text-gray-600">{tool.name}</p>
            <dl className="mt-4 space-y-2 text-sm">
              {days > 0 && (
                <>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">{days} day(s) × {formatTTD(tool.dailyRate)}</dt>
                    <dd>{formatTTD(rentalSubtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Deposit</dt>
                    <dd>{formatTTD(tool.depositAmount)}</dd>
                  </div>
                  {deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Delivery</dt>
                      <dd>{formatTTD(deliveryFee)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
                    <dt>Total</dt>
                    <dd>{formatTTD(total)}</dd>
                  </div>
                </>
              )}
            </dl>
            {days === 0 && (
              <p className="mt-2 text-sm text-gray-500">Select dates to see total.</p>
            )}
          </div>
        </aside>
      </div>
    </form>
  );
}
