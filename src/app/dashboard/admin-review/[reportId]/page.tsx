"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReviewPage() {
  const params = useParams();
  const reportId = params.reportId as string;

  const [report, setReport] = useState<any>(null);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (!reportId) return;

    fetch(`/api/admin-review/${reportId}`)
      .then((res) => res.json())
      .then(setReport);
  }, [reportId]);

  async function approve() {
    const response = await fetch(
      "/api/admin-review/approve",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          reportId,
          remarks,
        }),
      }
    );

    const data =
      await response.json();

    if (response.ok) {
      alert("Approved");

      window.location.href =
        "/dashboard/admin-review";
    } else {
      alert(data.message);
    }
  }

  async function reject() {
    const response = await fetch(
      "/api/admin-review/reject",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          reportId,
          remarks,
        }),
      }
    );

    const data =
      await response.json();

    if (response.ok) {
      alert("Rejected");

      window.location.href =
        "/dashboard/admin-review";
    } else {
      alert(data.message);
    }
  }

  if (!report) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Review Evaluation
      </h1>

      <div className="mb-6 rounded border p-4">
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
          <strong>Percentage:</strong>{" "}
          {report.overallPercentage}%
        </p>

        <p>
          <strong>Officer:</strong>{" "}
          {report.officer.fullName}
        </p>
      </div>

      <h2 className="mb-4 text-xl font-bold">
        Task Evaluations
      </h2>

      <table className="mb-6 w-full border">
        <thead>
          <tr>
            <th className="border p-2">
              Task
            </th>

            <th className="border p-2">
              Result
            </th>
          </tr>
        </thead>

        <tbody>
          {report.taskEvaluations.map(
            (evaluation: any) => (
              <tr
                key={
                  evaluation.taskEvaluationId
                }
              >
                <td className="border p-2">
                  {
                    evaluation.locationTask
                      .task.taskName
                  }
                </td>

                <td className="border p-2">
                  {evaluation.result}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>

      <div className="mb-6">
        <label className="mb-2 block font-semibold">
          Remarks
        </label>

        <textarea
          value={remarks}
          onChange={(e) =>
            setRemarks(e.target.value)
          }
          className="w-full rounded border p-3"
          rows={4}
        />
      </div>

      <div className="flex gap-4">
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
      </div>
    </div>
  );
}
