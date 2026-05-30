"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

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

export default function AdminReviewPage() {
  const { data: session, status } = useSession();
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    fetch("/api/admin-review/pending")
      .then((res) => res.json())
      .then(setReports);
  }, []);

  if (status === "loading") {
    return <div className="p-6">Loading...</div>;
  }

  if (session?.user?.role !== "Administration Officer") {
    return <div className="p-6">Access Denied</div>;
  }

  return (
    <div className="p-6 text-slate-900">
      <h1 className="mb-6 text-3xl font-bold">
        Admin Review
      </h1>

      <div className="overflow-x-auto rounded border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-slate-900">
              <th className="border-b p-3">Location</th>
              <th className="border-b p-3">Month</th>
              <th className="border-b p-3">Percentage</th>
              <th className="border-b p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {reports.map((report) => (
              <tr key={report.reportId} className="border-b last:border-b-0">
                <td className="p-3">
                  {report.location.locationName}
                </td>
                <td className="p-3">
                  {report.evaluationMonth}/{report.evaluationYear}
                </td>
                <td className="p-3">
                  {report.overallPercentage}%
                </td>
                <td className="p-3">
                  <a
                    href={`/dashboard/admin-review/${report.reportId}`}
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    Review
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
