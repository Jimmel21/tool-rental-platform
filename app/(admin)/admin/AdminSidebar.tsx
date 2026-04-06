import Link from "next/link";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/tools", label: "Tools" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/verifications", label: "Verifications" },
  { href: "/admin/delivery-zones", label: "Delivery Zones" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <Link href="/admin" className="text-lg font-semibold text-gray-900">
          Admin
        </Link>
      </div>
      <nav className="space-y-1 p-4">
        {NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="block rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4">
        <Link
          href="/"
          className="block rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}
