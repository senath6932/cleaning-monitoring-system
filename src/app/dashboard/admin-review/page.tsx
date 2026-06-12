"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type Report = {
  reportId: string;
  evaluationMonth: number;
  evaluationYear: number;
  overallPercentage: number | string | null;
  status: string;
  submittedAt: string | null;
  location: {
    code: string;
    locationName: string;
  };
  officer: {
    fullName: string;
  };
};

type Action = "approve" | "reject" | "correction";

export default function AdminReviewPage() {
  const { data: session, status } = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [toast, setToast] = useState("");
  const [decision, setDecision] = useState<{
    action: Action;
    report: Report;
    remarks: string;
  } | null>(null);

  async function loadReports(showLoading = true) {
    if (showLoading) setLoading(true);
    fetch("/api/admin-review/pending")
      .then((res) => res.json())
      .then((data) => setReports(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    let ignore = false;

    void Promise.resolve().then(() =>
      fetch("/api/admin-review/pending")
        .then((res) => res.json())
        .then((data) => {
          if (!ignore) setReports(Array.isArray(data) ? data : []);
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        })
    );

    return () => {
      ignore = true;
    };
  }, []);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesStatus = statusFilter ? report.status === statusFilter : true;
      const matchesSearch = query
        ? `${report.reportId} ${report.location.code} ${report.location.locationName} ${report.officer.fullName}`
            .toLowerCase()
            .includes(query)
        : true;

      return matchesStatus && matchesSearch;
    });
  }, [reports, search, statusFilter]);

  async function submitDecision() {
    if (!decision) return;

    if (
      ["reject", "correction"].includes(decision.action) &&
      !decision.remarks.trim()
    ) {
      setToast("Remarks are required for this action.");
      return;
    }

    const response = await fetch(`/api/admin-review/${decision.action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reportId: decision.report.reportId,
        remarks: decision.remarks,
      }),
    });
    const data = await response.json();

    if (response.ok) {
      setToast("Admin decision saved successfully.");
      setDecision(null);
      await loadReports();
    } else {
      setToast(data.message || "Action failed.");
    }
  }

  if (status === "loading" || loading) {
    return <div className="p-6 text-slate-700">Loading pending reviews...</div>;
  }

  if (session?.user?.role !== "Administration Officer") {
    return <div className="p-6 text-slate-700">Access Denied</div>;
  }

  return (
    <div className="space-y-6 p-6 text-slate-900">
      <div>
        <p className="text-sm font-medium text-blue-700">
          Administration Officer Review
        </p>
        <h1 className="text-3xl font-bold">Evaluation Review History</h1>
      </div>

      {toast && (
        <div className="rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 shadow-sm">
          {toast}
        </div>
      )}

      <div className="grid gap-3 rounded border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px]">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search reports, locations, officers"
          className="rounded border border-slate-300 p-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded border border-slate-300 p-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="SUBMITTED">SUBMITTED</option>
          <option value="RESUBMITTED">RESUBMITTED</option>
          <option value="ADMIN_APPROVED">ADMIN_APPROVED</option>
          <option value="ADMIN_REJECTED">ADMIN_REJECTED</option>
          <option value="CORRECTION_REQUESTED">CORRECTION_REQUESTED</option>
          <option value="VC_PENDING">VC_PENDING</option>
          <option value="VC_APPROVED">VC_APPROVED</option>
          <option value="VC_REJECTED">VC_REJECTED</option>
          <option value="CLARIFICATION_REQUESTED">CLARIFICATION_REQUESTED</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-600">
            <tr>
              <th className="border-b p-3">Report ID</th>
              <th className="border-b p-3">Location</th>
              <th className="border-b p-3">Evaluating Officer</th>
              <th className="border-b p-3">Month</th>
              <th className="border-b p-3">Year</th>
              <th className="border-b p-3">Completion Percentage</th>
              <th className="border-b p-3">Submitted Date</th>
              <th className="border-b p-3">Status</th>
              <th className="border-b p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-slate-600">
                  No evaluation review reports found.
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr key={report.reportId} className="border-b last:border-b-0">
                  <td className="p-3">{report.reportId.slice(0, 8)}</td>
                  <td className="p-3">
                    {report.location.code} - {report.location.locationName}
                  </td>
                  <td className="p-3">{report.officer.fullName}</td>
                  <td className="p-3">{report.evaluationMonth}</td>
                  <td className="p-3">{report.evaluationYear}</td>
                  <td className="p-3">
                    {Number(report.overallPercentage ?? 0).toFixed(2)}%
                  </td>
                  <td className="p-3">
                    {report.submittedAt
                      ? new Date(report.submittedAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`/dashboard/admin-review/${report.reportId}`}
                        className="rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        View Details
                      </a>
                      {isPendingReview(report.status) ? (
                        <>
                          <button
                            onClick={() =>
                              setDecision({ action: "approve", report, remarks: "" })
                            }
                            className="rounded bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              setDecision({ action: "reject", report, remarks: "" })
                            }
                            className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() =>
                              setDecision({
                                action: "correction",
                                report,
                                remarks: "",
                              })
                            }
                            className="rounded bg-yellow-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-yellow-600"
                          >
                            Request Correction
                          </button>
                        </>
                      ) : (
                        <DecisionLabel status={report.status} />
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {decision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded border border-slate-200 bg-white p-5 shadow-xl">
            <h2 className="text-lg font-bold capitalize">
              Confirm {decision.action === "correction" ? "request correction" : decision.action}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Report {decision.report.reportId.slice(0, 8)} for{" "}
              {decision.report.location.locationName}
            </p>
            <label className="mt-4 block text-sm font-semibold text-slate-800">
              Remarks
              <textarea
                value={decision.remarks}
                onChange={(e) =>
                  setDecision({ ...decision, remarks: e.target.value })
                }
                rows={4}
                className="mt-2 w-full rounded border border-slate-300 p-3 text-sm"
              />
            </label>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setDecision(null)}
                className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={submitDecision}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
      {status}
    </span>
  );
}

function isPendingReview(status: string) {
  return ["SUBMITTED", "RESUBMITTED"].includes(status);
}

function DecisionLabel({ status }: { status: string }) {
  const label =
    status === "ADMIN_APPROVED" || ["VC_PENDING", "VC_APPROVED", "VC_REJECTED", "CLARIFICATION_REQUESTED"].includes(status)
      ? "Approved"
      : status === "ADMIN_REJECTED"
        ? "Rejected"
        : status === "CORRECTION_REQUESTED"
          ? "Correction Requested"
          : status.replaceAll("_", " ");

  return (
    <span className="rounded bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
      {label}
    </span>
  );
}
