import Link from "next/link";
import { getAdminStats, getRecentBookings, getToolsNeedingAttention } from "@/lib/data/admin";
import { formatTTD } from "@/lib/utils/currency";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, recentBookings, toolsAttention] = await Promise.all([
    getAdminStats(),
    getRecentBookings(10),
    getToolsNeedingAttention(5),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total tools</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{stats.totalTools}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Active rentals</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{stats.activeRentals}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Revenue this month</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {formatTTD(stats.revenueThisMonth)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Pending bookings</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
        </div>
      </div>

      {/* Revenue chart placeholder */}
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="font-semibold text-gray-900">Revenue chart</h2>
        <div className="mt-6 flex h-48 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
          Chart placeholder — integrate with your analytics
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent bookings */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Recent bookings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500">Ref</th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500">Tool</th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500">Customer</th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500">Dates</th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-6 py-2 text-right text-xs font-medium text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentBookings.map((b) => (
                  <tr key={b.id}>
                    <td className="whitespace-nowrap px-6 py-3 text-sm font-mono text-gray-900">
                      <Link href="/admin/bookings" className="hover:underline">
                        {b.reference}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{b.toolName}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{b.customerName}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {b.startDate} → {b.endDate}
                    </td>
                    <td className="px-6 py-3">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                      {formatTTD(b.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-200 px-6 py-3">
            <Link
              href="/admin/bookings"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              View all bookings →
            </Link>
          </div>
        </div>

        {/* Tools needing attention */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Tools needing attention</h2>
            <p className="mt-1 text-sm text-gray-500">
              Maintenance due or status MAINTENANCE
            </p>
          </div>
          <ul className="divide-y divide-gray-200">
            {toolsAttention.length === 0 ? (
              <li className="px-6 py-4 text-sm text-gray-500">None</li>
            ) : (
              toolsAttention.map((t) => (
                <li key={t.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <Link
                      href={`/admin/tools/${t.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {t.name}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {t.status}
                      {t.nextMaintenanceAt && ` · Maintenance due ${t.nextMaintenanceAt}`}
                    </p>
                  </div>
                  <Link
                    href={`/admin/tools/${t.id}/edit`}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Edit
                  </Link>
                </li>
              ))
            )}
          </ul>
          <div className="border-t border-gray-200 px-6 py-3">
            <Link
              href="/admin/tools"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              View all tools →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
