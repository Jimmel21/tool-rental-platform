import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBookingDetailForDashboard } from "@/lib/data/booking-detail";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { BookingDetailClient } from "./BookingDetailClient";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function DashboardBookingDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const booking = await getBookingDetailForDashboard(id);
  if (!booking) notFound();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/bookings"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← My Bookings
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Booking {booking.reference}
          </h1>
          <p className="mt-1 text-gray-600">{booking.tool.name}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Tool image */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {booking.tool.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element -- dynamic tool image
              <img
                src={booking.tool.images[0]}
                alt={booking.tool.name}
                className="h-64 w-full object-cover"
              />
            ) : (
              <div className="flex h-64 items-center justify-center bg-gray-100 text-gray-400">
                No image
              </div>
            )}
          </div>

          {/* Booking details */}
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold text-gray-900">Booking details</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Dates</dt>
                <dd>{booking.startDate} → {booking.endDate}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Total</dt>
                <dd className="font-medium"><PriceDisplay amount={booking.totalAmount} /></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Deposit paid</dt>
                <dd><PriceDisplay amount={booking.depositPaid} /></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Balance due</dt>
                <dd><PriceDisplay amount={booking.balanceDue} /></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Delivery</dt>
                <dd>
                  {booking.deliveryOption === "PICKUP"
                    ? "Pickup"
                    : `Delivery — ${booking.deliveryAddress ?? "—"}`}
                </dd>
              </div>
              {booking.deliveryFee != null && booking.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Delivery fee</dt>
                  <dd><PriceDisplay amount={booking.deliveryFee} /></dd>
                </div>
              )}
            </dl>
          </section>

          {/* Payment history */}
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold text-gray-900">Payment history</h2>
            {booking.payments.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">No payments yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {booking.payments.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                  >
                    <span>
                      <PriceDisplay amount={p.amount} /> — {p.method} ({p.status})
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString("en-TT")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Condition checklist - placeholder for returns */}
          {(booking.status === "ACTIVE" || booking.status === "COMPLETED") && (
            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="font-semibold text-gray-900">Tool condition checklist</h2>
              <p className="mt-2 text-sm text-gray-600">
                When returning the tool, confirm: no damage, clean, and complete. Use Report issue if you notice any problems.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-gray-400">○</span> Tool returned in good condition
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gray-400">○</span> No missing parts
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gray-400">○</span> Clean and ready for next rental
                </li>
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          {booking.status === "PENDING" && Number(booking.balanceDue) > 0 && (
            <Link
              href={`/checkout/${booking.id}`}
              className="block rounded-md bg-primary px-4 py-3 text-center text-sm font-medium text-white hover:bg-primary/90"
            >
              Pay now
            </Link>
          )}

          <BookingDetailClient
            bookingId={booking.id}
            bookingReference={booking.reference}
            status={booking.status}
            hasReview={!!booking.review}
            toolSlug={booking.tool.slug}
          />
        </aside>
      </div>
    </div>
  );
}

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
      className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${styles[status] ?? "bg-gray-100 text-gray-800"}`}
    >
      {status}
    </span>
  );
}
