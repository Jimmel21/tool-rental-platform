"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PriceDisplay } from "@/components/ui/PriceDisplay";

type Category = { id: string; name: string; slug: string };
type Partner = { id: string; name: string };
type ToolRow = {
  id: string;
  slug: string;
  name: string;
  categoryName: string;
  dailyRate: number;
  status: string;
  imageUrl: string | null;
  ownerName: string;
  bookingCount: number;
};

export function AdminToolsClient({
  categories,
  partners,
}: {
  categories: Category[];
  partners: Partner[];
}) {
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [tools, setTools] = useState<ToolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (categoryId) params.set("categoryId", categoryId);
    if (status) params.set("status", status);
    if (ownerId) params.set("ownerId", ownerId);
    if (searchDebounced) params.set("search", searchDebounced);
    fetch(`/api/admin/tools?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setTools(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  }, [categoryId, status, ownerId, searchDebounced]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === tools.length) setSelected(new Set());
    else setSelected(new Set(tools.map((t) => t.id)));
  };

  const handleBulkStatus = async () => {
    if (!bulkStatus || selected.size === 0) return;
    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/tools/bulk-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolIds: Array.from(selected), status: bulkStatus }),
      });
      if (res.ok) {
        setSelected(new Set());
        setBulkStatus("");
        const params = new URLSearchParams();
        if (categoryId) params.set("categoryId", categoryId);
        if (status) params.set("status", status);
        if (ownerId) params.set("ownerId", ownerId);
        if (searchDebounced) params.set("search", searchDebounced);
        const r = await fetch(`/api/admin/tools?${params}`);
        const data = await r.json();
        setTools(Array.isArray(data) ? data : []);
      }
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
        <input
          type="search"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="RENTED">Rented</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="RETIRED">Retired</option>
        </select>
        <select
          value={ownerId}
          onChange={(e) => setOwnerId(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All owners</option>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-amber-50 px-4 py-3">
          <span className="text-sm font-medium text-gray-700">
            {selected.size} selected
          </span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">Change status to...</option>
            <option value="AVAILABLE">Available</option>
            <option value="RENTED">Rented</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="RETIRED">Retired</option>
          </select>
          <button
            type="button"
            onClick={handleBulkStatus}
            disabled={!bulkStatus || bulkLoading}
            className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {bulkLoading ? "Applying…" : "Apply"}
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={tools.length > 0 && selected.size === tools.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Daily rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Utilization</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tools.map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(t.id)}
                        onChange={() => toggleSelect(t.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <div className="h-10 w-12 overflow-hidden rounded bg-gray-100">
                        {t.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={t.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900">{t.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{t.categoryName}</td>
                    <td className="px-6 py-3 text-sm">
                      <PriceDisplay amount={t.dailyRate} />
                    </td>
                    <td className="px-6 py-3">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{t.bookingCount} bookings</td>
                    <td className="px-6 py-3 text-right">
                      <Link
                        href={`/admin/tools/${t.id}`}
                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                      >
                        View
                      </Link>
                      <span className="mx-2 text-gray-300">|</span>
                      <Link
                        href={`/admin/tools/${t.id}/edit`}
                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && tools.length === 0 && (
          <div className="py-12 text-center text-gray-500">No tools match your filters.</div>
        )}
      </div>
    </div>
  );
}
