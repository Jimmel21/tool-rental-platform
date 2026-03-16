"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

type User = { name?: string | null; email?: string | null };

export function AdminHeader({ user }: { user: User }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {user.name ?? user.email ?? "Admin"}
        </span>
        <Link
          href="#"
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          title="Notifications"
        >
          <span className="sr-only">Notifications</span>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
