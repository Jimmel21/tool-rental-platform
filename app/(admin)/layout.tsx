import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/app/(admin)/admin/AdminSidebar";
import { AdminHeader } from "@/app/(admin)/admin/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="pl-64">
        <AdminHeader user={session.user} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
