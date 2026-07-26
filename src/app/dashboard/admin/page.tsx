"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type AdminDashboardData = {
  generatedAt: string;
  stats: {
    totalLocations: number;
    totalOfficers: number;
    pendingReviews: number;
    reviewedByAdmin: number;
  };
  pendingReports: Array<{
    reportId: string;
    evaluationMonth: number;
    evaluationYear: number;
    overallPercentage: number;
    status: string;
    submittedAt: string | null;
    location: {
      code: string;
      locationName: string;
    };
    officer: {
      fullName: string;
      designation: string | null;
    };
  }>;
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading" || session?.user?.role !== "Administration Officer") {
      return;
    }

    let ignore = false;

    fetch("/api/admin/dashboard", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload.message || "Failed to load dashboard");
        }

        return payload as AdminDashboardData;
      })
      .then((payload) => {
        if (!ignore) setData(payload);
      })
      .catch((reason: Error) => {
        if (!ignore) setError(reason.message);
      });

    return () => {
      ignore = true;
    };
  }, [session?.user?.role, status]);

  if (status === "loading" || (!data && !error)) {
    return <DashboardLoading />;
  }

  if (session?.user?.role !== "Administration Officer") {
    return <MessagePanel message="This home page is available only to Administration Officers." />;
  }

  if (error || !data) {
    return <MessagePanel message={error || "No home data was returned."} />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-slate-900 to-blue-900 p-6 text-white shadow-lg sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
          Administration Officer
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
          Welcome, {session.user?.name || "Administrator"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">
          Monitor cleaning operations and review evaluation reports submitted
          by evaluating officers.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/dashboard/admin-review"
            className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-blue-900 transition hover:bg-blue-50"
          >
            Review Pending Evaluations
          </Link>
          <Link
            href="/dashboard/reports"
            className="rounded-lg border border-white/25 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/10"
          >
            View Reports
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Locations"
          value={data.stats.totalLocations}
          detail="Active cleaning locations"
          tone="blue"
        />
        <StatCard
          label="Total Officers"
          value={data.stats.totalOfficers}
          detail="Active evaluating officers"
          tone="emerald"
        />
        <StatCard
          label="Pending Reviews"
          value={data.stats.pendingReviews}
          detail="Evaluation reports awaiting review"
          tone="amber"
        />
        <StatCard
          label="Reviews Completed"
          value={data.stats.reviewedByAdmin}
          detail="Reports reviewed by you"
          tone="violet"
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Evaluation Reports Pending Review
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Newest submissions are shown first.
            </p>
          </div>
          <Link
            href="/dashboard/admin-review"
            className="text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            View all pending reports
          </Link>
        </div>

        {data.pendingReports.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            No evaluation reports are currently waiting for review.
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Evaluating Officer</th>
                  <th className="px-4 py-3">Evaluation Period</th>
                  <th className="px-4 py-3">Completion</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.pendingReports.map((report) => (
                  <tr key={report.reportId} className="border-t border-slate-100">
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-800">
                        {report.location.locationName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {report.location.code}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-700">
                        {report.officer.fullName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {report.officer.designation || "Evaluating Officer"}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {monthNames[report.evaluationMonth - 1]} {report.evaluationYear}
                    </td>
                    <td className="px-4 py-4 font-bold text-slate-700">
                      {report.overallPercentage.toFixed(2)}%
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {report.submittedAt
                        ? new Date(report.submittedAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/dashboard/admin-review/${report.reportId}`}
                        className="font-bold text-blue-600 hover:text-blue-800"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  tone: "blue" | "emerald" | "amber" | "violet";
}) {
  const tones = {
    blue: "border-blue-200 bg-blue-50 text-blue-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    violet: "border-violet-200 bg-violet-50 text-violet-900",
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${tones[tone]}`}>
      <p className="text-xs font-bold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-3 text-4xl font-black">{value}</p>
      <p className="mt-2 text-xs font-medium opacity-70">{detail}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "RESUBMITTED"
      ? "bg-orange-50 text-orange-700"
      : "bg-amber-50 text-amber-700";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${tone}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-2xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}

function MessagePanel({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
      {message}
    </div>
  );
}

