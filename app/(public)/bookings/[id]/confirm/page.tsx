import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Container } from "@/components/layout/Container";
import { getBookingById } from "@/lib/data/booking";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { whatsAppMessageBookingQuestion } from "@/lib/whatsapp";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingConfirmPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    const { id } = await params;
    redirect(`/login?callbackUrl=${encodeURIComponent(`/bookings/${id}/confirm`)}`);
  }
  const { id } = await params;
  const booking = await getBookingById(id);
  if (!booking) notFound();

  return (
    <div className="py-12">
      <Container className="max-w-2xl">
        <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
          <h1 className="text-2xl font-bold text-navy">Booking confirmed</h1>
          <p className="mt-2 text-green-800">Your booking has been created successfully.</p>
          <p className="mt-4 font-mono text-xl font-semibold text-navy">
            Reference: {booking.reference}
          </p>
        </div>

        <div className="mt-6 rounded-xl border-2 border-[#25D366] bg-[#dcfce7] p-6 text-center">
          <p className="font-semibold text-navy">Questions? Message us on WhatsApp</p>
          <p className="mt-1 text-sm text-muted">We&apos;ll open WhatsApp with your booking reference pre-filled.</p>
          <div className="mt-4 flex justify-center">
            <WhatsAppButton
              message={whatsAppMessageBookingQuestion(booking.reference)}
              size="lg"
            >
              Message us on WhatsApp
            </WhatsAppButton>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-navy">Booking details</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Tool</dt>
              <dd>
                <Link href={`/tools/${booking.tool.slug}`} className="font-medium text-primary hover:underline">
                  {booking.tool.name}
                </Link>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Dates</dt>
              <dd>{booking.startDate} to {booking.endDate}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd>{booking.deliveryOption === "PICKUP" ? "Pickup" : `Delivery — ${booking.deliveryAddress ?? ""}`}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Total</dt>
              <dd className="font-medium"><PriceDisplay amount={booking.totalAmount} /></dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-navy">Next steps</h2>
          <ol className="mt-4 list-inside list-decimal space-y-2 text-sm text-navy">
            <li>Complete payment to confirm your booking. We will send payment instructions to your email.</li>
            <li>Once payment is received, the owner will contact you with pickup location or delivery details.</li>
            <li>Collect or receive the tool on the start date and return by the end date.</li>
          </ol>
        </div>

        {booking.status === "PENDING" && Number(booking.balanceDue) > 0 && (
          <div className="mt-8">
            <Link
              href={`/checkout/${booking.id}`}
              className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary/90"
            >
              Pay now
            </Link>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md border border-primary bg-white px-5 py-3 text-sm font-medium text-primary hover:bg-primary/5"
          >
            Go to dashboard
          </Link>
        </div>
      </Container>
    </div>
  );
}
