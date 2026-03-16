"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/bookings", label: "My Bookings" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/", label: "Home" },
];

export function DashboardNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 md:hidden"
        aria-label="Open menu"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <nav className="hidden items-center gap-4 md:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium ${
              pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                ? "text-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 md:hidden" aria-hidden onClick={() => setOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white shadow-xl md:hidden" role="dialog" aria-modal="true">
            <div className="flex h-14 items-center justify-between border-b px-4">
              <span className="font-semibold">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-4 py-3 text-base font-medium ${
                    pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
