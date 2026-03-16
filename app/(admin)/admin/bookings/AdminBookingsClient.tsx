"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatTTD } from "@/lib/utils/currency";

type BookingRow = {
  id: string;
  reference: string;
  customerName: string;
  toolId: string;
  toolName: string;
  toolSlug: string;
  startDate: string;
  endDate: string;
  status: string;
  totalAmount: number;
  balanceDue: number;
  paymentStatus: string;
};

export function AdminBookingsClient() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (paymentStatus) params.set("paymentStatus", paymentStatus);
    if (searchDebounced) params.set("search", searchDebounced);
    fetch(`/api/admin/bookings?${params}`)
      .then((r) => r.json())
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [status, dateFrom, dateTo, paymentStatus, searchDebounced]);

  const updateStatus = async (bookingId: string, newStatus: string) => {
    setActingId(bookingId);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) router.refresh();
      else {
        const data = await res.json();
        alert(data.error ?? "Failed");
      }
    } finally {
      setActingId(null);
    }
  };

  const paymentStatusBadge = (ps: string) => {
    const c = ps === "paid" ? "bg-green-100 text-green-800" : ps === "partial" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-700";
    return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c}`}>{ps}</span>;
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
        <input
          type="search"
          placeholder="Search by booking ID or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
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
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All payment status</option>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Tool</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Payment</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td className="whitespace-nowrap px-6 py-3 text-sm font-mono text-gray-900">
                      <Link href={`/admin/bookings/${b.id}`} className="hover:underline">
                        {b.reference}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{b.customerName}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      <Link href={`/admin/tools/${b.toolId}`} className="hover:underline">
                        {b.toolName}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {b.startDate} → {b.endDate}
                    </td>
                    <td className="px-6 py-3">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      {formatTTD(b.totalAmount)}
                    </td>
                    <td className="px-6 py-3">{paymentStatusBadge(b.paymentStatus)}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-1">
                        {b.status === "PENDING" && (
                          <button
                            type="button"
                            onClick={() => updateStatus(b.id, "CONFIRMED")}
                            disabled={actingId === b.id}
                            className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            Confirm
                          </button>
                        )}
                        {b.status === "CONFIRMED" && (
                          <button
                            type="button"
                            onClick={() => updateStatus(b.id, "ACTIVE")}
                            disabled={actingId === b.id}
                            className="rounded bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            Mark active
                          </button>
                        )}
                        {(b.status === "ACTIVE" || b.status === "CONFIRMED") && (
                          <button
                            type="button"
                            onClick={() => updateStatus(b.id, "COMPLETED")}
                            disabled={actingId === b.id}
                            className="rounded bg-navy px-2 py-1 text-xs font-medium text-white hover:bg-navy/90 disabled:opacity-50"
                          >
                            Complete
                          </button>
                        )}
                        {b.status !== "CANCELLED" && b.status !== "COMPLETED" && (
                          <button
                            type="button"
                            onClick={() => confirm("Cancel this booking?") && updateStatus(b.id, "CANCELLED")}
                            disabled={actingId === b.id}
                            className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        )}
                        <Link
                          href={`/admin/bookings/${b.id}`}
                          className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && bookings.length === 0 && (
          <div className="py-12 text-center text-gray-500">No bookings match your filters.</div>
        )}
      </div>
    </div>
  );
}
