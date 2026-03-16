"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

const PULL_THRESHOLD = 80;
const RESISTANCE = 0.4;

interface PullToRefreshProps {
  children: React.ReactNode;
  className?: string;
}

export function PullToRefresh({ children, className = "" }: PullToRefreshProps) {
  const router = useRouter();
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (refreshing || startY.current === 0) return;
    const el = containerRef.current;
    if (!el || el.scrollTop > 0) return;
    const y = e.touches[0].clientY;
    const diff = (y - startY.current) * RESISTANCE;
    if (diff > 0) setPull(Math.min(diff, PULL_THRESHOLD * 1.5));
  }, [refreshing]);

  const handleTouchEnd = useCallback(() => {
    if (refreshing) return;
    if (pull >= PULL_THRESHOLD) {
      setRefreshing(true);
      setPull(0);
      router.refresh();
      const t = setTimeout(() => {
        setRefreshing(false);
      }, 600);
      return () => clearTimeout(t);
    }
    setPull(0);
    startY.current = 0;
  }, [pull, refreshing, router]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => { setPull(0); startY.current = 0; }}
    >
      {refreshing && (
        <div className="flex justify-center py-3 text-sm text-gray-500">
          Refreshing…
        </div>
      )}
      {pull > 0 && !refreshing && (
        <div
          className="flex justify-center py-2 text-sm text-gray-500"
          style={{ transform: `translateY(${Math.min(pull, 60)}px)` }}
        >
          {pull >= PULL_THRESHOLD ? "Release to refresh" : "Pull to refresh"}
        </div>
      )}
      {children}
    </div>
  );
}
