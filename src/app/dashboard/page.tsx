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
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded border p-6 shadow">
          <h2 className="text-lg">Total Users</h2>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
        </div>

        <div className="rounded border p-6 shadow">
          <h2 className="text-lg">Locations</h2>
          <p className="text-3xl font-bold">{stats.totalLocations}</p>
        </div>

        <div className="rounded border p-6 shadow">
          <h2 className="text-lg">Evaluations</h2>
          <p className="text-3xl font-bold">{stats.totalEvaluations}</p>
        </div>

        <div className="rounded border p-6 shadow">
          <h2 className="text-lg">Pending Reviews</h2>
          <p className="text-3xl font-bold">{stats.pendingReviews}</p>
        </div>

        <div className="rounded border p-6 shadow">
          <h2 className="text-lg">Pending VC Approvals</h2>
          <p className="text-3xl font-bold">{stats.pendingVCApprovals}</p>
        </div>

        <div className="rounded border p-6 shadow">
          <h2 className="text-lg">Approved Reports</h2>
          <p className="text-3xl font-bold">{stats.approvedReports}</p>
        </div>
      </div>
    </div>
  );
}
