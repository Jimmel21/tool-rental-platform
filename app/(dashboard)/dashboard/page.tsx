import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDashboardStats, getCurrentAndUpcomingRentals } from "@/lib/data/dashboard";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { formatTTD } from "@/lib/utils/currency";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    ACTIVE: "bg-green-100 text-green-800",
    COMPLETED: "bg-gray-100 text-gray-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-800"}`}
    >
      {status}
    </span>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [stats, rentals] = await Promise.all([
    getDashboardStats(),
    getCurrentAndUpcomingRentals(),
  ]);

  const displayName = session.user.name ?? "Customer";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {displayName}
        </h1>
        <p className="mt-1 text-gray-600">
          Manage your rentals and bookings here.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Active rentals</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {stats?.activeRentals ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Upcoming bookings</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {stats?.upcomingBookings ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total spent</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {stats != null ? formatTTD(stats.totalSpent) : formatTTD(0)}
          </p>
        </div>
      </div>

      {/* Current / upcoming rentals */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Current & upcoming rentals
        </h2>
        {rentals && rentals.length > 0 ? (
          <div className="mt-4 space-y-4">
            {rentals.map((b) => (
              <Link
                key={b.id}
                href={`/dashboard/bookings/${b.id}`}
                className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="h-20 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {b.tool.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element -- dynamic tool images
                        <img
                          src={b.tool.images[0]}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-gray-400">
                          No image
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{b.tool.name}</p>
                      <p className="text-sm text-gray-500">
                        {b.startDate} → {b.endDate}
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        <PriceDisplay amount={b.totalAmount} />
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-gray-500">No current or upcoming rentals.</p>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-4">
        <Link
          href="/tools"
          className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Browse tools
        </Link>
        <Link
          href="/dashboard/bookings"
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          View booking history
        </Link>
      </div>
    </div>
  );
}
