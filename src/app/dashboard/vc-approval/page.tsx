"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type Recommendation = {
  recommendationId: string;
  completionPercentage: number | string;
  recommendedAmount: number | string;
  createdAt: string;
  status: string;
  report: {
    reportId: string;
    evaluationMonth: number;
    evaluationYear: number;
    location: {
      code: string;
      locationName: string;
    };
  };
};

type Action = "approve" | "reject" | "clarification";

export default function VCApprovalPage() {
  const { data: session, status } = useSession();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [decision, setDecision] = useState<{
    action: Action;
    recommendation: Recommendation;
    remarks: string;
  } | null>(null);

  async function loadRecommendations() {
    setLoading(true);
    const response = await fetch("/api/vc-approval/pending");
    const data = await response.json();
    setRecommendations(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    let ignore = false;

    void Promise.resolve().then(() =>
      fetch("/api/vc-approval/pending")
        .then((res) => res.json())
        .then((data) => {
          if (!ignore) setRecommendations(Array.isArray(data) ? data : []);
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        })
    );

    return () => {
      ignore = true;
    };
  }, []);

  const filteredRecommendations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return recommendations.filter((recommendation) =>
      query
        ? `${recommendation.recommendationId} ${recommendation.report.reportId} ${recommendation.report.location.code} ${recommendation.report.location.locationName}`
            .toLowerCase()
            .includes(query)
        : true
    );
  }, [recommendations, search]);

  async function submitDecision() {
    if (!decision) return;

    if (
      ["reject", "clarification"].includes(decision.action) &&
      !decision.remarks.trim()
    ) {
      setToast("Remarks are required for this action.");
      return;
    }

    const response = await fetch(`/api/vc-approval/${decision.action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recommendationId: decision.recommendation.recommendationId,
        remarks: decision.remarks,
      }),
    });
    const data = await response.json();

    if (response.ok) {
      setToast("VC decision saved successfully.");
      setDecision(null);
      await loadRecommendations();
    } else {
      setToast(data.message || "Action failed.");
    }
  }

  function evaluationPdfUrl(reportId: string) {
    return `/api/gaa/reports/${reportId}/pdf`;
  }

  function paymentPdfUrl(reportId: string) {
    return `/api/payment-recommendation/${reportId}/pdf`;
  }

  if (status === "loading" || loading) {
    return <div className="p-6 text-slate-700">Loading VC approvals...</div>;
  }

  if (session?.user?.role !== "Vice Chancellor") {
    return <div className="p-6 text-slate-700">Access Denied</div>;
  }

  return (
    <div className="space-y-6 p-6 text-slate-900">
      <div>
        <p className="text-sm font-medium text-blue-700">VC Review</p>
        <h1 className="text-3xl font-bold">Payment Recommendations</h1>
      </div>

      {toast && (
        <div className="rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          {toast}
        </div>
      )}

      <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search recommendation, report, or location"
          className="w-full rounded border border-slate-300 p-2 text-sm"
        />
      </div>

      <div className="overflow-x-auto rounded border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-600">
            <tr>
              <th className="p-3">Recommendation ID</th>
              <th className="p-3">Evaluation Report ID</th>
              <th className="p-3">Location</th>
              <th className="p-3">Month</th>
              <th className="p-3">Year</th>
              <th className="p-3">Completion Percentage</th>
              <th className="p-3">Recommended Amount</th>
              <th className="p-3">GAA Prepared Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecommendations.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-6 text-center text-slate-600">
                  No payment recommendations found.
                </td>
              </tr>
            ) : (
              filteredRecommendations.map((recommendation) => (
                <tr key={recommendation.recommendationId} className="border-t">
                  <td className="p-3">{recommendation.recommendationId.slice(0, 8)}</td>
                  <td className="p-3">{recommendation.report.reportId.slice(0, 8)}</td>
                  <td className="p-3">
                    {recommendation.report.location.code} -{" "}
                    {recommendation.report.location.locationName}
                  </td>
                  <td className="p-3">{recommendation.report.evaluationMonth}</td>
                  <td className="p-3">{recommendation.report.evaluationYear}</td>
                  <td className="p-3">
                    {Number(recommendation.completionPercentage).toFixed(2)}%
                  </td>
                  <td className="p-3">
                    Rs. {money(Number(recommendation.recommendedAmount))}
                  </td>
                  <td className="p-3">
                    {new Date(recommendation.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={recommendation.status} />
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={evaluationPdfUrl(recommendation.report.reportId)}
                        target="_blank"
                        className="rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold"
                      >
                        View Evaluation Report PDF
                      </a>
                      <a
                        href={paymentPdfUrl(recommendation.report.reportId)}
                        target="_blank"
                        className="rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold"
                      >
                        View Payment Report PDF
                      </a>
                      {recommendation.status === "VC_PENDING" ? (
                        <>
                          <button
                            onClick={() =>
                              setDecision({
                                action: "approve",
                                recommendation,
                                remarks: "",
                              })
                            }
                            className="rounded bg-green-600 px-3 py-1.5 text-xs font-semibold text-white"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              setDecision({
                                action: "reject",
                                recommendation,
                                remarks: "",
                              })
                            }
                            className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() =>
                              setDecision({
                                action: "clarification",
                                recommendation,
                                remarks: "",
                              })
                            }
                            className="rounded bg-yellow-500 px-3 py-1.5 text-xs font-semibold text-white"
                          >
                            Request Clarification
                          </button>
                        </>
                      ) : (
                        <DecisionLabel status={recommendation.status} />
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {decision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded border border-slate-200 bg-white p-5 shadow-xl">
            <h2 className="text-lg font-bold capitalize">
              Confirm {decision.action}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Recommendation {decision.recommendation.recommendationId.slice(0, 8)}
            </p>
            <label className="mt-4 block text-sm font-semibold">
              VC Remarks
              <textarea
                value={decision.remarks}
                onChange={(e) =>
                  setDecision({ ...decision, remarks: e.target.value })
                }
                rows={4}
                className="mt-2 w-full rounded border border-slate-300 p-3 text-sm"
              />
            </label>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setDecision(null)}
                className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={submitDecision}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
      {status}
    </span>
  );
}

function DecisionLabel({ status }: { status: string }) {
  const label =
    status === "VC_APPROVED"
      ? "Approved"
      : status === "VC_REJECTED"
        ? "Rejected"
        : status === "CLARIFICATION_REQUESTED"
          ? "Clarification Requested"
          : status.replaceAll("_", " ");

  return (
    <span className="rounded bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
      {label}
    </span>
  );
}

function money(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
