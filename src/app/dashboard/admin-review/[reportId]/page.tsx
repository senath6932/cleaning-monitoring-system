"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type TaskEvaluation = {
  taskEvaluationId: string;
  result: "P" | "X" | "NA";
  remarks: string | null;
  locationTask: {
    task: {
      taskName: string;
      category?: {
        categoryName: string;
      };
    };
  };
};

type Report = {
  reportId: string;
  evaluationMonth: number;
  evaluationYear: number;
  submittedAt: string | null;
  officerRemarks: string | null;
  overallPercentage: number | string | null;
  status: string;
  location: {
    code: string;
    locationName: string;
  };
  officer: {
    fullName: string;
    designation: string | null;
  };
  adminReview?: {
    decision: string;
    remarks: string | null;
  } | null;
  taskEvaluations: TaskEvaluation[];
};

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.reportId as string;
  const [report, setReport] = useState<Report | null>(null);
  const [remarks, setRemarks] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!reportId) return;

    fetch(`/api/admin-review/${reportId}`)
      .then((res) => res.json())
      .then(setReport);
  }, [reportId]);

  const summary = useMemo(() => {
    const values = report?.taskEvaluations ?? [];

    return {
      p: values.filter((item) => item.result === "P").length,
      x: values.filter((item) => item.result === "X").length,
      na: values.filter((item) => item.result === "NA").length,
    };
  }, [report]);
  const canReview = report
    ? ["SUBMITTED", "RESUBMITTED"].includes(report.status)
    : false;

  async function submitDecision(
    action: "approve" | "reject" | "correction"
  ) {
    if (
      (action === "reject" || action === "correction") &&
      !remarks.trim()
    ) {
      setMessage("Remarks are required for this action.");
      return;
    }

    const confirmed = confirm(`Confirm ${action} for this report?`);

    if (!confirmed) return;

    const response = await fetch(`/api/admin-review/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reportId,
        remarks,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      router.push("/dashboard/admin-review");
    } else {
      setMessage(data.message || "Action failed.");
    }
  }

  if (!report) {
    return <div className="p-6 text-slate-700">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6 text-slate-900">
      <h1 className="text-3xl font-bold">Review Evaluation</h1>

      {message && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {message}
        </div>
      )}

      <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Info label="Location" value={`${report.location.code} - ${report.location.locationName}`} />
          <Info label="Officer" value={report.officer.fullName} />
          <Info label="Designation" value={report.officer.designation || "-"} />
          <Info label="Month / Year" value={`${report.evaluationMonth}/${report.evaluationYear}`} />
          <Info
            label="Submitted Date"
            value={
              report.submittedAt
                ? new Date(report.submittedAt).toLocaleString()
                : "-"
            }
          />
          <Info
            label="Completion"
            value={`${Number(report.overallPercentage ?? 0).toFixed(2)}%`}
          />
          <Info label="P / X / NA" value={`${summary.p} / ${summary.x} / ${summary.na}`} />
          <Info label="Status" value={report.status} />
        </div>
        <div className="mt-4 rounded bg-slate-50 p-3 text-sm">
          <strong>Officer remarks:</strong>{" "}
          {report.officerRemarks || "No remarks"}
        </div>
        {report.adminReview?.remarks && (
          <div className="mt-3 rounded bg-yellow-50 p-3 text-sm">
            <strong>Previous correction/review remarks:</strong>{" "}
            {report.adminReview.remarks}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-600">
            <tr>
              <th className="p-3">Task</th>
              <th className="p-3">Category</th>
              <th className="p-3">Result</th>
              <th className="p-3">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {report.taskEvaluations.map((evaluation) => (
              <tr key={evaluation.taskEvaluationId} className="border-t">
                <td className="p-3">
                  {evaluation.locationTask.task.taskName}
                </td>
                <td className="p-3">
                  {evaluation.locationTask.task.category?.categoryName ||
                    "-"}
                </td>
                <td className="p-3 font-semibold">{evaluation.result}</td>
                <td className="p-3">{evaluation.remarks || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
        {!canReview && (
          <div className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-800">
            Administration review completed: {report.adminReview?.decision || report.status}
          </div>
        )}
        <label className="block text-sm font-medium">
          Admin Remarks
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="mt-2 w-full rounded border border-slate-300 p-3"
            rows={4}
            disabled={!canReview}
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-3">
          {canReview ? (
            <>
              <button
                onClick={() => submitDecision("approve")}
                className="rounded bg-green-600 px-4 py-2 text-white"
              >
                Approve
              </button>
              <button
                onClick={() => submitDecision("reject")}
                className="rounded bg-red-600 px-4 py-2 text-white"
              >
                Reject
              </button>
              <button
                onClick={() => submitDecision("correction")}
                className="rounded bg-yellow-500 px-4 py-2 text-white"
              >
                Request Correction
              </button>
            </>
          ) : (
            <span className="rounded bg-green-100 px-4 py-2 font-semibold text-green-800">
              {report.adminReview?.decision === "APPROVED" ? "Approved" : report.adminReview?.decision || "Reviewed"}
            </span>
          )}
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
