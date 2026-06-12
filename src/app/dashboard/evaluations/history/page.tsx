"use client";

import { useEffect, useMemo, useState } from "react";

type Report = {
  reportId: string;
  evaluationMonth: number;
  evaluationYear: number;
  overallPercentage: number | string | null;
  status: string;
  taskEvaluations?: unknown[];
  adminReview?: {
    decision: string;
    remarks: string | null;
  } | null;
  location?: {
    locationName: string;
  };
};

export default function EvaluationHistoryPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    void Promise.resolve().then(() => {
      if (!ignore) {
        setSubmitted(
          new URLSearchParams(window.location.search).has("submitted")
        );
      }

      return fetch("/api/evaluations/history")
        .then(async (res) => {
          const data = await res.json().catch(() => ({ message: "Failed to load history" }));

          if (!res.ok) {
            throw new Error(data.message || "Failed to load history");
          }

          return data;
        })
        .then((data) => {
          if (!ignore) setReports(Array.isArray(data) ? data : []);
        })
        .catch((reason: Error) => {
          if (!ignore) setError(reason.message);
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    });

    return () => {
      ignore = true;
    };
  }, []);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesStatus = statusFilter ? report.status === statusFilter : true;
      const matchesSearch = query
        ? `${report.reportId} ${report.location?.locationName ?? ""}`
            .toLowerCase()
            .includes(query)
        : true;

      return matchesStatus && matchesSearch;
    });
  }, [reports, search, statusFilter]);

  if (loading) {
    return <div className="p-6 text-slate-700">Loading evaluation history...</div>;
  }

  return (
    <div className="space-y-6 p-6 text-slate-900">
      <div>
        <h1 className="text-3xl font-bold">Evaluation History</h1>
        {submitted && (
          <div className="mt-3 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            Evaluation submitted successfully.
          </div>
        )}
        {error && (
          <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}
      </div>

      <div className="grid gap-3 rounded border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px]">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by report ID or location"
          className="rounded border border-slate-300 p-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded border border-slate-300 p-2 text-sm"
        >
          <option value="">All statuses</option>
          {[
            "DRAFT",
            "SUBMITTED",
            "RESUBMITTED",
            "CORRECTION_REQUESTED",
            "ADMIN_APPROVED",
            "ADMIN_REJECTED",
            "VC_PENDING",
            "VC_APPROVED",
            "VC_REJECTED",
            "REJECTED",
          ].map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-600">
            <tr>
              <th className="border-b p-3">Report ID</th>
              <th className="border-b p-3">Location</th>
              <th className="border-b p-3">Month</th>
              <th className="border-b p-3">Year</th>
              <th className="border-b p-3">Percentage</th>
              <th className="border-b p-3">Status</th>
              <th className="border-b p-3">Admin Remarks</th>
              <th className="border-b p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-600">
                  No evaluation reports found.
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr key={report.reportId} className="border-b last:border-b-0">
                  <td className="p-3">{report.reportId.slice(0, 8)}</td>
                  <td className="p-3">
                    {report.location?.locationName || "Unknown Location"}
                  </td>
                  <td className="p-3">{monthName(report.evaluationMonth)}</td>
                  <td className="p-3">{report.evaluationYear}</td>
                  <td className="p-3">
                    {Number(report.overallPercentage ?? 0).toFixed(2)}%
                  </td>
                  <td className="p-3">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="p-3">{report.adminReview?.remarks || "-"}</td>
                  <td className="p-3">
                    {canEditReport(report) ? (
                      <a
                        href={`/dashboard/evaluations?reportId=${report.reportId}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {report.status === "DRAFT" ? "Edit Draft" : "Resubmit"}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function canEditReport(report: Report) {
  if (
    [
      "DRAFT",
      "CORRECTION_REQUESTED",
      "ADMIN_REJECTED",
      "VC_REJECTED",
      "REJECTED",
    ].includes(report.status)
  ) {
    return true;
  }

  return (
    ["SUBMITTED", "RESUBMITTED"].includes(report.status) &&
    (report.taskEvaluations?.length ?? 0) === 0
  );
}

function monthName(month: number) {
  return new Date(2026, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
  });
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "ADMIN_APPROVED"
      ? "border-green-200 bg-green-50 text-green-700"
      : status === "ADMIN_REJECTED"
        ? "border-red-200 bg-red-50 text-red-700"
        : status === "CORRECTION_REQUESTED"
          ? "border-yellow-200 bg-yellow-50 text-yellow-800"
          : "border-blue-200 bg-blue-50 text-blue-700";

  return (
    <span className={`inline-flex rounded border px-2 py-1 text-xs font-semibold ${tone}`}>
      {status}
    </span>
  );
}
