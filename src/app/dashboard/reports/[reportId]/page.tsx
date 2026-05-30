"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ReportPage() {
  const params = useParams();
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    if (!params.reportId) return;

    fetch(`/api/reports/${params.reportId}`)
      .then((res) => res.json())
      .then(setReport);
  }, [params.reportId]);

  if (!report) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="bg-white p-8 text-slate-900">
      <button
        onClick={() => window.print()}
        className="mb-4 rounded bg-blue-600 px-4 py-2 text-white"
      >
        Print Report
      </button>

      <h1 className="text-center text-3xl font-bold">
        Evaluation Report
      </h1>

      <h2 className="mt-4">
        Location: {report.location.locationName}
      </h2>

      <h2>
        Month: {report.evaluationMonth}/{report.evaluationYear}
      </h2>

      <h2 className="mt-8 mb-4 text-xl font-bold">
        Evaluation Results
      </h2>

      <table className="w-full border border-black">
        <thead>
          <tr>
            <th className="border p-2">Task</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Result</th>
          </tr>
        </thead>

        <tbody>
          {report.taskEvaluations.map((evaluation: any) => (
            <tr key={evaluation.taskEvaluationId}>
              <td className="border p-2">
                {evaluation.locationTask.task.taskName}
              </td>

              <td className="border p-2">
                {evaluation.locationTask.task.category.categoryName}
              </td>

              <td className="border p-2 text-center">
                {evaluation.result}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8 border p-4">
        <h2 className="text-xl font-bold">
          Recommendation For Payment
        </h2>

        <p className="mt-2">
          Completion Percentage:{" "}
          {report.paymentRecommendation?.completionPercentage}%
        </p>

        <p>
          Contract Amount: Rs.{report.paymentRecommendation?.contractAmount}
        </p>

        <p>
          Recommended Amount: Rs.
          {report.paymentRecommendation?.recommendedAmount}
        </p>
      </div>

      <div className="mt-8 border p-4">
        <h2 className="text-xl font-bold">
          Administration Review
        </h2>

        <p>
          Status: {report.adminReview?.status}
        </p>

        <p>
          Remarks: {report.adminReview?.remarks}
        </p>
      </div>

      <div className="mt-8 border p-4">
        <h2 className="text-xl font-bold">
          Vice Chancellor Approval
        </h2>

        <p>
          Decision: {report.paymentRecommendation?.vcApproval?.decision}
        </p>

        <p>
          Remarks: {report.paymentRecommendation?.vcApproval?.remarks}
        </p>
      </div>
    </div>
  );
}
