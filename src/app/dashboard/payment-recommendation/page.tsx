"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function PaymentRecommendationPage() {
  const { data: session, status } = useSession();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetch(
      "/api/payment-recommendation/pending"
    )
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
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Payment Recommendation
      </h1>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">
              Location
            </th>

            <th className="border p-2">
              Percentage
            </th>

            <th className="border p-2">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {reports.map((report: any) => (
            <tr key={report.reportId}>
              <td className="border p-2">
                {report.location.locationName}
              </td>

              <td className="border p-2">
                {report.overallPercentage}%
              </td>

              <td className="border p-2">
                <a
                  href={`/dashboard/payment-recommendation/${report.reportId}`}
                  className="text-blue-600"
                >
                  Recommend
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
