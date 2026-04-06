"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { ProfileData } from "@/lib/data/profile";

const ID_TYPES = ["National ID", "Passport", "Driver's Permit"] as const;

export function ProfileClient({ profile }: { profile: ProfileData }) {
  const router = useRouter();
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [address, setAddress] = useState(profile.address ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ID verification form state
  const [idType, setIdType] = useState<string>(profile.idType ?? "");
  const [idNumber, setIdNumber] = useState(profile.idNumber ?? "");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idSubmitting, setIdSubmitting] = useState(false);
  const [idMessage, setIdMessage] = useState("");
  const [idError, setIdError] = useState("");
  const [idSubmitted, setIdSubmitted] = useState(
    !!(profile.idType && profile.idNumber && !profile.idVerified)
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || null,
          address: address.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage("Profile updated.");
        router.refresh();
      } else {
        setError(data.error ?? "Failed to update profile");
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    setChangingPassword(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage("Password updated.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(data.error ?? "Failed to change password");
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSubmitId = async (e: React.FormEvent) => {
    e.preventDefault();
    setIdError("");
    setIdMessage("");
    if (!idType || !idNumber.trim()) {
      setIdError("Please fill in all fields.");
      return;
    }
    if (!idFile) {
      setIdError("Please attach a document image or PDF.");
      return;
    }
    setIdSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("idType", idType);
      fd.append("idNumber", idNumber.trim());
      fd.append("document", idFile);
      const res = await fetch("/api/user/verify-id", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setIdMessage("Submitted! Our team will review your document within 1–2 business days.");
        setIdSubmitted(true);
        router.refresh();
      } else {
        setIdError(data.error ?? "Failed to submit. Please try again.");
      }
    } finally {
      setIdSubmitting(false);
    }
  };

  return (
    <div className="mt-8 space-y-8">
      {message && (
        <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Personal info */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Personal information</h2>
        <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-600">{profile.email}</p>
            <p className="text-xs text-gray-500">Email cannot be changed here.</p>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 868 XXX XXXX"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Primary address
            </label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              placeholder="Street, area, landmark (for delivery)"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={savingProfile}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {savingProfile ? "Saving…" : "Save changes"}
          </button>
        </form>
      </section>

      {/* Change password */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Change password</h2>
        <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
              Current password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
            <p className="mt-1 text-xs text-gray-500">
              Min 8 characters, 1 number, 1 uppercase letter.
            </p>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={changingPassword}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {changingPassword ? "Updating…" : "Update password"}
          </button>
        </form>
      </section>

      {/* ID verification */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">ID verification</h2>

        {/* Status badge */}
        <div className="mt-3 flex items-center gap-3">
          {profile.idVerified ? (
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
              ✓ Verified
            </span>
          ) : idSubmitted ? (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              Under review
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
              Not verified
            </span>
          )}
        </div>

        {/* Verified: show submitted details, no form */}
        {profile.idVerified && profile.idType && (
          <p className="mt-2 text-sm text-gray-600">
            {profile.idType}{profile.idNumber ? ` — ${profile.idNumber}` : ""}
          </p>
        )}

        {/* Pending review: show what was submitted */}
        {!profile.idVerified && idSubmitted && (
          <div className="mt-3 space-y-1">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Type:</span> {profile.idType ?? idType}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Number:</span> {profile.idNumber ?? idNumber}
            </p>
            {idMessage && (
              <p className="mt-2 text-sm text-green-700">{idMessage}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Our team will review your document within 1–2 business days.
            </p>
            <button
              type="button"
              className="mt-3 text-xs text-primary underline"
              onClick={() => {
                setIdSubmitted(false);
                setIdMessage("");
                setIdError("");
              }}
            >
              Resubmit with different details
            </button>
          </div>
        )}

        {/* Submission form: not yet verified and not pending */}
        {!profile.idVerified && !idSubmitted && (
          <form onSubmit={handleSubmitId} className="mt-4 space-y-4">
            <p className="text-sm text-gray-500">
              Submit a government-issued ID to unlock all rental features. Your document is reviewed by our team and kept private.
            </p>

            {idError && (
              <p className="text-sm text-red-600">{idError}</p>
            )}

            <div>
              <label htmlFor="idType" className="block text-sm font-medium text-gray-700">
                ID type
              </label>
              <select
                id="idType"
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                required
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Select type…</option>
                {ID_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700">
                ID number
              </label>
              <input
                id="idNumber"
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                required
                placeholder="e.g. 12345678"
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Document image or PDF
              </label>
              <p className="mt-0.5 text-xs text-gray-500">JPG, PNG, WebP or PDF · Max 5 MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                required
                onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
                className="mt-1 block w-full text-sm text-gray-600 file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
              />
              {idFile && (
                <p className="mt-1 text-xs text-gray-500">{idFile.name} ({(idFile.size / 1024).toFixed(0)} KB)</p>
              )}
            </div>

            <button
              type="submit"
              disabled={idSubmitting}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {idSubmitting ? "Submitting…" : "Submit for verification"}
            </button>
          </form>
        )}
      </section>

      {/* Saved addresses - single primary address from User.address */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Saved addresses</h2>
        <p className="mt-2 text-sm text-gray-600">
          Your primary address is used for delivery. Update it in Personal information above.
        </p>
        <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-700">Primary address</p>
          <p className="mt-1 text-sm text-gray-600">
            {profile.address || "Not set"}
          </p>
        </div>
      </section>

      {/* Notification preferences - placeholder */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Notification preferences</h2>
        <p className="mt-2 text-sm text-gray-600">
          Email and SMS notification options will be available here soon.
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <span className="rounded bg-gray-100 px-2 py-1">Coming soon</span>
        </div>
      </section>
    </div>
  );
}
