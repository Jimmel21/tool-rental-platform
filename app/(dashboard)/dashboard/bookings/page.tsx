import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCustomerBookings, type BookingTab } from "@/lib/data/dashboard";
import { BookingsPageClient } from "@/app/(dashboard)/dashboard/bookings/BookingsPageClient";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function DashboardBookingsPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const sp = await searchParams;
  const tab = (sp.tab ?? "upcoming") as BookingTab;
  const validTabs: BookingTab[] = ["upcoming", "active", "completed", "cancelled"];
  const currentTab = validTabs.includes(tab) ? tab : "upcoming";

  const bookings = await getCustomerBookings(currentTab);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
      <p className="mt-1 text-gray-600">View and manage your rentals.</p>
      <BookingsPageClient
        bookings={bookings}
        currentTab={currentTab}
      />
    </div>
  );
}
