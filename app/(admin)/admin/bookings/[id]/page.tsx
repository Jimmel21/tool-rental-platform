import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminBookingDetail } from "@/lib/data/admin-bookings";
import { formatTTD } from "@/lib/utils/currency";
import { AdminBookingDetailClient } from "@/app/(admin)/admin/bookings/[id]/AdminBookingDetailClient";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminBookingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const booking = await getAdminBookingDetail(id);
  if (!booking) notFound();

  const phoneDigits = booking.customer.phone?.replace(/\D/g, "") ?? "";
  const e164 =
    phoneDigits.length === 11 && phoneDigits.startsWith("1")
      ? phoneDigits
      : phoneDigits.length === 10
        ? `1${phoneDigits}`
        : "";
  const customerWhatsAppHref = e164 ? `https://wa.me/${e164}` : "";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/bookings" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            ← Bookings
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Booking {booking.reference}</h1>
          <p className="mt-1 text-gray-600">
            {booking.tool.name} · {booking.startDate} → {booking.endDate}
          </p>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
          {booking.status}
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold text-gray-900">Booking details</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Dates</dt>
                <dd>{booking.startDate} → {booking.endDate}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Total</dt>
                <dd className="font-medium">{formatTTD(booking.totalAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Deposit paid</dt>
                <dd>{formatTTD(booking.depositPaid)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Balance due</dt>
                <dd className="font-medium">{formatTTD(booking.balanceDue)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Delivery</dt>
                <dd>
                  {booking.deliveryOption === "PICKUP"
                    ? "Pickup"
                    : `Delivery — ${booking.deliveryAddress ?? "—"}`}
                </dd>
              </div>
              {booking.depositStatus && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Deposit status</dt>
                  <dd>{booking.depositStatus}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold text-gray-900">Payment history</h2>
            {booking.payments.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">No payments yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {booking.payments.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-3 last:border-0"
                  >
                    <span>
                      {formatTTD(p.amount)} — {p.method} ({p.status})
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(p.createdAt).toLocaleString()}
                      {p.customerDeclaredPaidAt && " · Customer declared paid"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold text-gray-900">Customer</h2>
            <p className="mt-2 font-medium text-gray-900">{booking.customer.name}</p>
            <p className="text-sm text-gray-600">{booking.customer.email}</p>
            {booking.customer.phone && (
              <p className="mt-1 text-sm text-gray-600">{booking.customer.phone}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {booking.customer.phone && (
                <a
                  href={`tel:${booking.customer.phone}`}
                  className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Call
                </a>
              )}
              {customerWhatsAppHref && (
                <a
                  href={customerWhatsAppHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded bg-[#25D366] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#20BD5A]"
                >
                  WhatsApp
                </a>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold text-gray-900">Tool</h2>
            <p className="mt-2 font-medium text-gray-900">{booking.tool.name}</p>
            <Link
              href={`/admin/tools/${booking.tool.id}`}
              className="mt-2 inline-block text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              View tool →
            </Link>
          </section>

          <AdminBookingDetailClient
            bookingId={booking.id}
            status={booking.status}
            balanceDue={booking.balanceDue}
            depositStatus={booking.depositStatus}
            depositPaid={booking.depositPaid}
            notes={booking.notes}
            notificationContext={{
              bookingReference: booking.reference,
              customerName: booking.customer.name,
              toolName: booking.tool.name,
              startDate: booking.startDate,
              endDate: booking.endDate,
              amount: formatTTD(booking.totalAmount),
            }}
          />
        </aside>
      </div>
    </div>
  );
}
