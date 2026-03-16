"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { getWhatsAppUrl, whatsAppMessageGeneral } from "@/lib/whatsapp";

const baseNavLinks = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "Browse Tools" },
];

export function MobileNav({ session }: { session: Session | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const supportHref = getWhatsAppUrl(whatsAppMessageGeneral());
  const navLinks = session
    ? [...baseNavLinks, { href: "/dashboard", label: "Dashboard" }, { href: "/api/auth/signout", label: "Log out" }]
    : [...baseNavLinks, { href: "/login", label: "Log in" }, { href: "/register", label: "Register" }];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 md:hidden"
        aria-label="Open menu"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white shadow-xl md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
              <span className="font-semibold text-navy">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
                aria-label="Close menu"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-4 py-3 text-base font-medium ${
                    pathname === link.href ? "bg-primary/10 text-primary" : "text-muted hover:bg-gray-50 hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href={supportHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-[#25D366] hover:bg-green-50"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Support (WhatsApp)
              </a>
            </nav>
          </div>
        </>
      )}
    </>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
