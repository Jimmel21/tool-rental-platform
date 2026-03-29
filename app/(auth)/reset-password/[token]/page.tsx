import { redirect } from "next/navigation";
import { validateResetToken } from "@/lib/auth/password-reset";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function ResetPasswordPage({ params }: PageProps) {
  const { token } = await params;

  if (!token) {
    redirect("/forgot-password");
  }

  const result = await validateResetToken(token);

  if (!result.valid || !result.email) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Reset link expired</h1>
        <p className="mt-2 text-sm text-gray-600">
          This password reset link is invalid or has expired. You can request a new
          link and try again.
        </p>
        <a
          href="/forgot-password"
          className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
        >
          Request a new reset link
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">Choose a new password</h1>
      <p className="mt-1 text-sm text-gray-600">
        Your new password must be at least 8 characters, with at least one number and
        one uppercase letter.
      </p>
      <div className="mt-6">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}

