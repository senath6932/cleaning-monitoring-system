"use client";

import { useState, type FormEvent } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PasswordInput } from "@/components/ui/password-input";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        const session = await getSession();
        router.push(
          session?.user?.role === "General Administration Officer"
            ? "/dashboard/gaa"
            : session?.user?.role === "Evaluating Officer"
              ? "/dashboard/officer"
              : session?.user?.role === "Administration Officer"
                ? "/dashboard/admin"
            : "/dashboard"
        );
        return;
      }

      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1440px] overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)]">
        <section className="relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-sky-950 via-blue-900 to-indigo-700 px-5 py-10 text-white sm:px-8 lg:px-12 lg:py-12">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute left-[-8%] top-[-10%] h-56 w-56 rounded-full bg-cyan-300 blur-3xl" />
            <div className="absolute bottom-[-12%] right-[-8%] h-72 w-72 rounded-full bg-blue-400 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.08)_0%,transparent_40%)]" />
          </div>

          <div className="relative z-10 flex w-full max-w-xl flex-col items-center text-center">
            <div className="flex items-center justify-center rounded-[2rem] bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.28)] ring-8 ring-white/15 sm:p-5">
              <Image
                src="/assets/university-logo.png"
                alt="University logo"
                width={905}
                height={1255}
                priority
                className="h-auto w-28 object-contain sm:w-36 lg:w-40"
              />
            </div>

            <div className="mt-8 max-w-lg space-y-4">
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                Cleaning Management System
              </h1>
              <p className="mx-auto max-w-xl text-sm leading-6 text-slate-100/85 sm:text-base lg:text-lg">
                University operations dashboard for cleaning, evaluations, reports, and approvals.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-slate-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
          <form
            onSubmit={handleLogin}
            className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl sm:p-8"
          >
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-700">
                User Login
              </p>
              <h3 className="mt-2 text-3xl font-bold text-slate-900">
                Welcome back
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to manage cleaning operations, reviews, and approvals.
              </p>
            </div>

            {error ? (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <label className="mb-4 block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </span>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                suppressHydrationWarning
                autoComplete="email"
              />
            </label>

            <PasswordInput
              label="Password"
              value={password}
              onChange={setPassword}
              placeholder="Enter your password"
              autoComplete="current-password"
              suppressHydrationWarning
              className="mb-4"
              labelClassName="block text-sm font-medium text-slate-700"
              inputClassName="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
            />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  defaultChecked
                />
                Remember me
              </label>

              <span className="text-sky-700">Need help? Contact admin</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-700 to-sky-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-blue-200 transition hover:from-blue-800 hover:to-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
              suppressHydrationWarning
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
