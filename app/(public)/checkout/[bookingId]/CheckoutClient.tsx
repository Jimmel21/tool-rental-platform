"use client";

import { useState } from "react";
import Link from "next/link";
import { formatTTD } from "@/lib/utils/currency";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { BANK_TRANSFER_DETAILS } from "@/lib/payment/constants";

type PaymentMethodChoice = "card" | "bank_transfer" | "pay_on_pickup" | null;

interface CheckoutClientProps {
  booking: {
    id: string;
    reference: string;
    startDate: string;
    endDate: string;
    status: string;
    totalAmount: number;
    depositPaid: number;
    balanceDue: number;
    deliveryOption: string;
    tool: { name: string; slug: string };
  };
}

export function CheckoutClient({ booking }: CheckoutClientProps) {
  const [method, setMethod] = useState<PaymentMethodChoice>(null);
  const [transactionRef, setTransactionRef] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [declaredTransfer, setDeclaredTransfer] = useState(false);

  const balanceDue = booking.balanceDue;
  const isPickup = booking.deliveryOption === "PICKUP";

  async function handleInitiateBankTransfer() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          method: "BANK_TRANSFER",
          amount: balanceDue,
          type: "RENTAL",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to generate reference");
        setLoading(false);
        return;
      }
      setTransactionRef(data.transactionRef ?? null);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeclareTransfer() {
    if (!transactionRef) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionRef }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed");
        setLoading(false);
        return;
      }
      setDeclaredTransfer(true);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePayOnPickup() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          method: "CASH",
          amount: balanceDue,
          type: "RENTAL",
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed");
        setLoading(false);
        return;
      }
      setDeclaredTransfer(true);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div>
          <h2 className="font-semibold text-gray-900">Payment method</h2>
          <div className="mt-3 space-y-3">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 has-[:checked]:border-gray-900 has-[:checked]:ring-1 has-[:checked]:ring-gray-900">
              <input
                type="radio"
                name="pm"
                checked={method === "card"}
                onChange={() => setMethod("card")}
                className="mt-1"
              />
              <div>
                <span className="font-medium">Card (WiPay / First Atlantic Commerce)</span>
                <p className="mt-1 text-sm text-amber-700">Coming soon</p>
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 has-[:checked]:border-gray-900 has-[:checked]:ring-1 has-[:checked]:ring-gray-900">
              <input
                type="radio"
                name="pm"
                checked={method === "bank_transfer"}
                onChange={() => {
                  setMethod("bank_transfer");
                  setTransactionRef(null);
                  setDeclaredTransfer(false);
                }}
                className="mt-1"
              />
              <div>
                <span className="font-medium">Bank transfer</span>
                <p className="mt-1 text-sm text-gray-600">Pay via local bank transfer. Use the reference below.</p>
              </div>
            </label>

            {isPickup && (
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 has-[:checked]:border-gray-900 has-[:checked]:ring-1 has-[:checked]:ring-gray-900">
                <input
                  type="radio"
                  name="pm"
                  checked={method === "pay_on_pickup"}
                  onChange={() => setMethod("pay_on_pickup")}
                  className="mt-1"
                />
                <div>
                  <span className="font-medium">Pay on pickup</span>
                  <p className="mt-1 text-sm text-gray-600">Pay deposit + balance when you collect. No online payment.</p>
                </div>
              </label>
            )}
          </div>
        </div>

        {method === "bank_transfer" && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            {!transactionRef ? (
              <button
                type="button"
                onClick={handleInitiateBankTransfer}
                disabled={loading}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? "Generating…" : "Get reference & bank details"}
              </button>
            ) : (
              <>
                <p className="font-medium text-gray-900">Reference number</p>
                <p className="mt-1 font-mono text-lg">{transactionRef}</p>
                <p className="mt-2 text-sm text-gray-600">Include this reference in your transfer.</p>
                <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 text-sm">
                  <p className="font-medium text-gray-900">{BANK_TRANSFER_DETAILS.bankName}</p>
                  <p className="mt-1">Account: {BANK_TRANSFER_DETAILS.accountName}</p>
                  <p className="mt-1">Account #: {BANK_TRANSFER_DETAILS.accountNumber}</p>
                  <p className="mt-1">Branch: {BANK_TRANSFER_DETAILS.branch}</p>
                  <p className="mt-3 text-gray-600">{BANK_TRANSFER_DETAILS.instructions}</p>
                </div>
                {!declaredTransfer ? (
                  <button
                    type="button"
                    onClick={handleDeclareTransfer}
                    disabled={loading}
                    className="mt-4 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    {loading ? "Sending…" : "I have made the transfer"}
                  </button>
                ) : (
                  <p className="mt-4 text-sm font-medium text-green-700">
                    We have recorded your transfer. Admin will verify within 1-2 business days.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {method === "pay_on_pickup" && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <p className="text-sm text-gray-700">
              You will pay {formatTTD(balanceDue)} (deposit + balance) when you collect the tool.
            </p>
            {!declaredTransfer ? (
              <button
                type="button"
                onClick={handlePayOnPickup}
                disabled={loading}
                className="mt-4 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? "Confirming…" : "Confirm pay on pickup"}
              </button>
            ) : (
              <p className="mt-4 text-sm font-medium text-green-700">
                Booking noted. Bring the full amount when you collect.
              </p>
            )}
          </div>
        )}
      </div>

      <aside>
        <div className="sticky top-8 rounded-xl border border-gray-200 bg-gray-50 p-6">
          <h3 className="font-semibold text-gray-900">Order summary</h3>
          <p className="mt-1 text-sm text-gray-600">{booking.tool.name}</p>
          <p className="mt-2 text-sm text-gray-600">
            {booking.startDate} to {booking.endDate}
          </p>
          <dl className="mt-4 space-y-2 border-t border-gray-200 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Total</dt>
              <dd className="font-medium"><PriceDisplay amount={booking.totalAmount} /></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Deposit paid</dt>
              <dd><PriceDisplay amount={booking.depositPaid} /></dd>
            </div>
            <div className="flex justify-between font-medium">
              <dt className="text-gray-900">Balance due</dt>
              <dd><PriceDisplay amount={balanceDue} /></dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-gray-500">Ref: {booking.reference}</p>
          <Link
            href={`/bookings/${booking.id}/confirm`}
            className="mt-4 block text-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Back to booking
          </Link>
        </div>
      </aside>
    </div>
  );
}
