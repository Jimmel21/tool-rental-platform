"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  /** Debounce ms */
  debounceMs?: number;
  /** Submit to this path with ?q= */
  searchPath?: string;
}

export function SearchBar({
  placeholder = "Search tools…",
  className = "",
  debounceMs = 300,
  searchPath = "/search",
}: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const submitSearch = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      if (trimmed) router.push(`${searchPath}?q=${encodeURIComponent(trimmed)}`);
    },
    [router, searchPath]
  );

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!value.trim()) return;
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      // Optional: could trigger a callback for inline suggestions instead of navigate
    }, debounceMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, debounceMs]);

  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        submitSearch(value);
      }}
      role="search"
    >
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search tools"
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-navy shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <button
        type="submit"
        className="sr-only"
      >
        Search
      </button>
    </form>
  );
}
