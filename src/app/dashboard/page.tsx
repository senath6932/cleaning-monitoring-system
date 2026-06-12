"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then(setStats);
  }, []);

  if (!stats) {
    return <div className="p-6">Loading Dashboard...</div>;
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-white border border-sky-200 p-6 shadow-md">
          <h2 className="text-sm text-sky-700">Total Users</h2>
          <p className="mt-3 text-4xl font-extrabold text-sky-900">{stats.totalUsers}</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-white border border-sky-200 p-6 shadow-md">
          <h2 className="text-sm text-sky-700">Locations</h2>
          <p className="mt-3 text-4xl font-extrabold text-sky-900">{stats.totalLocations}</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-white border border-sky-200 p-6 shadow-md">
          <h2 className="text-sm text-sky-700">Evaluations</h2>
          <p className="mt-3 text-4xl font-extrabold text-sky-900">{stats.totalEvaluations}</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-white border border-sky-200 p-6 shadow-md">
          <h2 className="text-sm text-sky-700">Pending Reviews</h2>
          <p className="mt-3 text-4xl font-extrabold text-sky-900">{stats.pendingReviews}</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-white border border-sky-200 p-6 shadow-md">
          <h2 className="text-sm text-sky-700">Pending VC Approvals</h2>
          <p className="mt-3 text-4xl font-extrabold text-sky-900">{stats.pendingVCApprovals}</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-white border border-sky-200 p-6 shadow-md">
          <h2 className="text-sm text-sky-700">Approved Reports</h2>
          <p className="mt-3 text-4xl font-extrabold text-sky-900">{stats.approvedReports}</p>
        </div>
      </div>
    </div>
  );
}
