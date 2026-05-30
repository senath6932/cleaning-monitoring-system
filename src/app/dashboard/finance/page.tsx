import Link from "next/link";

export default function FinanceDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">
            Finance Officer
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Finance Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Process approved payments, track vouchers and cheques, and maintain
            the final payment ledger.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Payments Pending</p>
            <p className="mt-2 text-2xl font-semibold">--</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Processed This Month</p>
            <p className="mt-2 text-2xl font-semibold">--</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Voucher Queue</p>
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

