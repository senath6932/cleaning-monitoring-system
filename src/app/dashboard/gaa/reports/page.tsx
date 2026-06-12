"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type Report = {
  reportId: string;
  evaluationMonth: number;
  evaluationYear: number;
  overallPercentage: number | string | null;
  status: string;
  location: {
    locationId: string;
    code: string;
    locationName: string;
  };
  officer: {
    fullName: string;
  };
  adminReview: {
    decision: string;
    remarks: string | null;
    reviewedAt: string;
  } | null;
};

type ReportDetail = Report & {
  officer: {
    fullName: string;
    email: string;
    designation: string | null;
  };
  officerRemarks: string | null;
  taskEvaluations: {
    taskEvaluationId: string;
    result: "P" | "X" | "NA";
    remarks: string | null;
    locationTask: {
      task: {
        taskName: string;
        category: {
          categoryName: string;
        } | null;
      };
    };
  }[];
};

function isRejectedReport(report: Report) {
  return (
    report.status === "REJECTED" ||
    report.status.endsWith("_REJECTED") ||
    report.adminReview?.decision === "REJECTED"
  );
}

export default function GaaReportsPage() {
  const { data: session, status } = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [detail, setDetail] = useState<ReportDetail | null>(null);
  const [reason, setReason] = useState<Report | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let ignore = false;

    void Promise.resolve().then(() => {
      if (!ignore) setLoading(true);

      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (monthFilter) params.set("month", monthFilter);
      if (yearFilter) params.set("year", yearFilter);
      if (locationFilter) params.set("locationId", locationFilter);

      return fetch(`/api/gaa/reports?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          if (!ignore) setReports(Array.isArray(data) ? data : []);
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    });

    return () => {
      ignore = true;
    };
  }, [statusFilter, monthFilter, yearFilter, locationFilter]);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports.filter((report) =>
      query
        ? `${report.reportId} ${report.location.code} ${report.location.locationName} ${report.officer.fullName}`
            .toLowerCase()
            .includes(query)
        : true
    );
  }, [reports, search]);

  const locations = useMemo(
    () =>
      Array.from(
        new Map(
          reports.map((report) => [report.location.locationId, report.location])
        ).values()
      ),
    [reports]
  );

  async function openDetail(reportId: string) {
    const response = await fetch(`/api/gaa/reports/${reportId}`);
    const data = await response.json();

    if (response.ok) {
      setDetail(data);
    } else {
      setToast(data.message || "Failed to load report details.");
    }
  }

  function pdfUrl(reportId: string) {
    return `/api/gaa/reports/${reportId}/pdf`;
  }

  function viewPdf(report: Report) {
    if (report.status !== "ADMIN_APPROVED") {
      setToast("PDF is available only for admin-approved reports.");
      return;
    }

    window.open(pdfUrl(report.reportId), "_blank", "noopener,noreferrer");
  }

  function downloadPdf(report: Report) {
    if (report.status !== "ADMIN_APPROVED") {
      setToast("PDF download is available only for admin-approved reports.");
      return;
    }

    const link = document.createElement("a");
    link.href = pdfUrl(report.reportId);
    link.download = `evaluation-${report.reportId}.pdf`;
    link.click();
  }

  function printPdf(report: Report) {
    if (report.status !== "ADMIN_APPROVED") {
      setToast("Print is available only for admin-approved report PDFs.");
      return;
    }

    const frame = document.createElement("iframe");
    frame.src = pdfUrl(report.reportId);
    frame.style.display = "none";
    document.body.appendChild(frame);
    frame.onload = () => {
      frame.contentWindow?.print();
    };
  }

  if (status === "loading" || loading) {
    return <div className="p-6 text-slate-700">Loading GAA reports...</div>;
  }

  if (session?.user?.role !== "General Administration Officer") {
    return <div className="p-6 text-slate-700">Access Denied</div>;
  }

  return (
    <div className="space-y-6 p-6 text-slate-900">
      <div>
        <p className="text-sm font-medium text-blue-700">
          GAA Report Viewing Section
        </p>
        <h1 className="text-3xl font-bold">Reviewed Evaluation Reports</h1>
      </div>

      {toast && (
        <div className="rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 shadow-sm">
          {toast}
        </div>
      )}

      <div className="grid gap-3 rounded border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search reports"
          className="rounded border border-slate-300 p-2 text-sm md:col-span-2"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded border border-slate-300 p-2 text-sm"
        >
          <option value="">All decisions</option>
          <option value="ADMIN_APPROVED">Approved</option>
          <option value="ADMIN_REJECTED">Rejected</option>
          <option value="CORRECTION_REQUESTED">Correction Requested</option>
        </select>
        <input
          type="number"
          min={1}
          max={12}
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          placeholder="Month"
          className="rounded border border-slate-300 p-2 text-sm"
        />
        <input
          type="number"
          min={2020}
          max={2100}
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          placeholder="Year"
          className="rounded border border-slate-300 p-2 text-sm"
        />
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="rounded border border-slate-300 p-2 text-sm md:col-span-2"
        >
          <option value="">All locations</option>
          {locations.map((location) => (
            <option key={location.locationId} value={location.locationId}>
              {location.code} - {location.locationName}
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
              <th className="border-b p-3">Officer</th>
              <th className="border-b p-3">Month</th>
              <th className="border-b p-3">Year</th>
              <th className="border-b p-3">Completion Percentage</th>
              <th className="border-b p-3">Admin Decision</th>
              <th className="border-b p-3">Admin Remarks</th>
              <th className="border-b p-3">Status</th>
              <th className="border-b p-3">Reviewed Date</th>
              <th className="border-b p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-6 text-center text-slate-600">
                  No reviewed reports found.
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
                  <td className="p-3">{report.adminReview?.decision || "-"}</td>
                  <td className="max-w-xs truncate p-3">
                    {report.adminReview?.remarks || "-"}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="p-3">
                    {report.adminReview?.reviewedAt
                      ? new Date(report.adminReview.reviewedAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openDetail(report.reportId)}
                        className="rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold"
                      >
                        View Evaluation Report
                      </button>
                      <button
                        onClick={() => viewPdf(report)}
                        className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        View PDF
                      </button>
                      <button
                        onClick={() => downloadPdf(report)}
                        className="rounded bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Download PDF
                      </button>
                      <button
                        onClick={() => printPdf(report)}
                        className="rounded bg-slate-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Print
                      </button>
                      {isRejectedReport(report) && (
                        <button
                          onClick={() => setReason(report)}
                          className="rounded border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700"
                        >
                          View Reject Reason
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {detail && (
        <ReportModal report={detail} onClose={() => setDetail(null)} />
      )}

      {reason && (
        <ReasonModal report={reason} onClose={() => setReason(null)} />
      )}
    </div>
  );
}

function ReportModal({
  report,
  onClose,
}: {
  report: ReportDetail;
  onClose: () => void;
}) {
  const summary = {
    p: report.taskEvaluations.filter((item) => item.result === "P").length,
    x: report.taskEvaluations.filter((item) => item.result === "X").length,
    na: report.taskEvaluations.filter((item) => item.result === "NA").length,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded border border-slate-200 bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Evaluation Report</h2>
            <p className="text-sm text-slate-600">{report.reportId}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded border border-slate-300 px-3 py-1.5 text-sm font-semibold"
          >
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Info label="Location" value={`${report.location.code} - ${report.location.locationName}`} />
          <Info label="Officer" value={report.officer.fullName} />
          <Info label="Designation" value={report.officer.designation || "-"} />
          <Info label="Month / Year" value={`${report.evaluationMonth}/${report.evaluationYear}`} />
          <Info label="P / X / NA" value={`${summary.p} / ${summary.x} / ${summary.na}`} />
          <Info
            label="Completion"
            value={`${Number(report.overallPercentage ?? 0).toFixed(2)}%`}
          />
          <Info label="Decision" value={report.adminReview?.decision || "-"} />
          <Info label="Status" value={report.status} />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded border border-slate-200 bg-slate-50 p-3 text-sm">
            <strong>Officer remarks:</strong> {report.officerRemarks || "-"}
          </div>
          <div className="rounded border border-slate-200 bg-slate-50 p-3 text-sm">
            <strong>Admin remarks:</strong> {report.adminReview?.remarks || "-"}
          </div>
        </div>

        <table className="mt-5 w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-600">
            <tr>
              <th className="p-3">Task</th>
              <th className="p-3">Category</th>
              <th className="p-3">Result</th>
              <th className="p-3">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {report.taskEvaluations.map((evaluation) => (
              <tr key={evaluation.taskEvaluationId} className="border-t">
                <td className="p-3">{evaluation.locationTask.task.taskName}</td>
                <td className="p-3">
                  {evaluation.locationTask.task.category?.categoryName || "-"}
                </td>
                <td className="p-3 font-semibold">{evaluation.result}</td>
                <td className="p-3">{evaluation.remarks || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReasonModal({ report, onClose }: { report: Report; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg rounded border border-slate-200 bg-white p-5 shadow-xl">
        <h2 className="text-lg font-bold">Reject Reason</h2>
        <p className="mt-2 text-sm text-slate-600">
          Decision: {report.adminReview?.decision || "-"}
        </p>
        <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-3 text-sm">
          {report.adminReview?.remarks || "No remarks recorded."}
        </div>
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "ADMIN_APPROVED"
      ? "border-green-200 bg-green-50 text-green-700"
      : status === "ADMIN_REJECTED"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-yellow-200 bg-yellow-50 text-yellow-800";

  return (
    <span className={`inline-flex rounded border px-2 py-1 text-xs font-semibold ${tone}`}>
      {status}
    </span>
  );
}
