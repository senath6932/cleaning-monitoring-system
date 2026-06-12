"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type VCRecommendation = {
  recommendationId: string;
  status: string;
  completionPercentage: number | string;
  contractAmount: number | string;
  recommendedAmount: number | string;
  report: {
    evaluationMonth: number;
    evaluationYear: number;
    location: {
      locationName: string;
    };
    adminReview?: {
      remarks: string | null;
    } | null;
  };
};

export default function VCReviewPage() {
  const params = useParams();
  const recommendationId = params.recommendationId as string;

  const [recommendation, setRecommendation] = useState<VCRecommendation | null>(null);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (!recommendationId) return;

    fetch(`/api/vc-approval/${recommendationId}`)
      .then((res) => res.json())
      .then(setRecommendation);
  }, [recommendationId]);

  async function approve() {
    const response = await fetch("/api/vc-approval/approve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recommendationId,
        remarks,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Approved");

      window.location.href = "/dashboard/vc-approval";
    } else {
      alert(data.message);
    }
  }

  async function reject() {
    const response = await fetch("/api/vc-approval/reject", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recommendationId,
        remarks,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Rejected");

      window.location.href = "/dashboard/vc-approval";
    } else {
      alert(data.message);
    }
  }

  async function requestClarification() {
    if (!remarks.trim()) {
      alert("Remarks are required for clarification.");
      return;
    }

    const response = await fetch("/api/vc-approval/clarification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recommendationId,
        remarks,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Clarification requested");
      window.location.href = "/dashboard/vc-approval";
    } else {
      alert(data.message);
    }
  }

  if (!recommendation) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">VC Approval Review</h1>

      <div className="space-y-3 rounded border p-6">
        <p>
          <strong>Location:</strong>{" "}
          {recommendation.report.location.locationName}
        </p>
        <p>
          <strong>Month / Year:</strong>{" "}
          {recommendation.report.evaluationMonth}/
          {recommendation.report.evaluationYear}
        </p>
        <p>
          <strong>Admin Remarks:</strong>{" "}
          {recommendation.report.adminReview?.remarks || "-"}
        </p>

        <p>
          <strong>Completion Percentage:</strong>{" "}
          {Number(recommendation.completionPercentage).toFixed(2)}%
        </p>

        <p>
          <strong>Location Monthly Allocation:</strong>{" "}
          Rs. {Number(recommendation.contractAmount).toFixed(2)}
        </p>

        <p className="text-lg font-bold text-green-700">
          Recommended Amount: Rs.{" "}
          {Number(recommendation.recommendedAmount).toFixed(2)}
        </p>
      </div>

      <div className="mt-6">
        <label className="mb-2 block font-semibold">VC Remarks</label>

        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={4}
          className="w-full rounded border p-3"
        />
      </div>

      <div className="mt-6 flex gap-4">
        {recommendation.status === "VC_PENDING" ? (
          <>
            <button
              onClick={approve}
              className="rounded bg-green-600 px-4 py-2 text-white"
            >
              Approve
            </button>

            <button
              onClick={reject}
              className="rounded bg-red-600 px-4 py-2 text-white"
            >
              Reject
            </button>
            <button
              onClick={requestClarification}
              className="rounded bg-yellow-500 px-4 py-2 text-white"
            >
              Request Clarification
            </button>
          </>
        ) : (
          <span className="rounded bg-green-100 px-4 py-2 font-semibold text-green-800">
            {recommendation.status === "VC_APPROVED"
              ? "Approved"
              : recommendation.status.replaceAll("_", " ")}
          </span>
        )}
      </div>
    </div>
  );
}
