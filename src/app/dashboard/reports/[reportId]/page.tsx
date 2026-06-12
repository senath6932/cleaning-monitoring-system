"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type ReportDetail = {
  location: {
    locationName: string;
  };
  evaluationMonth: number;
  evaluationYear: number;
  officer?: {
    fullName: string;
    designation: string | null;
  };
  companyAgreement?: {
    companyName: string | null;
    agreementNumber: string | null;
  } | null;
  taskEvaluations: {
    taskEvaluationId: string;
    result: string;
    locationTask: {
      task: {
        taskName: string;
        category: {
          categoryName: string;
        } | null;
      };
    };
  }[];
  paymentRecommendation?: {
    completionPercentage: number | string;
    contractAmount: number | string;
    recommendedAmount: number | string;
    vcApproval?: {
      decision: string;
      remarks: string | null;
      approvedAt: string;
    } | null;
  } | null;
  adminReview?: {
    decision: string;
    remarks: string | null;
  } | null;
};

export default function ReportPage() {
  const params = useParams();
  const [report, setReport] = useState<ReportDetail | null>(null);

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
        Wayamba University of Sri Lanka
      </h1>
      <p className="text-center text-lg font-semibold">
        Final Cleaning Service Evaluation Report
      </p>

      <h2 className="mt-6">
        Location: {report.location.locationName}
      </h2>

      <h2>
        Month: {report.evaluationMonth}/{report.evaluationYear}
      </h2>
      <p>Evaluating Officer: {report.officer?.fullName}</p>
      <p>Officer Designation: {report.officer?.designation || "-"}</p>
      <p>
        Company: {report.companyAgreement?.companyName || "Not Provided"}
      </p>
      <p>
        Agreement No:{" "}
        {report.companyAgreement?.agreementNumber || "Not Provided"}
      </p>

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
          {report.taskEvaluations.map((evaluation) => (
            <tr key={evaluation.taskEvaluationId}>
              <td className="border p-2">
                {evaluation.locationTask.task.taskName}
              </td>

              <td className="border p-2">
                {evaluation.locationTask.task.category?.categoryName || "-"}
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
          Location Monthly Allocation: Rs.{report.paymentRecommendation?.contractAmount}
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
          Decision: {report.adminReview?.decision}
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
        <p>
          Approval Date:{" "}
          {report.paymentRecommendation?.vcApproval?.approvedAt
            ? new Date(
                report.paymentRecommendation.vcApproval.approvedAt
              ).toLocaleString()
            : "-"}
        </p>
      </div>
    </div>
  );
}
