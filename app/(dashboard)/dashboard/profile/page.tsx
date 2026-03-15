import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProfile } from "@/lib/data/profile";
import { ProfileClient } from "@/app/(dashboard)/dashboard/profile/ProfileClient";

export const dynamic = "force-dynamic";

export default async function DashboardProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
      <p className="mt-1 text-gray-600">
        Manage your personal info and preferences.
      </p>
      <ProfileClient profile={profile} />
    </div>
  );
}
