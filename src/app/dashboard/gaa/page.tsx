"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import UserMenu from "@/components/layout/user-menu";

type DashboardData = {
  generatedAt: string;
  year: number;
  month: number;
  stats: {
    totalUsers: number;
    totalLocations: number;
    totalEvaluations: number;
    pendingReviews: number;
    pendingVCApprovals: number;
    approvedReports: number;
    assignedOfficers: number;
    monthlyContractAmount: number;
  };
  monthlyProgress: Array<{
    month: number;
    percentage: number;
    reports: number;
  }>;
  locations: Array<{
    id: string;
    code: string;
    name: string;
    officer: string;
    completion: number;
    reportStatus: string;
    reportMonth: number | null;
    reportYear: number | null;
  }>;
};

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const toneClasses: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  violet: "bg-violet-50 text-violet-600",
  cyan: "bg-cyan-50 text-cyan-600",
  amber: "bg-amber-50 text-amber-600",
  indigo: "bg-indigo-50 text-indigo-600",
  orange: "bg-orange-50 text-orange-600",
};

export default function GaaDashboardPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.role !== "General Administration Officer") return;

    let ignore = false;

    fetch("/api/gaa/dashboard", { cache: "no-store" })
      .then(async (response) => {
        const contentType = response.headers.get("content-type") || "";
        const payload = contentType.includes("application/json")
          ? await response.json().catch(() => ({}))
          : { message: await response.text() };
        if (!response.ok) throw new Error(payload.message || "Failed to load dashboard");
        return payload as DashboardData;
      })
      .then((payload) => {
        if (!ignore) setData(payload);
      })
      .catch((reason: Error) => {
        if (!ignore) setError(reason.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [session?.user?.role, status]);

  if (session?.user?.role !== "General Administration Officer") {
    if (status === "loading") return <DashboardLoading />;
    return <MessagePanel title="Access denied" message="This dashboard is available only to the General Administration Officer." />;
  }

  if (loading) {
    return <DashboardLoading />;
  }

  if (error || !data) {
    return <MessagePanel title="Dashboard unavailable" message={error || "No dashboard data was returned."} />;
  }

  const visibleProgress = data.monthlyProgress.slice(0, new Date().getMonth() + 1);
  const submittedLocationCount = data.locations.filter(
    (location) => !["NO_REPORT", "DRAFT"].includes(location.reportStatus)
  ).length;

  const stats = [
    { label: "Total Users", value: data.stats.totalUsers, detail: "System accounts", icon: "US", tone: "blue", href: "/dashboard/users" },
    { label: "Total Locations", value: data.stats.totalLocations, detail: "Active locations", icon: "LO", tone: "green", href: "/dashboard/locations" },
    { label: "Total Evaluations", value: data.stats.totalEvaluations, detail: "All submitted reports", icon: "EV", tone: "violet", href: "/dashboard/gaa/reports" },
    { label: "Pending Reviews", value: data.stats.pendingReviews, detail: "View now", icon: "PR", tone: "orange", href: "/dashboard/gaa/reports" },
  ];

  return (
    <div className="-mx-4 -my-4 bg-[#f4f7fb] pb-4 sm:-mx-6 sm:-my-6 sm:pb-6 lg:-mx-8 lg:-my-8 lg:pb-8">
      <section className="relative flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.05)] sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-4" />

        <div className="flex shrink-0 items-center">
          <UserMenu />
        </div>
      </section>

      <section className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Welcome back, General Administration Officer
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Here&apos;s what&apos;s happening with the cleaning system today.
          </p>
        </div>
        <DateCard date={new Date(data.generatedAt)} />
      </section>

      <section className="grid gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:px-8 xl:grid-cols-4">
        {stats.map((item) => <StatCard key={item.label} {...item} />)}
      </section>

      <section className="mt-5 px-4 sm:px-6 lg:px-8">
        <Panel title={`Monthly Evaluation Progress - ${data.year}`} action={<Link href="/dashboard/gaa/reports" className="text-xs font-semibold text-blue-600">View reports</Link>}>
          <div className="flex h-64 items-end gap-2 border-b border-l border-slate-200 px-2 pt-6 sm:gap-3">
            {visibleProgress.map((item) => (
              <div key={item.month} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                <span className="text-[10px] font-bold text-slate-600">{item.percentage}%</span>
                <div title={`${item.reports} report(s)`} className="w-full max-w-10 rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-400 transition-all hover:from-blue-700 hover:to-cyan-500" style={{ height: `${Math.max(item.percentage, 3)}%` }} />
                <span className="text-[10px] font-medium text-slate-500">{months[item.month - 1]}</span>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="mt-5 px-4 sm:px-6 lg:px-8">
        <Panel title={`Location Status Overview - ${months[data.month - 1]} ${data.year}`} action={<Link href="/dashboard/gaa/reports" className="text-xs font-semibold text-blue-600">View reports</Link>}>
          {data.locations.length ? (
            <div>
              <p className="mb-4 text-xs font-medium text-slate-500">
                {submittedLocationCount} of {data.locations.length} active locations have submitted an evaluation for this period.
              </p>
              <div className="max-h-[440px] overflow-auto">
                <table className="w-full min-w-[720px] text-left text-xs">
                  <thead className="sticky top-0 bg-white text-[10px] uppercase tracking-wide text-slate-400">
                    <tr><th className="pb-3">Location</th><th className="pb-3">Officer</th><th className="pb-3">Period</th><th className="pb-3">Completion</th><th className="pb-3">Workflow Status</th></tr>
                  </thead>
                  <tbody>
                    {data.locations.map((location) => (
                      <tr key={location.id} className="border-t border-slate-100">
                        <td className="py-3 font-semibold text-slate-700">{location.code} - {location.name}</td>
                        <td className="py-3 text-slate-500">{location.officer}</td>
                        <td className="py-3 text-slate-500">{months[data.month - 1]} {data.year}</td>
                        <td className="py-3">
                          {location.reportStatus === "NO_REPORT" ? <span className="font-semibold text-slate-400">Not available</span> : <Progress value={location.completion} />}
                        </td>
                        <td className="py-3"><WorkflowStatusBadge status={location.reportStatus} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : <EmptyState text="No active locations found" />}
        </Panel>
      </section>
    </div>
  );
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-sm font-bold text-slate-900">{title}</h2>{action}</div>{children}</section>;
}

function StatCard({ label, value, detail, icon, tone, href }: { label: string; value: string | number; detail: string; icon: string; tone: string; href: string }) {
  return <Link href={href} className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"><span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-sm font-black ${toneClasses[tone]}`}>{icon}</span><span className="min-w-0"><span className="block text-xs font-medium text-slate-500">{label}</span><span className="mt-1 block truncate text-2xl font-black tracking-tight text-slate-900">{value}</span><span className="mt-1 block text-[10px] font-semibold text-emerald-600">{detail} -&gt;</span></span></Link>;
}

function Progress({ value }: { value: number }) {
  const normalized = Math.max(0, Math.min(100, Math.round(value)));
  return <div className="flex items-center gap-2"><div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${normalized >= 80 ? "bg-emerald-500" : normalized >= 60 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${normalized}%` }} /></div><span className="font-semibold text-slate-600">{normalized}%</span></div>;
}

function WorkflowStatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    NO_REPORT: "Not Submitted",
    DRAFT: "Draft",
    SUBMITTED: "Pending Admin Review",
    RESUBMITTED: "Pending Admin Review",
    CORRECTION_REQUESTED: "Correction Requested",
    ADMIN_APPROVED: "Admin Approved",
    ADMIN_REJECTED: "Admin Rejected",
    VC_PENDING: "Pending VC Approval",
    CLARIFICATION_REQUESTED: "Clarification Requested",
    VC_APPROVED: "VC Approved",
    VC_REJECTED: "VC Rejected",
  };
  const label = labels[status] ?? status.replaceAll("_", " ");
  const classes = status === "VC_APPROVED"
    ? "bg-emerald-50 text-emerald-700"
    : ["ADMIN_REJECTED", "VC_REJECTED"].includes(status)
      ? "bg-red-50 text-red-700"
      : ["CORRECTION_REQUESTED", "CLARIFICATION_REQUESTED"].includes(status)
        ? "bg-amber-50 text-amber-700"
        : ["NO_REPORT", "DRAFT"].includes(status)
          ? "bg-slate-100 text-slate-500"
          : "bg-blue-50 text-blue-700";
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${classes}`}>{label}</span>;
}

function DateCard({ date }: { date: Date }) {
  return <div className="rounded-xl border border-slate-200 bg-white px-4 py-2"><p className="text-xs font-bold text-slate-700">{date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p><p className="text-[10px] text-slate-400">{date.toLocaleDateString("en-US", { weekday: "long" })}</p></div>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="grid min-h-32 place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs font-medium text-slate-400">{text}</div>;
}

function DashboardLoading() {
  return <div className="space-y-5"><div className="h-28 animate-pulse rounded-2xl bg-white" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl bg-white" />)}</div></div>;
}

function MessagePanel({ title, message }: { title: string; message: string }) {
  return <div className="rounded-2xl border border-red-200 bg-red-50 p-6"><h1 className="font-bold text-red-800">{title}</h1><p className="mt-2 text-sm text-red-700">{message}</p></div>;
}
