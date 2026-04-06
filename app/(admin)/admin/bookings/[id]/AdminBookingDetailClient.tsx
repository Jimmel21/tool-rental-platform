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
  const [holding, setHolding] = useState(false);
  const [condition, setCondition] = useState<"" | "Excellent" | "Good" | "Damaged" | "Missing">("");
  const [damageNotes, setDamageNotes] = useState("");
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

  const holdDeposit = async () => {
    setHolding(true);
    setError("");
    try {
      const res = await fetch("/api/admin/deposits/held", {
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
      setHolding(false);
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
      const reason =
        deductReason.trim() ||
        (condition ? `Condition: ${condition}${damageNotes ? ` — ${damageNotes}` : ""}` : "Damage");
      const res = await fetch("/api/admin/deposits/deduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, amount: amt, reason }),
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

      {(status === "ACTIVE" || status === "COMPLETED") && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
          <h3 className="font-semibold text-gray-900">Return condition</h3>

          {/* Condition picker */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Tool condition on return</p>
            <div className="flex flex-wrap gap-2">
              {(["Excellent", "Good", "Damaged", "Missing"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setCondition(condition === opt ? "" : opt)}
                  className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                    condition === opt
                      ? opt === "Excellent" || opt === "Good"
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-red-600 bg-red-600 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {opt === "Excellent" && "✓ "}
                  {opt === "Good" && "✓ "}
                  {opt === "Damaged" && "⚠ "}
                  {opt === "Missing" && "✕ "}
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Damage notes — shown when condition warrants it */}
          {(condition === "Damaged" || condition === "Missing") && (
            <div>
              <label htmlFor="damage-notes" className="block text-sm font-medium text-gray-700 mb-1">
                Damage / missing notes
              </label>
              <textarea
                id="damage-notes"
                rows={3}
                value={damageNotes}
                onChange={(e) => setDamageNotes(e.target.value)}
                placeholder="Describe the damage or missing items…"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          )}

          {/* Deposit status summary */}
          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-sm">
            <span className="text-gray-600">Deposit status</span>
            <span
              className={`font-medium ${
                depositStatus === "HELD"
                  ? "text-amber-700"
                  : depositStatus === "RELEASED"
                    ? "text-green-700"
                    : depositStatus === "DEDUCTED"
                      ? "text-red-700"
                      : "text-gray-500"
              }`}
            >
              {depositStatus ?? "—"}
              {depositStatus === "HELD" && depositPaid > 0 && ` · ${depositPaid} TTD`}
            </span>
          </div>

          {/* Deposit actions */}
          <div className="space-y-3">
            {/* Hold — available when deposit is paid but not yet formally held */}
            {depositPaid > 0 && !depositStatus && (
              <button
                type="button"
                onClick={holdDeposit}
                disabled={holding}
                className="w-full rounded bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {holding ? "Holding…" : `Hold Deposit (${depositPaid} TTD)`}
              </button>
            )}

            {/* Release + Deduct — available while HELD */}
            {depositStatus === "HELD" && depositPaid > 0 && (
              <>
                <button
                  type="button"
                  onClick={releaseDeposit}
                  disabled={releasing}
                  className="w-full rounded bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {releasing ? "Releasing…" : `Release Deposit (${depositPaid} TTD)`}
                </button>

                <form onSubmit={deductDeposit} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      max={depositPaid}
                      value={deductAmount}
                      onChange={(e) => setDeductAmount(e.target.value)}
                      placeholder={`Amount (max ${depositPaid})`}
                      className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={deducting || !deductAmount}
                      className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {deducting ? "Deducting…" : "Deduct from Deposit"}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={deductReason}
                    onChange={(e) => setDeductReason(e.target.value)}
                    placeholder={
                      condition
                        ? `Reason (default: ${condition}${damageNotes ? ` — ${damageNotes.slice(0, 40)}` : ""})`
                        : "Reason for deduction"
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  />
                </form>
              </>
            )}

            {/* Terminal states */}
            {depositStatus === "RELEASED" && (
              <p className="text-sm text-green-700 font-medium">Deposit has been released to the customer.</p>
            )}
            {depositStatus === "DEDUCTED" && (
              <p className="text-sm text-red-700 font-medium">Deposit has been fully deducted.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
