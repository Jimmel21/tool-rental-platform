"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import {
  getWhatsAppTemplateMessage,
  type WhatsAppTemplateId,
  type TemplateContext,
} from "@/lib/notifications/whatsapp-templates";

const TEMPLATE_OPTIONS: { value: WhatsAppTemplateId; label: string }[] = [
  { value: "booking_confirmation", label: "Booking confirmation" },
  { value: "payment_received", label: "Payment received" },
  { value: "rental_starting_tomorrow", label: "Rental starting tomorrow" },
  { value: "return_reminder", label: "Return reminder" },
  { value: "return_overdue", label: "Return overdue" },
];

export function AdminBookingDetailClient({
  bookingId,
  status,
  balanceDue,
  depositStatus,
  depositPaid,
  notes: initialNotes,
  notificationContext,
}: {
  bookingId: string;
  status: string;
  balanceDue: number;
  depositStatus: string | null;
  depositPaid: number;
  notes: string | null;
  notificationContext?: TemplateContext;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [actingStatus, setActingStatus] = useState(false);
  const [recordAmount, setRecordAmount] = useState("");
  const [recordMethod, setRecordMethod] = useState("CASH");
  const [recording, setRecording] = useState(false);
  const [deductAmount, setDeductAmount] = useState("");
  const [deductReason, setDeductReason] = useState("");
  const [deducting, setDeducting] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [error, setError] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplateId>("booking_confirmation");

  const saveNotes = async () => {
    setSavingNotes(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) router.refresh();
      else {
        const data = await res.json();
        setError(data.error ?? "Failed to save notes");
      }
    } finally {
      setSavingNotes(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    setActingStatus(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) router.refresh();
      else {
        const data = await res.json();
        setError(data.error ?? "Failed");
      }
    } finally {
      setActingStatus(false);
    }
  };

  const recordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(recordAmount);
    if (!(amt > 0)) return;
    setRecording(true);
    setError("");
    try {
      const res = await fetch("/api/admin/payments/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, amount: amt, method: recordMethod }),
      });
      const data = await res.json();
      if (res.ok) {
        setRecordAmount("");
        router.refresh();
      } else setError(data.error ?? "Failed");
    } finally {
      setRecording(false);
    }
  };

  const releaseDeposit = async () => {
    if (!confirm("Release deposit to customer?")) return;
    setReleasing(true);
    setError("");
    try {
      const res = await fetch("/api/admin/deposits/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      if (res.ok) router.refresh();
      else {
        const data = await res.json();
        setError(data.error ?? "Failed");
      }
    } finally {
      setReleasing(false);
    }
  };

  const deductDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(deductAmount);
    if (!(amt > 0)) return;
    setDeducting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/deposits/deduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, amount: amt, reason: deductReason || "Damage" }),
      });
      const data = await res.json();
      if (res.ok) {
        setDeductAmount("");
        setDeductReason("");
        router.refresh();
      } else setError(data.error ?? "Failed");
    } finally {
      setDeducting(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="font-semibold text-gray-900">Status</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {status === "PENDING" && (
            <button
              type="button"
              onClick={() => updateStatus("CONFIRMED")}
              disabled={actingStatus}
              className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Confirm
            </button>
          )}
          {status === "CONFIRMED" && (
            <button
              type="button"
              onClick={() => updateStatus("ACTIVE")}
              disabled={actingStatus}
              className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              Mark active
            </button>
          )}
          {(status === "ACTIVE" || status === "CONFIRMED") && (
            <button
              type="button"
              onClick={() => updateStatus("COMPLETED")}
              disabled={actingStatus}
              className="rounded bg-navy px-3 py-1.5 text-sm font-medium text-white hover:bg-navy/90 disabled:opacity-50"
            >
              Complete
            </button>
          )}
          {status !== "CANCELLED" && status !== "COMPLETED" && (
            <button
              type="button"
              onClick={() => confirm("Cancel this booking?") && updateStatus("CANCELLED")}
              disabled={actingStatus}
              className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="font-semibold text-gray-900">Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={saveNotes}
          disabled={savingNotes}
          className="mt-2 rounded bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {savingNotes ? "Saving…" : "Save notes"}
        </button>
      </div>

      {balanceDue > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Record payment</h3>
          <form onSubmit={recordPayment} className="mt-4 space-y-2">
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={recordAmount}
              onChange={(e) => setRecordAmount(e.target.value)}
              placeholder="Amount (TTD)"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <select
              value={recordMethod}
              onChange={(e) => setRecordMethod(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank transfer</option>
              <option value="CARD">Card</option>
            </select>
            <button
              type="submit"
              disabled={recording || !recordAmount}
              className="w-full rounded bg-primary py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {recording ? "Recording…" : "Record payment"}
            </button>
          </form>
        </div>
      )}

      {notificationContext && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Send via WhatsApp</h3>
          <p className="mt-1 text-sm text-gray-600">
            Open WhatsApp with a pre-filled message for the customer (manual send).
          </p>
          <div className="mt-4 space-y-2">
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value as WhatsAppTemplateId)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              {TEMPLATE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <a
              href={getWhatsAppUrl(
                getWhatsAppTemplateMessage(selectedTemplate, notificationContext)
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#25D366] px-3 py-2 text-sm font-medium text-white hover:bg-[#20BD5A]"
            >
              Send via WhatsApp
            </a>
          </div>
        </div>
      )}

      {depositStatus === "HELD" && depositPaid > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h3 className="font-semibold text-gray-900">Deposit management</h3>
          <p className="mt-1 text-sm text-gray-600">Held: {depositPaid} TTD</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={releaseDeposit}
              disabled={releasing}
              className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {releasing ? "Releasing…" : "Release deposit"}
            </button>
            <form onSubmit={deductDeposit} className="flex flex-wrap items-end gap-2">
              <div>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={depositPaid}
                  value={deductAmount}
                  onChange={(e) => setDeductAmount(e.target.value)}
                  placeholder="Amount"
                  className="w-24 rounded border border-gray-300 px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={deductReason}
                  onChange={(e) => setDeductReason(e.target.value)}
                  placeholder="Reason (e.g. damage)"
                  className="w-40 rounded border border-gray-300 px-2 py-1.5 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={deducting || !deductAmount}
                className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deducting ? "Deducting…" : "Deduct"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
