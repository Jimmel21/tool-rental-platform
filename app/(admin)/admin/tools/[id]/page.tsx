import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminToolDetail } from "@/lib/data/admin-tools";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { formatTTD } from "@/lib/utils/currency";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminToolDetailPage({ params }: PageProps) {
  const { id } = await params;
  const tool = await getAdminToolDetail(id);
  if (!tool) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/tools" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            ← Tools
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{tool.name}</h1>
          <p className="mt-1 text-gray-600">
            {tool.categoryName} · {tool.brand ?? ""} {tool.model ?? ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/tools/${id}/edit`}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Edit
          </Link>
          <Link
            href={`/tools/${tool.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            View on site
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {tool.images.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto p-4">
                {tool.images.map((url, i) => (
                  <div key={i} className="h-48 w-56 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {url.startsWith("http") || url.startsWith("data:") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-gray-400">URL</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-gray-400">
                No images
              </div>
            )}
          </div>

          {/* Description */}
          {tool.description && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="font-semibold text-gray-900">Description</h2>
              <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{tool.description}</p>
            </div>
          )}

          {/* Booking history */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="font-semibold text-gray-900">Booking history</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500">Dates</th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500">Customer</th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                    <th className="px-6 py-2 text-right text-xs font-medium text-gray-500">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tool.bookings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-sm text-gray-500">
                        No bookings yet
                      </td>
                    </tr>
                  ) : (
                    tool.bookings.map((b) => (
                      <tr key={b.id}>
                        <td className="px-6 py-3 text-sm text-gray-600">
                          {b.startDate} → {b.endDate}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600">{b.customerName}</td>
                        <td className="px-6 py-3">
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                            {b.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                          {formatTTD(b.totalAmount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Maintenance log */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold text-gray-900">Maintenance log</h2>
            {tool.nextMaintenanceAt && (
              <p className="mt-2 text-sm text-gray-600">
                Next maintenance due: <strong>{tool.nextMaintenanceAt}</strong>
              </p>
            )}
            {tool.maintenanceNotes ? (
              <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 whitespace-pre-wrap">
                {tool.maintenanceNotes}
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No maintenance notes. Edit tool to add.</p>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold text-gray-900">Pricing</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Daily rate</dt>
                <dd className="font-medium"><PriceDisplay amount={tool.dailyRate} /></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Weekly rate</dt>
                <dd className="font-medium"><PriceDisplay amount={tool.weeklyRate} /></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Deposit</dt>
                <dd className="font-medium"><PriceDisplay amount={tool.depositAmount} /></dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold text-gray-900">Stats</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Total bookings</dt>
                <dd className="font-medium">{tool.bookingCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Revenue generated</dt>
                <dd className="font-medium">{formatTTD(tool.totalRevenue)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Status</dt>
                <dd>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {tool.status}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold text-gray-900">Owner</h2>
            <p className="mt-2 text-sm text-gray-600">{tool.ownerName}</p>
          </div>

          {tool.conditionNotes && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="font-semibold text-gray-900">Condition notes</h2>
              <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{tool.conditionNotes}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
