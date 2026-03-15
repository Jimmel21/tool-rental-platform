import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Container } from "@/components/layout/Container";
import { getBookingById } from "@/lib/data/booking";
import { CheckoutClient } from "@/app/(public)/checkout/[bookingId]/CheckoutClient";

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function CheckoutPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    const { bookingId } = await params;
    redirect(`/login?callbackUrl=${encodeURIComponent(`/checkout/${bookingId}`)}`);
  }

  const { bookingId } = await params;
  const booking = await getBookingById(bookingId);
  if (!booking) notFound();

  return (
    <div className="py-8">
      <Container className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <p className="mt-1 text-gray-600">Complete your payment</p>
        <CheckoutClient booking={booking} />
      </Container>
    </div>
  );
}
