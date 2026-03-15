import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">Forgot password</h1>
      <p className="mt-1 text-sm text-gray-600">
        We&apos;ll send reset instructions to your email
      </p>
      <div className="mt-6">
        <ForgotPasswordForm />
      </div>
      <Link
        href="/"
        className="mt-6 inline-block text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        ← Back to home
      </Link>
    </div>
  );
}
