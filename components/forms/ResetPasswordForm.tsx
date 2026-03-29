"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validatePassword } from "@/lib/validations/auth";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordCheck = password ? validatePassword(password) : { valid: true };
  const strength =
    password.length >= 12
      ? "Strong"
      : password.length >= 9
        ? "Medium"
        : password.length > 0
          ? "Weak"
          : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    const pv = validatePassword(password);
    if (!pv.valid) {
      setError(pv.message ?? "Password does not meet requirements.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not reset password. Try again.");
        return;
      }
      setSuccess("Your password has been reset. Redirecting to sign in…");
      setTimeout(() => {
        router.push("/login?reset=1");
      }, 1200);
    } catch (err) {
      console.error("Reset password error:", err);
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
      {success && (
        <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          New password
        </label>
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
        {strength && (
          <p className="mt-1 text-xs text-gray-600">
            Strength:{" "}
            <span
              className={
                strength === "Strong"
                  ? "text-green-700"
                  : strength === "Medium"
                    ? "text-yellow-700"
                    : "text-red-700"
              }
            >
              {strength}
            </span>
          </p>
        )}
        {!passwordCheck.valid && (
          <p className="mt-1 text-xs text-red-700">{passwordCheck.message}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="confirm"
          className="block text-sm font-medium text-gray-700"
        >
          Confirm password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Reset password"}
      </button>
    </form>
  );
}

