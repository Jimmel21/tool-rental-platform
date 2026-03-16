import { AdminBookingsClient } from "@/app/(admin)/admin/bookings/AdminBookingsClient";

export const dynamic = "force-dynamic";

export default function AdminBookingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
      <p className="mt-1 text-gray-600">View and manage all bookings.</p>
      <AdminBookingsClient />
    </div>
  );
}
