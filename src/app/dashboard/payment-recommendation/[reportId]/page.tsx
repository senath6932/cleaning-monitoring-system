"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function RecommendationDetailPage() {
  const params = useParams();
  const router = useRouter();

  const reportId = params.reportId as string;

  const [report, setReport] = useState<any>(null);
  const [setting, setSetting] = useState<any>(null);

  useEffect(() => {
    if (!reportId) return;

    fetch(`/api/payment-recommendation/${reportId}`)
      .then((res) => res.json())
      .then(setReport);

    fetch("/api/settings")
      .then((res) => res.json())
      .then(setSetting);
  }, [reportId]);

  async function createRecommendation() {
    if (!report) return;
    if (!setting) return;

    const completionPercentage =
      Number(report.overallPercentage);

    const contractAmount =
      Number(
        setting.monthlyContractAmount
      );

    const recommendedAmount =
      (contractAmount * completionPercentage) / 100;

    const response = await fetch(
      "/api/payment-recommendation/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId,
          completionPercentage,
          contractAmount,
          recommendedAmount,
        }),
      }
    );

    const data =
      await response.json();

    if (response.ok) {
      alert(
        "Recommendation Created"
      );

      router.push(
        "/dashboard/payment-recommendation"
      );
    } else {
      alert(data.message);
    }
  }

  if (!report) {
    return <div className="p-6">Loading...</div>;
  }

  const completionPercentage =
    Number(report.overallPercentage);

  const contractAmount =
    Number(
      setting?.monthlyContractAmount ?? 0
    );

  const recommendedAmount =
    (contractAmount * completionPercentage) / 100;

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Payment Recommendation
      </h1>

      <div className="space-y-4 rounded border p-6">
        <p>
          <strong>Location:</strong>{" "}
          {report.location.locationName}
        </p>

        <p>
          <strong>Month:</strong>{" "}
          {report.evaluationMonth}
        </p>

        <p>
          <strong>Year:</strong>{" "}
          {report.evaluationYear}
        </p>

        <p>
          <strong>Completion Percentage:</strong>{" "}
          {completionPercentage.toFixed(2)}%
        </p>

        <p>
          <strong>Contract Amount:</strong>{" "}
          Rs. {contractAmount.toFixed(2)}
        </p>

        <p className="text-xl font-bold text-green-700">
          Recommended Amount: Rs.{" "}
          {recommendedAmount.toFixed(2)}
        </p>

        <button
          onClick={createRecommendation}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Create Recommendation
        </button>
      </div>
    </div>
  );
}
