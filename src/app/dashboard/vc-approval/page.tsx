"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function VCApprovalPage() {
  const { data: session, status } = useSession();
  const [recommendations, setRecommendations] =
    useState<any[]>([]);

  useEffect(() => {
    fetch("/api/vc-approval/pending")
      .then((res) => res.json())
      .then(setRecommendations);
  }, []);

  if (status === "loading") {
    return <div className="p-6">Loading...</div>;
  }

  if (session?.user?.role !== "Vice Chancellor") {
    return <div className="p-6">Access Denied</div>;
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        VC Approval
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">
                Location
              </th>

              <th className="border p-2">
                Percentage
              </th>

              <th className="border p-2">
                Contract Amount
              </th>

              <th className="border p-2">
                Recommended Amount
              </th>

              <th className="border p-2">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {recommendations.map(
              (recommendation) => (
                <tr
                  key={
                    recommendation.recommendationId
                  }
                >
                  <td className="border p-2">
                    {
                      recommendation.report
                        .location
                        .locationName
                    }
                  </td>

                  <td className="border p-2">
                    {Number(
                      recommendation.completionPercentage
                    ).toFixed(2)}
                    %
                  </td>

                  <td className="border p-2">
                    Rs.
                    {Number(
                      recommendation.contractAmount
                    ).toFixed(2)}
                  </td>

                  <td className="border p-2">
                    Rs.
                    {Number(
                      recommendation.recommendedAmount
                    ).toFixed(2)}
                  </td>

                  <td className="border p-2">
                    <a
                      href={`/dashboard/vc-approval/${recommendation.recommendationId}`}
                      className="text-blue-600"
                    >
                      Review
                    </a>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
