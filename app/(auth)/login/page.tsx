import Link from "next/link";
import { LoginForm } from "@/components/forms/LoginForm";
import { Suspense } from "react";
import { LoginSuccessMessage } from "./LoginSuccessMessage";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">Log in</h1>
      <p className="mt-1 text-sm text-gray-600">
        Sign in to your Tool Rental TT account
      </p>
      {params.registered === "1" && <LoginSuccessMessage />}
      <div className="mt-6">
        <Suspense fallback={<div className="animate-pulse text-gray-500">Loading…</div>}>
          <LoginForm />
        </Suspense>
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
