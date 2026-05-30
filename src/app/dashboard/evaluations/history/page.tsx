"use client";

import { useEffect, useState } from "react";

type Report = {
  reportId: string;
  evaluationMonth: number;
  evaluationYear: number;
  overallPercentage: number;
  status: string;

  location: {
    locationName: string;
  };

  officer: {
    fullName: string;
  };
};

export default function EvaluationHistoryPage() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    fetch("/api/evaluations/history")
      .then((res) => res.json())
      .then(setReports);
  }, []);

  return (
    <div className="p-6 text-slate-900">
      <h1 className="mb-6 text-3xl font-bold">
        Evaluation History
      </h1>

      <div className="overflow-x-auto rounded border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-slate-900">
              <th className="border-b p-3">Location</th>
              <th className="border-b p-3">Month</th>
              <th className="border-b p-3">Year</th>
              <th className="border-b p-3">Percentage</th>
              <th className="border-b p-3">Status</th>
              <th className="border-b p-3">Officer</th>
            </tr>
          </thead>

          <tbody>
            {reports.map((report) => (
              <tr
                key={report.reportId}
                className="border-b last:border-b-0"
              >
                <td className="p-3">
                  {report.location.locationName}
                </td>
                <td className="p-3">
                  {report.evaluationMonth}
                </td>
                <td className="p-3">
                  {report.evaluationYear}
                </td>
                <td className="p-3">
                  {report.overallPercentage}%
                </td>
                <td className="p-3">
                  {report.status}
                </td>
                <td className="p-3">
                  {report.officer.fullName}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
