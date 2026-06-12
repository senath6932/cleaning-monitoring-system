"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type OfficerDashboardData = {
  generatedAt: string;
  month: number;
  year: number;
  stats: {
    assignedLocations: number;
    requiredWorkers: number;
    pendingApprovals: number;
    draftReports: number;
  };
  locations: Array<{
    locationId: string;
    code: string;
    name: string;
    minWorkers: number;
    assignedDate: string;
    currentReportId: string | null;
    currentReportStatus: string;
    currentPercentage: number;
    reportUpdatedAt: string | null;
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

export default function OfficerDashboardPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<OfficerDashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading" || session?.user?.role !== "Evaluating Officer") {
      return;
    }

    let ignore = false;

    fetch("/api/officer/dashboard", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload.message || "Failed to load dashboard");
        }

        return payload as OfficerDashboardData;
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

  if (session?.user?.role !== "Evaluating Officer") {
    return <MessagePanel message="This dashboard is available only to evaluating officers." />;
  }

  if (error || !data) {
    return <MessagePanel message={error || "No dashboard data was returned."} />;
  }

  const period = `${monthNames[data.month - 1]} ${data.year}`;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-slate-900 to-blue-900 p-6 text-white shadow-lg sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
          Evaluating Officer
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
          Welcome, {session.user?.name || "Officer"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">
          Monitor your assigned cleaning locations, required workers, and
          evaluation reports awaiting approval.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/dashboard/evaluations"
            className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-blue-900 transition hover:bg-blue-50"
          >
            Start Evaluation
          </Link>
          <Link
            href="/dashboard/evaluations/history"
            className="rounded-lg border border-white/25 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/10"
          >
            View Evaluation History
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Locations To Monitor"
          value={data.stats.assignedLocations}
          detail="Active assigned locations"
          tone="blue"
        />
        <StatCard
          label="Required Workers"
          value={data.stats.requiredWorkers}
          detail="Minimum workers across assigned locations"
          tone="emerald"
        />
        <StatCard
          label="Pending Approval"
          value={data.stats.pendingApprovals}
          detail="Submitted reports awaiting admin review"
          tone="amber"
        />
        <StatCard
          label="Draft Evaluations"
          value={data.stats.draftReports}
          detail="Reports still being prepared"
          tone="violet"
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Assigned Location Responsibilities
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Current evaluation status for {period}.
            </p>
          </div>
          <p className="text-xs font-semibold text-slate-500">
            Total minimum workers: {data.stats.requiredWorkers}
          </p>
        </div>

        {data.locations.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            No active locations are currently assigned to you.
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Minimum Workers</th>
                  <th className="px-4 py-3">Assigned Since</th>
                  <th className="px-4 py-3">Current Evaluation</th>
                  <th className="px-4 py-3">Completion</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.locations.map((location) => (
                  <tr key={location.locationId} className="border-t border-slate-100">
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-800">{location.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{location.code}</p>
                    </td>
                    <td className="px-4 py-4 font-bold text-slate-700">
                      {location.minWorkers}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {new Date(location.assignedDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={location.currentReportStatus} />
                    </td>
                    <td className="px-4 py-4">
                      {location.currentReportStatus === "NOT_STARTED"
                        ? "-"
                        : `${location.currentPercentage.toFixed(2)}%`}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={
                          location.currentReportId &&
                          ["DRAFT", "CORRECTION_REQUESTED", "ADMIN_REJECTED", "VC_REJECTED", "REJECTED"].includes(
                            location.currentReportStatus
                          )
                            ? `/dashboard/evaluations?reportId=${location.currentReportId}`
                            : location.currentReportStatus === "NOT_STARTED"
                              ? "/dashboard/evaluations"
                              : "/dashboard/evaluations/history"
                        }
                        className="font-bold text-blue-600 hover:text-blue-800"
                      >
                        {location.currentReportStatus === "NOT_STARTED"
                          ? "Evaluate"
                          : ["DRAFT", "CORRECTION_REQUESTED", "ADMIN_REJECTED", "VC_REJECTED", "REJECTED"].includes(
                                location.currentReportStatus
                              )
                            ? "Continue"
                            : "View"}
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
    status === "NOT_STARTED"
      ? "bg-slate-100 text-slate-600"
      : status === "DRAFT"
        ? "bg-violet-50 text-violet-700"
        : ["SUBMITTED", "RESUBMITTED"].includes(status)
          ? "bg-amber-50 text-amber-700"
          : ["ADMIN_REJECTED", "VC_REJECTED", "REJECTED"].includes(status)
            ? "bg-red-50 text-red-700"
            : status === "CORRECTION_REQUESTED"
              ? "bg-orange-50 text-orange-700"
              : "bg-emerald-50 text-emerald-700";

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
