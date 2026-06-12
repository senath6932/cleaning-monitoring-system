"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type Officer = {
  id: string;
  fullName: string;
  designation: string | null;
  email: string;
};

type Location = {
  locationId: string;
  code: string;
  locationName: string;
  minWorkers: number;
  assignedOfficerName: string;
};

type Assignment = {
  assignmentId: string;
  assignedDate: string;
  locationId: string;
  officerId: string;
  location: {
    locationId: string;
    code: string;
    locationName: string;
    minWorkers: number;
    isActive: boolean;
  };
  officer: {
    id: string;
    fullName: string;
    designation: string | null;
    email: string;
    isActive: boolean;
  };
};

export default function AssignmentPage() {
  const { data: session, status } = useSession();
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [officerId, setOfficerId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [officersResponse, locationsResponse, assignmentsResponse] =
        await Promise.all([
          fetch("/api/officers"),
          fetch("/api/locations"),
          fetch("/api/assignments"),
        ]);
      if (
        !officersResponse.ok ||
        !locationsResponse.ok ||
        !assignmentsResponse.ok
      ) {
        throw new Error("Failed to load assignment data");
      }
      setOfficers((await officersResponse.json()) as Officer[]);
      setLocations((await locationsResponse.json()) as Location[]);
      setAssignments((await assignmentsResponse.json()) as Assignment[]);
    } catch {
      setMessage("Failed to load assignment data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    Promise.all([
      fetch("/api/officers"),
      fetch("/api/locations"),
      fetch("/api/assignments"),
    ])
      .then(async ([officersResponse, locationsResponse, assignmentsResponse]) => {
        if (
          !officersResponse.ok ||
          !locationsResponse.ok ||
          !assignmentsResponse.ok
        ) {
          throw new Error("Failed to load assignment data");
        }
        return Promise.all([
          officersResponse.json() as Promise<Officer[]>,
          locationsResponse.json() as Promise<Location[]>,
          assignmentsResponse.json() as Promise<Assignment[]>,
        ]);
      })
      .then(([officersData, locationsData, assignmentsData]) => {
        if (!ignore) {
          setOfficers(officersData);
          setLocations(locationsData);
          setAssignments(assignmentsData);
        }
      })
      .catch(() => {
        if (!ignore) setMessage("Failed to load assignment data.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const selectedOfficer = officers.find((officer) => officer.id === officerId);
  const selectedLocation = locations.find(
    (location) => location.locationId === locationId
  );
  const assignmentByLocation = useMemo(() => {
    const currentAssignments = new Map<string, Assignment>();
    assignments.forEach((assignment) => {
      if (!currentAssignments.has(assignment.locationId)) {
        currentAssignments.set(assignment.locationId, assignment);
      }
    });
    return currentAssignments;
  }, [assignments]);
  const activeAssignments = new Set(assignments.map((item) => item.locationId))
    .size;
  const unassignedLocations = Math.max(locations.length - activeAssignments, 0);

  const tableRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return locations
      .map((location) => ({
        location,
        assignment: assignmentByLocation.get(location.locationId),
      }))
      .filter(({ location, assignment }) =>
        query
          ? `${location.code} ${location.locationName} ${assignment?.officer.fullName ?? "not assigned"} ${assignment?.officer.designation ?? ""}`
              .toLowerCase()
              .includes(query)
          : true
      );
  }, [assignmentByLocation, locations, search]);

  if (status === "loading" || loading) {
    return <div className="p-6 text-sm text-slate-500">Loading assignments...</div>;
  }

  if (session?.user?.role !== "General Administration Officer") {
    return <div className="p-6 text-sm text-red-600">Access Denied</div>;
  }

  async function assignLocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!officerId || !locationId) {
      setMessage("Select an evaluating officer and location.");
      return;
    }
    const existing = assignmentByLocation.get(locationId);
    if (
      existing &&
      existing.officerId !== officerId &&
      !confirm(
        `${existing.location.locationName} is assigned to ${existing.officer.fullName}. Replace this assignment?`
      )
    ) {
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ officerId, locationId }),
      });
      const result = await response.json();
      if (response.ok) {
        setMessage("Location assignment saved successfully.");
        setOfficerId("");
        setLocationId("");
        await loadData();
      } else {
        setMessage(result.message || "Failed to save assignment.");
      }
    } catch {
      setMessage("Failed to save assignment. Check the server connection.");
    } finally {
      setSaving(false);
    }
  }

  async function removeAssignment(assignment: Assignment) {
    if (
      !confirm(
        `Remove ${assignment.officer.fullName} from ${assignment.location.locationName}?`
      )
    ) {
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(
        `/api/assignments?assignmentId=${encodeURIComponent(assignment.assignmentId)}`,
        { method: "DELETE" }
      );
      const result = await response.json();
      if (response.ok) {
        setAssignments((current) =>
          current.filter((item) => item.assignmentId !== assignment.assignmentId)
        );
        setMessage("Assignment removed successfully.");
      } else {
        setMessage(result.message || "Failed to remove assignment.");
      }
    } catch {
      setMessage("Failed to remove assignment. Check the server connection.");
    } finally {
      setSaving(false);
    }
  }

  function exportCsv() {
    const rows = [
      ["Location Code", "Location Name", "Assigned Officer", "Designation", "Assigned Date", "Status"],
      ...tableRows.map(({ location, assignment }) => [
        location.code,
        location.locationName,
        assignment?.officer.fullName ?? "Not Assigned",
        assignment?.officer.designation ?? "",
        assignment ? new Date(assignment.assignedDate).toLocaleDateString() : "",
        assignment ? "Active" : "Unassigned",
      ]),
    ];
    downloadBlob(
      rows.map((row) => row.map(csvCell).join(",")).join("\n"),
      "location-assignments.csv",
      "text/csv;charset=utf-8"
    );
  }

  return (
    <div className="space-y-4 text-slate-800">
      <header className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">Location Assignment</h1>
        <p className="mt-1 text-xs text-slate-500">
          Assign evaluating officers to locations.
        </p>
      </header>

      {message && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs font-medium text-blue-700">
          {message}
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <form onSubmit={assignLocation} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800">Assign Officer to Location</h2>
          <label className="mt-5 block text-xs font-semibold text-slate-600">
            Select Evaluating Officer <span className="text-red-500">*</span>
            <select value={officerId} onChange={(event) => setOfficerId(event.target.value)} className="assignment-control mt-2">
              <option value="">Select Officer</option>
              {officers.map((officer) => <option key={officer.id} value={officer.id}>{officer.designation ? `${officer.designation} - ${officer.fullName}` : officer.fullName}</option>)}
            </select>
          </label>
          {selectedOfficer && <SelectionPreview title={selectedOfficer.fullName} subtitle={selectedOfficer.designation || "Evaluating Officer"} icon="OF" />}
          <label className="mt-4 block text-xs font-semibold text-slate-600">
            Select Location <span className="text-red-500">*</span>
            <select value={locationId} onChange={(event) => setLocationId(event.target.value)} className="assignment-control mt-2">
              <option value="">Select Location</option>
              {locations.map((location) => <option key={location.locationId} value={location.locationId}>{location.locationName} ({location.code})</option>)}
            </select>
          </label>
          {selectedLocation && <SelectionPreview title={selectedLocation.locationName} subtitle={`Code: ${selectedLocation.code}`} icon="LO" />}
          <button type="submit" disabled={saving || !officerId || !locationId} className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-40">{saving ? "Assigning..." : "Assign Location"}</button>
        </form>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800">Assignment Information</h2>
          <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-xs text-blue-700">
            Select an officer and location, then click Assign Location to create or replace the assignment.
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Stat label="Total Officers" value={officers.length} detail="Evaluating Officers" tone="blue" />
            <Stat label="Total Locations" value={locations.length} detail="Active Locations" tone="green" />
            <Stat label="Active Assignments" value={activeAssignments} detail="Currently Active" tone="amber" />
            <Stat label="Unassigned Locations" value={unassignedLocations} detail="No Officer Assigned" tone="violet" />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-sm font-bold text-slate-800">Current Assignments</h2><p className="mt-1 text-[10px] text-slate-500">List of locations and their assigned evaluating officers.</p></div>
          <div className="flex gap-2"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search location or officer..." className="assignment-control w-64" /><button type="button" onClick={exportCsv} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold hover:bg-slate-50">Export CSV</button></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">#</th><th className="px-3 py-3">Location Code</th><th className="px-3 py-3">Location Name</th><th className="px-3 py-3">Assigned Officer</th><th className="px-3 py-3">Designation</th><th className="px-3 py-3">Assigned Date</th><th className="px-3 py-3">Status</th><th className="px-3 py-3 text-right">Actions</th></tr></thead>
            <tbody>
              {tableRows.map(({ location, assignment }, index) => <tr key={location.locationId} className="border-t border-slate-100 hover:bg-slate-50/70"><td className="px-4 py-3 text-slate-400">{index + 1}</td><td className="px-3 py-3"><span className="rounded-md bg-blue-50 px-2 py-1 font-bold text-blue-700">{location.code}</span></td><td className="px-3 py-3 font-semibold text-slate-700">{location.locationName}</td><td className="px-3 py-3">{assignment?.officer.fullName ?? "Not Assigned"}</td><td className="px-3 py-3">{assignment?.officer.designation ?? "-"}</td><td className="px-3 py-3 text-slate-500">{assignment ? new Date(assignment.assignedDate).toLocaleDateString() : "-"}</td><td className="px-3 py-3"><span className={`rounded-md px-2 py-1 text-[10px] font-semibold ${assignment ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{assignment ? "Active" : "Unassigned"}</span></td><td className="px-3 py-3"><div className="flex justify-end">{assignment ? <button type="button" disabled={saving} onClick={() => void removeAssignment(assignment)} className="rounded-lg border border-red-200 px-2.5 py-1.5 text-[10px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40">Remove</button> : <button type="button" onClick={() => setLocationId(location.locationId)} className="rounded-lg border border-blue-200 px-2.5 py-1.5 text-[10px] font-semibold text-blue-600 hover:bg-blue-50">Assign</button>}</div></td></tr>)}
            </tbody>
          </table>
        </div>
      </section>

      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-700">
        Each location can be assigned to one evaluating officer at a time. Assigning another officer replaces the current assignment.
      </div>
      <style jsx global>{`.assignment-control{height:2.6rem;border:1px solid #e2e8f0;border-radius:.6rem;background:#fff;padding:0 .8rem;font-size:.75rem;outline:none}.assignment-control:focus{border-color:#60a5fa;box-shadow:0 0 0 3px #dbeafe}`}</style>
    </div>
  );
}

function SelectionPreview({ title, subtitle, icon }: { title: string; subtitle: string; icon: string }) { return <div className="mt-2 flex items-center gap-3 rounded-xl bg-slate-50 p-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-[10px] font-black text-blue-700">{icon}</span><span><span className="block text-xs font-bold text-slate-700">{title}</span><span className="block text-[10px] text-slate-400">{subtitle}</span></span></div>; }
function Stat({ label, value, detail, tone }: { label: string; value: number; detail: string; tone: string }) { const colors: Record<string, string> = { blue: "bg-blue-50 text-blue-700", green: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", violet: "bg-violet-50 text-violet-700" }; return <div className={`rounded-xl p-4 ${colors[tone]}`}><p className="text-[10px] font-semibold">{label}</p><p className="mt-1 text-2xl font-black">{value}</p><p className="mt-1 text-[10px] opacity-70">{detail}</p></div>; }
function csvCell(value: string) { return `"${value.replaceAll('"', '""')}"`; }
function downloadBlob(content: string, filename: string, type: string) { const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url); }
