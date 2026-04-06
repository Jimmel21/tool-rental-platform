"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatTTD } from "@/lib/utils/currency";

type PaymentRow = {
  id: string;
  bookingId: string;
  bookingReference: string;
  customerName: string;
  amount: number;
  method: string;
  type: string;
  status: string;
  transactionRef: string | null;
  customerDeclaredPaidAt: string | null;
  createdAt: string;
};

type HeldDepositRow = {
  bookingId: string;
  reference: string;
  customerName: string;
  toolName: string;
  depositPaid: number;
  depositStatus: string;
  endDate: string;
};

export function AdminPaymentsClient() {
  const router = useRouter();
  const [method, setMethod] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [pendingTransfers, setPendingTransfers] = useState<PaymentRow[]>([]);
  const [heldDeposits, setHeldDeposits] = useState<HeldDepositRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const loadPayments = useCallback(() => {
    const params = new URLSearchParams();
    if (method) params.set("method", method);
    if (status) params.set("status", status);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    fetch(`/api/admin/payments?${params}`)
      .then((r) => r.json())
      .then((data) => setPayments(Array.isArray(data) ? data : []));
  }, [method, status, dateFrom, dateTo]);

  const loadPendingAndHeld = useCallback(() => {
    fetch("/api/admin/payments/pending-transfers")
      .then((r) => r.json())
      .then((data) => setPendingTransfers(Array.isArray(data) ? data : []));
    fetch("/api/admin/deposits/held")
      .then((r) => r.json())
      .then((data) => setHeldDeposits(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    setLoading(true);
    loadPayments();
    loadPendingAndHeld();
    setLoading(false);
  }, [loadPayments, loadPendingAndHeld]);

  const handleConfirm = async (paymentId: string) => {
    setConfirmingId(paymentId);
    try {
      const res = await fetch("/api/admin/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });
      if (res.ok) {
        router.refresh();
        loadPayments();
        loadPendingAndHeld();
      } else {
        const data = await res.json();
        alert(data.error ?? "Failed to confirm");
      }
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className="mt-6 space-y-8">
      {/* Pending bank transfers */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="font-semibold text-gray-900">Pending bank transfers</h2>
        <p className="mt-1 text-sm text-gray-600">Confirm after verifying payment received.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-amber-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Booking</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Customer</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Ref</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-600">Amount</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-200">
              {pendingTransfers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-sm text-gray-500">
                    No pending bank transfers
                  </td>
                </tr>
              ) : (
                pendingTransfers.map((p) => (
                  <tr key={p.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                      {new Date(p.createdAt).toLocaleDateString("en-TT")}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link href={`/admin/bookings/${p.bookingId}`} className="font-mono hover:underline">
                        {p.bookingReference}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{p.customerName}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-700">{p.transactionRef ?? "—"}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      {formatTTD(p.amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleConfirm(p.id)}
                        disabled={confirmingId === p.id}
                        className="rounded bg-primary px-2 py-1 text-xs font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                      >
                        {confirmingId === p.id ? "Confirming…" : "Confirm payment"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Held deposits */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-gray-900">Held deposits</h2>
        <p className="mt-1 text-sm text-gray-600">Release or deduct from booking detail.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Booking</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Customer</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Tool</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Amount</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">End date</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {heldDeposits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-sm text-gray-500">
                    No held deposits
                  </td>
                </tr>
              ) : (
                heldDeposits.map((d) => (
                  <tr key={d.bookingId}>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{d.reference}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{d.customerName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{d.toolName}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      {formatTTD(d.depositPaid)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">{d.endDate}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/bookings/${d.bookingId}`}
                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* All payments - filters and table */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-gray-900">All payments</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All methods</option>
            <option value="CARD">Card</option>
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Bank transfer</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Booking ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Customer</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-sm text-gray-500">
                    No payments match filters
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id}>
                    <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-600">
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-sm font-mono text-gray-900">
                      <Link href={`/admin/bookings/${p.bookingId}`} className="hover:underline">
                        {p.bookingReference}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{p.customerName}</td>
                    <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                      {formatTTD(p.amount)}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{p.method}</td>
                    <td className="px-6 py-3">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
