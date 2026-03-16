import { AdminPaymentsClient } from "@/app/(admin)/admin/payments/AdminPaymentsClient";

export const dynamic = "force-dynamic";

export default function AdminPaymentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
      <p className="mt-1 text-gray-600">View payments, verify bank transfers, manage deposits.</p>
      <AdminPaymentsClient />
    </div>
  );
}
