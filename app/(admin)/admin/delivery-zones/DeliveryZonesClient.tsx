"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Zone {
  id: string;
  name: string;
  fee: number;
  estimatedDays: number;
  active: boolean;
}

export function DeliveryZonesClient({ zones: initial }: { zones: Zone[] }) {
  const router = useRouter();
  const [zones, setZones] = useState<Zone[]>(initial);
  const [editing, setEditing] = useState<Record<string, { fee: string; estimatedDays: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  const startEdit = (zone: Zone) => {
    setEditing((prev) => ({
      ...prev,
      [zone.id]: { fee: String(zone.fee), estimatedDays: String(zone.estimatedDays) },
    }));
  };

  const cancelEdit = (id: string) => {
    setEditing((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const saveEdit = async (id: string) => {
    const draft = editing[id];
    const fee = parseFloat(draft.fee);
    const estimatedDays = parseInt(draft.estimatedDays, 10);
    if (isNaN(fee) || fee < 0) { setError("Fee must be a positive number"); return; }
    if (isNaN(estimatedDays) || estimatedDays < 1) { setError("Estimated days must be at least 1"); return; }
    setError("");
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/delivery-zones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fee, estimatedDays }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Save failed"); return; }
      setZones((prev) => prev.map((z) => (z.id === id ? { ...z, fee: Number(data.fee), estimatedDays: data.estimatedDays } : z)));
      cancelEdit(id);
      router.refresh();
    } finally {
      setSaving(null);
    }
  };

  const toggleActive = async (zone: Zone) => {
    setSaving(zone.id);
    setError("");
    try {
      const res = await fetch(`/api/admin/delivery-zones/${zone.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !zone.active }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Update failed"); return; }
      setZones((prev) => prev.map((z) => (z.id === zone.id ? { ...z, active: data.active } : z)));
      router.refresh();
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="mt-6">
      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-6 py-3">Zone</th>
              <th className="px-6 py-3">Fee (TTD)</th>
              <th className="px-6 py-3">Est. Days</th>
              <th className="px-6 py-3">Active</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {zones.map((zone) => {
              const isEditing = !!editing[zone.id];
              const isSaving = saving === zone.id;
              const draft = editing[zone.id];
              return (
                <tr key={zone.id} className={zone.active ? "" : "opacity-50"}>
                  <td className="px-6 py-4 font-medium text-gray-900">{zone.name}</td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={draft.fee}
                        onChange={(e) =>
                          setEditing((prev) => ({ ...prev, [zone.id]: { ...prev[zone.id], fee: e.target.value } }))
                        }
                        className="w-24 rounded border border-gray-300 px-2 py-1 text-sm"
                      />
                    ) : (
                      <span className="text-gray-700">TT${Number(zone.fee).toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={draft.estimatedDays}
                        onChange={(e) =>
                          setEditing((prev) => ({ ...prev, [zone.id]: { ...prev[zone.id], estimatedDays: e.target.value } }))
                        }
                        className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
                      />
                    ) : (
                      <span className="text-gray-700">{zone.estimatedDays} {zone.estimatedDays === 1 ? "day" : "days"}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => toggleActive(zone)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        zone.active ? "bg-green-500" : "bg-gray-300"
                      } disabled:opacity-50`}
                      aria-label={zone.active ? "Deactivate zone" : "Activate zone"}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          zone.active ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => saveEdit(zone.id)}
                          className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isSaving ? "Saving…" : "Save"}
                        </button>
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => cancelEdit(zone.id)}
                          className="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => startEdit(zone)}
                        className="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
