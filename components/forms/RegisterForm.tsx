"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PASSWORD_REQUIREMENTS =
  "At least 8 characters, one number, and one uppercase letter. Trinidad & Tobago phone: +1 868 XXX XXXX.";

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!acceptTerms) {
      setError("You must accept the terms and conditions.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          name: name.trim(),
          phone: phone.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Registration failed. Please try again.");
        setLoading(false);
        return;
      }
      router.push("/login?registered=1");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div
          role="alert"
          className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Full name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone <span className="text-gray-500">(Trinidad & Tobago)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+1 868 123 4567"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <p className="mt-0.5 text-xs text-gray-500">{PASSWORD_REQUIREMENTS}</p>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      </div>
      <div className="flex items-start gap-3">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          required
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
        />
        <label htmlFor="terms" className="text-sm text-gray-700">
          I accept the{" "}
          <Link href="/terms" className="font-medium text-gray-900 underline hover:no-underline">
            terms and conditions
          </Link>{" "}
          and privacy policy.
        </label>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-gray-900 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
