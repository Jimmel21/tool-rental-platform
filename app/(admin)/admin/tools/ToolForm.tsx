"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Category = { id: string; name: string };
type Partner = { id: string; name: string };
type ToolInitial = {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  brand: string | null;
  model: string | null;
  dailyRate: number;
  weeklyRate: number;
  depositAmount: number;
  images: string[];
  status: string;
  ownerId: string;
  conditionNotes: string | null;
  gpsTrackerId: string | null;
  nextMaintenanceAt: string | null;
  maintenanceNotes: string | null;
} | null;

export function ToolForm({
  initial,
  categories,
  partners,
}: {
  initial: ToolInitial;
  categories: Category[];
  partners: Partner[];
}) {
  const router = useRouter();
  const isEdit = !!initial;

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [model, setModel] = useState(initial?.model ?? "");
  const [dailyRate, setDailyRate] = useState(String(initial?.dailyRate ?? ""));
  const [weeklyRate, setWeeklyRate] = useState(String(initial?.weeklyRate ?? ""));
  const [depositAmount, setDepositAmount] = useState(String(initial?.depositAmount ?? ""));
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState(initial?.status ?? "AVAILABLE");
  const [ownerId, setOwnerId] = useState(initial?.ownerId ?? "");
  const [conditionNotes, setConditionNotes] = useState(initial?.conditionNotes ?? "");
  const [gpsTrackerId, setGpsTrackerId] = useState(initial?.gpsTrackerId ?? "");
  const [nextMaintenanceAt, setNextMaintenanceAt] = useState(
    initial?.nextMaintenanceAt ?? ""
  );
  const [maintenanceNotes, setMaintenanceNotes] = useState(
    initial?.maintenanceNotes ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const addImage = () => {
    const url = imageUrl.trim();
    if (url && !images.includes(url)) {
      setImages((prev) => [...prev, url]);
      setImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        categoryId: categoryId || null,
        brand: brand.trim() || null,
        model: model.trim() || null,
        dailyRate: Number(dailyRate) || 0,
        weeklyRate: Number(weeklyRate) || 0,
        depositAmount: Number(depositAmount) || 0,
        images,
        status,
        ownerId: ownerId || null,
        conditionNotes: conditionNotes.trim() || null,
        gpsTrackerId: gpsTrackerId.trim() || null,
        nextMaintenanceAt: nextMaintenanceAt.trim() || null,
        maintenanceNotes: maintenanceNotes.trim() || null,
      };

      if (isEdit) {
        const res = await fetch(`/api/admin/tools/${initial!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error ?? "Failed to update");
          return;
        }
        router.push(`/admin/tools/${initial!.id}`);
        router.refresh();
      } else {
        const res = await fetch("/api/admin/tools/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error ?? "Failed to create");
          return;
        }
        router.push(`/admin/tools/${data.id}`);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Category *</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Owner (partner) *</label>
          <select
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            required
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          >
            <option value="">Select owner</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Brand</label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Model</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Daily rate (TTD) *</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={dailyRate}
            onChange={(e) => setDailyRate(e.target.value)}
            required
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Weekly rate (TTD)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={weeklyRate}
            onChange={(e) => setWeeklyRate(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Deposit (TTD)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        >
          <option value="AVAILABLE">Available</option>
          <option value="RENTED">Rented</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="RETIRED">Retired</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Images (URLs)</label>
        <p className="mt-1 text-xs text-gray-500">
          Add image URLs for now. File upload can be integrated later.
        </p>
        <div className="mt-2 flex gap-2">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={addImage}
            className="rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Add
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative">
              <div className="h-16 w-20 overflow-hidden rounded border bg-gray-100">
                {url.startsWith("data:") || url.startsWith("http") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-400">URL</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Condition notes</label>
        <textarea
          value={conditionNotes}
          onChange={(e) => setConditionNotes(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">GPS tracker ID</label>
        <input
          type="text"
          value={gpsTrackerId}
          onChange={(e) => setGpsTrackerId(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="font-medium text-gray-900">Maintenance schedule</h3>
        <div className="mt-3 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Next maintenance date
            </label>
            <input
              type="date"
              value={nextMaintenanceAt}
              onChange={(e) => setNextMaintenanceAt(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Maintenance notes / log
            </label>
            <textarea
              value={maintenanceNotes}
              onChange={(e) => setMaintenanceNotes(e.target.value)}
              rows={3}
              placeholder="Past repairs, inspections..."
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create tool"}
        </button>
        <Link
          href={isEdit ? `/admin/tools/${initial!.id}` : "/admin/tools"}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
