"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type Report = {
  reportId: string;
  evaluationMonth: number;
  evaluationYear: number;
  overallPercentage: number | string | null;
  status: string;
  location: {
    locationId: string;
    code: string;
    locationName: string;
  };
  adminReview?: {
    reviewedAt: string;
  } | null;
  paymentRecommendation?: {
    status: string;
  } | null;
};

export default function PaymentRecommendationPage() {
  const { data: session, status } = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  useEffect(() => {
    let ignore = false;

    void Promise.resolve().then(() => {
      if (!ignore) setLoading(true);
      const params = new URLSearchParams();
      if (monthFilter) params.set("month", monthFilter);
      if (yearFilter) params.set("year", yearFilter);
      if (locationFilter) params.set("locationId", locationFilter);

      return fetch(`/api/payment-recommendation/pending?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          if (!ignore) setReports(Array.isArray(data) ? data : []);
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    });

    return () => {
      ignore = true;
    };
  }, [monthFilter, yearFilter, locationFilter]);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports.filter((report) =>
      query
        ? `${report.reportId} ${report.location.code} ${report.location.locationName}`
            .toLowerCase()
            .includes(query)
        : true
    );
  }, [reports, search]);

  const locations = useMemo(
    () =>
      Array.from(
        new Map(
          reports.map((report) => [report.location.locationId, report.location])
        ).values()
      ),
    [reports]
  );

  if (status === "loading" || loading) {
    return <div className="p-6 text-slate-700">Loading payment recommendations...</div>;
  }

  if (session?.user?.role !== "General Administration Officer") {
    return <div className="p-6 text-slate-700">Access Denied</div>;
  }

  return (
    <div className="space-y-6 p-6 text-slate-900">
      <div>
        <p className="text-sm font-medium text-blue-700">
          GAA Payment Recommendation
        </p>
        <h1 className="text-3xl font-bold">Payment Recommendation History</h1>
      </div>

      <div className="grid gap-3 rounded border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search report or location"
          className="rounded border border-slate-300 p-2 text-sm md:col-span-2"
        />
        <input
          type="number"
          min={1}
          max={12}
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          placeholder="Month"
          className="rounded border border-slate-300 p-2 text-sm"
        />
        <input
          type="number"
          min={2020}
          max={2100}
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          placeholder="Year"
          className="rounded border border-slate-300 p-2 text-sm"
        />
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="rounded border border-slate-300 p-2 text-sm"
        >
          <option value="">All locations</option>
          {locations.map((location) => (
            <option key={location.locationId} value={location.locationId}>
              {location.code} - {location.locationName}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-600">
            <tr>
              <th className="p-3">Report ID</th>
              <th className="p-3">Location</th>
              <th className="p-3">Month</th>
              <th className="p-3">Year</th>
              <th className="p-3">Completion Percentage</th>
              <th className="p-3">Admin Reviewed Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-600">
                  No admin-approved reports found.
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr key={report.reportId} className="border-t">
                  <td className="p-3">{report.reportId.slice(0, 8)}</td>
                  <td className="p-3">
                    {report.location.code} - {report.location.locationName}
                  </td>
                  <td className="p-3">{report.evaluationMonth}</td>
                  <td className="p-3">{report.evaluationYear}</td>
                  <td className="p-3">
                    {Number(report.overallPercentage ?? 0).toFixed(2)}%
                  </td>
                  <td className="p-3">
                    {report.adminReview?.reviewedAt
                      ? new Date(report.adminReview.reviewedAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`/dashboard/admin-review/${report.reportId}`}
                        className="rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                      >
                        View Evaluation Report
                      </a>
                      {canCreateRecommendation(report) ? (
                        <a
                          href={`/dashboard/payment-recommendation/${report.reportId}`}
                          className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          Create Payment Recommendation
                        </a>
                      ) : canResubmitRecommendation(report) ? (
                        <a
                          href={`/dashboard/payment-recommendation/${report.reportId}`}
                          className="rounded bg-yellow-500 px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          Edit / Resubmit
                        </a>
                      ) : (
                        <RecommendationLabel status={report.paymentRecommendation?.status || report.status} />
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

function canCreateRecommendation(report: Report) {
  return report.status === "ADMIN_APPROVED" && !report.paymentRecommendation;
}

function canResubmitRecommendation(report: Report) {
  return report.status === "CLARIFICATION_REQUESTED";
}

function RecommendationLabel({ status }: { status: string }) {
  const label =
    status === "VC_APPROVED"
      ? "Approved"
      : status === "VC_REJECTED"
        ? "Rejected"
        : status === "VC_PENDING"
          ? "Submitted to VC"
          : status.replaceAll("_", " ");

  return (
    <span className="rounded bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded border border-green-200 bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
      {status}
    </span>
  );
}
