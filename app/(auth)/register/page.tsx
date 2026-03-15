import Link from "next/link";
import { RegisterForm } from "@/components/forms/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
      <p className="mt-1 text-sm text-gray-600">
        Register to rent tools in Trinidad & Tobago
      </p>
      <div className="mt-6">
        <RegisterForm />
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
