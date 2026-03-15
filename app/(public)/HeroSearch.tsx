"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function HeroSearch() {
  const [q, setQ] = useState("");
  const router = useRouter();

  return (
    <form
      role="search"
      className="mx-auto max-w-xl"
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = q.trim();
        if (trimmed) router.push(`/search?q=${encodeURIComponent(trimmed)}`);
        else router.push("/tools");
      }}
    >
      <div className="flex gap-2 rounded-lg border border-gray-300 bg-white p-2 shadow-sm focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, category, or description…"
          aria-label="Search tools"
          className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0"
        />
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Search
        </button>
      </div>
    </form>
  );
}
