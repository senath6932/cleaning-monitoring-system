"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type FinalReport = {
  recommendationId: string;
  completionPercentage: number | string;
  contractAmount: number | string;
  recommendedAmount: number | string;
  createdAt: string;
  status: string;
  creator: {
    fullName: string;
  };
  vcApproval: {
    decision: string;
    remarks: string | null;
    approvedAt: string;
    approver?: {
      fullName: string;
    };
  } | null;
  report: {
    reportId: string;
    evaluationMonth: number;
    evaluationYear: number;
    overallPercentage: number | string | null;
    officerRemarks: string | null;
    location: {
      code: string;
      locationName: string;
    };
    officer: {
      fullName: string;
      designation: string | null;
    };
    adminReview: {
      decision: string;
      remarks: string | null;
      reviewedAt: string;
    } | null;
  };
};

export default function FinalReportsPage() {
  const { data: session, status } = useSession();
  const [reports, setReports] = useState<FinalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<FinalReport | null>(null);

  useEffect(() => {
    let ignore = false;

    fetch("/api/reports")
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setReports(Array.isArray(data) ? data : []);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports.filter((item) =>
      query
        ? `${item.recommendationId} ${item.report.reportId} ${item.report.location.code} ${item.report.location.locationName}`
            .toLowerCase()
            .includes(query)
        : true
    );
  }, [reports, search]);

  function evaluationPdfUrl(reportId: string) {
    return `/api/gaa/reports/${reportId}/pdf`;
  }

  function paymentPdfUrl(reportId: string) {
    return `/api/payment-recommendation/${reportId}/pdf`;
  }

  function download(url: string, filename: string) {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
  }

  if (status === "loading" || loading) {
    return <div className="p-6 text-slate-700">Loading final reports...</div>;
  }

  if (!session?.user?.role) {
    return <div className="p-6 text-slate-700">Access Denied</div>;
  }

  return (
    <div className="space-y-6 p-6 text-slate-900">
      <div>
        <p className="text-sm font-medium text-blue-700">Final Approved Reports</p>
        <h1 className="text-3xl font-bold">VC-Approved Reports</h1>
      </div>

      <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search final reports"
          className="w-full rounded border border-slate-300 p-2 text-sm"
        />
      </div>

      <div className="overflow-x-auto rounded border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-600">
            <tr>
              <th className="p-3">Report ID</th>
              <th className="p-3">Recommendation ID</th>
              <th className="p-3">Location</th>
              <th className="p-3">Month</th>
              <th className="p-3">Year</th>
              <th className="p-3">Completion</th>
              <th className="p-3">Recommended Amount</th>
              <th className="p-3">VC Approved Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-6 text-center text-slate-600">
                  No VC-approved reports found.
                </td>
              </tr>
            ) : (
              filteredReports.map((item) => (
                <tr key={item.recommendationId} className="border-t">
                  <td className="p-3">{item.report.reportId.slice(0, 8)}</td>
                  <td className="p-3">{item.recommendationId.slice(0, 8)}</td>
                  <td className="p-3">
                    {item.report.location.code} - {item.report.location.locationName}
                  </td>
                  <td className="p-3">{item.report.evaluationMonth}</td>
                  <td className="p-3">{item.report.evaluationYear}</td>
                  <td className="p-3">
                    {Number(item.completionPercentage).toFixed(2)}%
                  </td>
                  <td className="p-3">Rs. {money(Number(item.recommendedAmount))}</td>
                  <td className="p-3">
                    {item.vcApproval?.approvedAt
                      ? new Date(item.vcApproval.approvedAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelected(item)}
                        className="rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold"
                      >
                        View Final Report
                      </button>
                      <button
                        onClick={() =>
                          download(
                            evaluationPdfUrl(item.report.reportId),
                            `evaluation-${item.report.reportId}.pdf`
                          )
                        }
                        className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Download Evaluation PDF
                      </button>
                      <button
                        onClick={() =>
                          download(
                            paymentPdfUrl(item.report.reportId),
                            `payment-${item.recommendationId}.pdf`
                          )
                        }
                        className="rounded bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Download Payment PDF
                      </button>
                      <button
                        onClick={() => {
                          setSelected(item);
                          setTimeout(() => window.print(), 50);
                        }}
                        className="rounded bg-slate-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Print Final Report
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <FinalReportModal report={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function FinalReportModal({
  report,
  onClose,
}: {
  report: FinalReport;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Final Approved Report</h2>
            <p className="text-sm text-slate-600">{report.report.reportId}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded border border-slate-300 px-3 py-1.5 text-sm font-semibold"
          >
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Info label="Location" value={`${report.report.location.code} - ${report.report.location.locationName}`} />
          <Info label="Month / Year" value={`${report.report.evaluationMonth}/${report.report.evaluationYear}`} />
          <Info label="Completion" value={`${Number(report.completionPercentage).toFixed(2)}%`} />
          <Info label="Location Monthly Allocation" value={`Rs. ${money(Number(report.contractAmount))}`} />
          <Info label="Recommended Payment" value={`Rs. ${money(Number(report.recommendedAmount))}`} />
          <Info label="VC Decision" value={report.vcApproval?.decision || "-"} />
        </div>

        <section className="mt-5 rounded border border-slate-200 bg-slate-50 p-4 text-sm">
          <h3 className="font-bold">Evaluation Report</h3>
          <p className="mt-2">
            Officer: {report.report.officer.fullName} (
            {report.report.officer.designation || "-"})
          </p>
          <p>Officer remarks: {report.report.officerRemarks || "-"}</p>
          <p>Admin remarks: {report.report.adminReview?.remarks || "-"}</p>
        </section>

        <section className="mt-4 rounded border border-slate-200 bg-slate-50 p-4 text-sm">
          <h3 className="font-bold">Payment Recommendation</h3>
          <p className="mt-2">Prepared by: {report.creator.fullName}</p>
          <p>Prepared date: {new Date(report.createdAt).toLocaleDateString()}</p>
        </section>

        <section className="mt-4 rounded border border-slate-200 bg-slate-50 p-4 text-sm">
          <h3 className="font-bold">VC Approval</h3>
          <p className="mt-2">Remarks: {report.vcApproval?.remarks || "-"}</p>
          <p>
            Approved date:{" "}
            {report.vcApproval?.approvedAt
              ? new Date(report.vcApproval.approvedAt).toLocaleDateString()
              : "-"}
          </p>
        </section>
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
  return (
    <span className="inline-flex rounded border border-green-200 bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
      {status}
    </span>
  );
}

function money(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
