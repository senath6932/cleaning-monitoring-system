"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PasswordInput } from "@/components/ui/password-input";

type Profile = {
  fullName: string;
  email: string;
  role: string;
  designation: string | null;
  department: string | null;
};

export default function ProfileSettingsPage() {
  const { update } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [designation, setDesignation] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");

  useEffect(() => {
    let ignore = false;

    fetch("/api/profile", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Failed to load profile.");
        }

        return data as Profile;
      })
      .then((data) => {
        if (!ignore) {
          setProfile(data);
          setFullName(data.fullName);
          setDesignation(data.designation || "");
        }
      })
      .catch((error: Error) => {
        if (!ignore) showMessage(error.message, "error");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  function showMessage(text: string, tone: "success" | "error") {
    setMessageTone(tone);
    setMessage(text);
  }

  async function updateProfile(payload: Record<string, string>) {
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Failed to update profile.");
    }

    return data as {
      fullName: string;
      designation: string | null;
      message: string;
    };
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingName(true);
    setMessage("");

    try {
      const data = await updateProfile({ fullName, designation });
      setProfile((current) =>
        current
          ? {
              ...current,
              fullName: data.fullName,
              designation: data.designation,
            }
          : current
      );
      setFullName(data.fullName);
      setDesignation(data.designation || "");
      await update();
      showMessage(data.message, "success");
    } catch (error) {
      showMessage((error as Error).message, "error");
    } finally {
      setSavingName(false);
    }
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingPassword(true);
    setMessage("");

    try {
      const data = await updateProfile({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showMessage(data.message, "success");
    } catch (error) {
      showMessage((error as Error).message, "error");
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return <div className="p-6 text-slate-700">Loading profile settings...</div>;
  }

  if (!profile) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {message || "Profile could not be loaded."}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">
          Profile Settings
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Update your name, position, or account password.
        </p>
      </header>

      {message && (
        <div
          className={`rounded-xl border p-4 text-sm font-medium ${
            messageTone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Account Details</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <ReadOnlyField label="Email" value={profile.email} />
          <ReadOnlyField label="Role" value={profile.role} />
          <ReadOnlyField label="Department" value={profile.department || "-"} />
        </div>
      </section>

      <form
        onSubmit={saveProfile}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-bold text-slate-900">Edit Profile</h2>
        <p className="mt-1 text-xs text-slate-500">
          Your name and position appear in the user menu and system records.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <ProfileField
            label="Full Name"
            value={fullName}
            onChange={setFullName}
          />
          <ProfileField
            label="Position / Designation"
            value={designation}
            onChange={setDesignation}
          />
        </div>
        <button
          type="submit"
          disabled={
            savingName ||
            (fullName.trim() === profile.fullName &&
              designation.trim() === (profile.designation || ""))
          }
          className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {savingName ? "Saving..." : "Save Profile"}
        </button>
      </form>

      <form
        onSubmit={savePassword}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-bold text-slate-900">Change Password</h2>
        <p className="mt-1 text-xs text-slate-500">
          Confirm your current password before choosing a new one.
        </p>
        <div className="mt-5 grid gap-4">
          <PasswordField
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
          />
          <PasswordField
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            minLength={8}
          />
          <PasswordField
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            minLength={8}
          />
        </div>
        <button
          type="submit"
          disabled={savingPassword}
          className="mt-5 rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-900 disabled:opacity-50"
        >
          {savingPassword ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-700">{value}</p>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  minLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minLength?: number;
}) {
  return (
    <PasswordInput
      label={label}
      value={value}
      onChange={onChange}
      minLength={minLength}
      autoComplete={label === "Current Password" ? "current-password" : "new-password"}
      required
      inputClassName="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-11 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    />
  );
}

function ProfileField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        minLength={2}
        maxLength={100}
        required
        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}
