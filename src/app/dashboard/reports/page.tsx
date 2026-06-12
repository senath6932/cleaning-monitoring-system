"use client";

import { useEffect, useState } from "react";

type ApprovedReport = {
  reportId: string;
  evaluationMonth: number;
  evaluationYear: number;
  overallPercentage: number | string | null;
  status: string;
  location: {
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
    SYSTEM_USER?: {
      fullName: string;
    };
  } | null;
  paymentRecommendation: {
    recommendationId: string;
    recommendedAmount: number | string;
  } | null;
};

export default function ReportsPage() {
  const [reports, setReports] = useState<ApprovedReport[]>([]);

  useEffect(() => {
    fetch("/api/reports?status=ADMIN_APPROVED")
      .then((res) => res.json())
      .then((data) => setReports(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="p-6 text-slate-900">
      <h1 className="mb-6 text-3xl font-bold">Approved Reports</h1>

      <div className="overflow-x-auto rounded border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-600">
            <tr>
              <th className="border-b p-3">Report ID</th>
              <th className="border-b p-3">Location</th>
              <th className="border-b p-3">Officer</th>
              <th className="border-b p-3">Month / Year</th>
              <th className="border-b p-3">Completion</th>
              <th className="border-b p-3">Admin Approved By</th>
              <th className="border-b p-3">Admin Remarks</th>
              <th className="border-b p-3">Approved Date</th>
              <th className="border-b p-3">Workflow Status</th>
              <th className="border-b p-3">Payment Recommendation</th>
              <th className="border-b p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-6 text-center text-slate-600">
                  No admin-approved reports found.
                </td>
              </tr>
            ) : null}

            {reports.map((report) => (
              <tr key={report.reportId} className="border-b last:border-b-0">
                <td className="p-3">{report.reportId.slice(0, 8)}</td>
                <td className="p-3">
                  {report.location.code} - {report.location.locationName}
                </td>
                <td className="p-3">{report.officer.fullName}</td>
                <td className="p-3">
                  {report.evaluationMonth}/{report.evaluationYear}
                </td>
                <td className="p-3">
                  {Number(report.overallPercentage ?? 0).toFixed(2)}%
                </td>
                <td className="p-3">
                  {report.adminReview?.SYSTEM_USER?.fullName || "-"}
                </td>
                <td className="max-w-xs truncate p-3">
                  {report.adminReview?.remarks || "-"}
                </td>
                <td className="p-3">
                  {report.adminReview?.reviewedAt
                    ? new Date(report.adminReview.reviewedAt).toLocaleDateString()
                    : "-"}
                </td>
                <td className="p-3">{report.status}</td>
                <td className="p-3">
                  {report.paymentRecommendation ? "Created" : "Not created"}
                </td>
                <td className="p-3">
                  <a
                    href={`/dashboard/reports/${report.reportId}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
