"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PendingUser {
  id: string;
  name: string;
  email: string;
  idType: string;
  idNumber: string;
  idDocumentPath: string | null;
  createdAt: string;
}

export function VerificationsClient({ users }: { users: PendingUser[] }) {
  const router = useRouter();
  const [acting, setActing] = useState<string | null>(null); // userId being actioned
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const act = async (userId: string, action: "approve" | "reject") => {
    setActing(userId);
    setError("");
    try {
      const res = await fetch(`/api/admin/verifications/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          rejectionReason: rejectionReasons[userId]?.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.refresh();
      } else {
        setError(data.error ?? "Action failed");
      }
    } finally {
      setActing(null);
    }
  };

  if (users.length === 0) {
    return (
      <p className="mt-6 text-sm text-gray-500">No pending ID verifications.</p>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      {users.map((u) => (
        <div
          key={u.id}
          className="rounded-xl border border-gray-200 bg-white p-6 space-y-4"
        >
          {/* User details */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-900">{u.name}</p>
              <p className="text-sm text-gray-500">{u.email}</p>
              <p className="mt-2 text-sm text-gray-700">
                <span className="font-medium">{u.idType}</span> — {u.idNumber}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Submitted {new Date(u.createdAt).toLocaleDateString("en-TT")}
              </p>
            </div>

            {/* Document preview link */}
            {u.idDocumentPath && (
              <a
                href={u.idDocumentPath}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                View document ↗
              </a>
            )}
          </div>

          {/* Rejection reason input */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Rejection reason (optional — sent to customer if rejecting)
            </label>
            <input
              type="text"
              value={rejectionReasons[u.id] ?? ""}
              onChange={(e) =>
                setRejectionReasons((prev) => ({ ...prev, [u.id]: e.target.value }))
              }
              placeholder="e.g. Image is blurry, please resubmit"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              disabled={acting === u.id}
              onClick={() => act(u.id, "approve")}
              className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {acting === u.id ? "Saving…" : "Approve"}
            </button>
            <button
              type="button"
              disabled={acting === u.id}
              onClick={() => {
                if (!confirm(`Reject ${u.name}'s ID submission? This will clear their details and notify them.`)) return;
                act(u.id, "reject");
              }}
              className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {acting === u.id ? "Saving…" : "Reject"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
