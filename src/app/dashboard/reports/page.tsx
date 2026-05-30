"use client";

import { useEffect, useState } from "react";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => res.json())
      .then(setReports);
  }, []);

  return (
    <div className="p-6 text-slate-900">
      <h1 className="mb-6 text-3xl font-bold">Approved Reports</h1>

      <table className="w-full border bg-white">
        <thead>
          <tr className="bg-slate-100">
            <th className="border p-2">Location</th>
            <th className="border p-2">Month</th>
            <th className="border p-2">Percentage</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {reports.map((report) => (
            <tr key={report.recommendationId}>
              <td className="border p-2">
                {report.report.location.locationName}
              </td>
              <td className="border p-2">
                {report.report.evaluationMonth}/{report.report.evaluationYear}
              </td>
              <td className="border p-2">{report.completionPercentage}%</td>
              <td className="border p-2">Rs. {report.recommendedAmount}</td>
              <td className="border p-2">
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
  );
}
