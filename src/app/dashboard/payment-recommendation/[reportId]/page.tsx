"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type PaymentDetail = {
  report: {
    reportId: string;
    evaluationMonth: number;
    evaluationYear: number;
    overallPercentage: number | string | null;
    status: string;
    location: {
      code: string;
      locationName: string;
    };
    adminReview?: {
      remarks: string | null;
      reviewedAt: string;
    } | null;
    paymentRecommendation?: {
      recommendationId: string;
      status: string;
      recommendedAmount: number | string;
      vcApproval?: {
        decision: string;
        remarks: string | null;
      } | null;
    } | null;
  };
  contract: {
    monthlyContractAmount: number | string | null;
    source: string | null;
  };
  preview: {
    completionPercentage: number;
    monthlyContractAmount: number;
    activeLocationCount: number;
    locationMonthlyAllocation: number;
    recommendedAmount: number;
    categoryProgress: Array<{
      category: string;
      passed: number;
      applicable: number;
      percentage: number;
    }>;
  };
};

export default function RecommendationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const reportId = params.reportId as string;
  const [detail, setDetail] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!reportId) return;
    let ignore = false;

    fetch(`/api/payment-recommendation/${reportId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setDetail(data);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [reportId]);

  async function createRecommendation() {
    setSaving(true);
    const response = await fetch("/api/payment-recommendation/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reportId,
      }),
    });
    const data = await response.json();
    setSaving(false);

    if (response.ok) {
      setToast("Payment recommendation submitted to VC approval dashboard.");
      setShowConfirm(false);
      router.refresh();
      setTimeout(() => {
        router.push("/dashboard/payment-recommendation");
      }, 1200);
    } else {
      setToast(data.message || "Failed to create recommendation.");
    }
  }

  function pdfUrl() {
    return `/api/payment-recommendation/${reportId}/pdf`;
  }

  function viewPdf() {
    window.open(pdfUrl(), "_blank", "noopener,noreferrer");
  }

  function downloadPdf() {
    const link = document.createElement("a");
    link.href = pdfUrl();
    link.download = `payment-${reportId}.pdf`;
    link.click();
  }

  function printPdf() {
    const frame = document.createElement("iframe");
    frame.src = pdfUrl();
    frame.style.display = "none";
    document.body.appendChild(frame);
    frame.onload = () => frame.contentWindow?.print();
  }

  if (status === "loading" || loading) {
    return <div className="p-6 text-slate-700">Loading payment preview...</div>;
  }

  if (session?.user?.role !== "General Administration Officer") {
    return <div className="p-6 text-slate-700">Access Denied</div>;
  }

  if (!detail?.report) {
    return <div className="p-6 text-slate-700">Report not found.</div>;
  }

  const recommendation = detail.report.paymentRecommendation;
  const canSubmit = ["ADMIN_APPROVED", "CLARIFICATION_REQUESTED"].includes(
    detail.report.status
  );

  return (
    <div className="space-y-6 p-6 text-slate-900">
      <div>
        <p className="text-sm font-medium text-blue-700">
          Payment Calculation Preview
        </p>
        <h1 className="text-3xl font-bold">Payment Recommendation</h1>
      </div>

      {toast && (
        <div className="rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          {toast}
        </div>
      )}

      {recommendation?.vcApproval?.remarks && (
        <div className="rounded border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
          <strong>VC clarification/review remarks:</strong>{" "}
          {recommendation.vcApproval.remarks}
        </div>
      )}

      <section className="grid gap-4 rounded border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3">
        <Info
          label="Location"
          value={`${detail.report.location.code} - ${detail.report.location.locationName}`}
        />
        <Info
          label="Month / Year"
          value={`${detail.report.evaluationMonth}/${detail.report.evaluationYear}`}
        />
        <Info
          label="Completion Percentage"
          value={`${detail.preview.completionPercentage.toFixed(2)}%`}
        />
        <Info
          label="Total Monthly Contract Amount"
          value={`Rs. ${money(detail.preview.monthlyContractAmount)}`}
        />
        <Info
          label="Active Locations"
          value={String(detail.preview.activeLocationCount)}
        />
        <Info
          label="This Location Monthly Allocation"
          value={`Rs. ${money(detail.preview.locationMonthlyAllocation)}`}
        />
        <Info
          label="Recommended Payment"
          value={`Rs. ${money(detail.preview.recommendedAmount)}`}
        />
        <Info label="Contract Source" value={detail.contract.source || "-"} />
      </section>

      <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">Task Schedule Progress</h2>
        <p className="mt-1 text-xs text-slate-500">
          Daily, Weekly, and Monthly task results are combined for the final
          completion percentage.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {detail.preview.categoryProgress.map((progress) => (
            <div
              key={progress.category}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {progress.category} Tasks
              </p>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {progress.percentage.toFixed(2)}%
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {progress.passed} passed of {progress.applicable} applicable
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
          <strong>Calculation:</strong> Rs. {money(detail.preview.monthlyContractAmount)}
          {" "}÷ {detail.preview.activeLocationCount} locations = Rs.{" "}
          {money(detail.preview.locationMonthlyAllocation)} ×{" "}
          {detail.preview.completionPercentage.toFixed(2)}% ={" "}
          <strong>Rs. {money(detail.preview.recommendedAmount)}</strong>
        </div>
      </section>

      <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">Admin Remarks</h2>
        <p className="mt-2 text-sm text-slate-700">
          {detail.report.adminReview?.remarks || "No admin remarks recorded."}
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        {recommendation && (
          <>
            <button
              onClick={viewPdf}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              View Payment Report
            </button>
            <button
              onClick={downloadPdf}
              className="rounded bg-slate-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Download PDF
            </button>
            <button
              onClick={printPdf}
              className="rounded bg-slate-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Print
            </button>
          </>
        )}
        {canSubmit && (
          <button
            onClick={() => setShowConfirm(true)}
            disabled={!detail.contract.monthlyContractAmount}
            className="rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {recommendation ? "Resubmit to VC" : "Submit to VC"}
          </button>
        )}
        <button
          onClick={() => router.push("/dashboard/payment-recommendation")}
          className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold"
        >
          Cancel
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded border border-slate-200 bg-white p-5 shadow-xl">
            <h2 className="text-lg font-bold">Confirm Recommendation</h2>
            <p className="mt-2 text-sm text-slate-600">
              This will save this location&apos;s percentage-based monthly
              recommendation and send it to the Vice Chancellor dashboard.
            </p>
            <div className="mt-4 rounded bg-slate-50 p-3 text-sm">
              Recommended payment:{" "}
              <strong>Rs. {money(detail.preview.recommendedAmount)}</strong>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={createRecommendation}
                disabled={saving}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Submitting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
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

function money(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
