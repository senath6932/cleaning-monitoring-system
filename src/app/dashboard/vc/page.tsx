import Link from "next/link";

export default function VcDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.2em] text-amber-300">
            Vice Chancellor
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            VC Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Approve or reject payment recommendations after administrative
            review and keep the university payment approvals moving.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Awaiting Approval</p>
            <p className="mt-2 text-2xl font-semibold">--</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Approved</p>
            <p className="mt-2 text-2xl font-semibold">--</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Clarifications</p>
            <p className="mt-2 text-2xl font-semibold">--</p>
          </div>
        </section>

        <Link
          href="/login"
          className="w-fit rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
        >
          Back to login
        </Link>
      </div>
    </main>
  );
}

