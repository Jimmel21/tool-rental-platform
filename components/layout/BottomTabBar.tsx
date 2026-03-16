"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/tools", label: "Browse", icon: BrowseIcon },
  { href: "/dashboard/bookings", label: "Bookings", icon: BookingsIcon },
  { href: "/dashboard/profile", label: "Profile", icon: ProfileIcon },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white safe-area-pb md:hidden"
      aria-label="Main navigation"
    >
      <div className="flex h-16 items-center justify-around">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : href === "/tools"
                ? pathname.startsWith("/tools") && pathname !== "/dashboard"
                : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs ${
                isActive ? "text-gray-900 font-medium" : "text-gray-500"
              }`}
            >
              <Icon className="h-6 w-6 shrink-0" active={isActive} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ className }: { className?: string; active?: boolean }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}
function BrowseIcon({ className }: { className?: string; active?: boolean }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
    </svg>
  );
}
function BookingsIcon({ className }: { className?: string; active?: boolean }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function ProfileIcon({ className }: { className?: string; active?: boolean }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
