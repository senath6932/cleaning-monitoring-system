"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type Location = {
  locationId: string;
  code: string;
  locationName: string;
  minWorkers: number;
  assignedOfficerName: string;
  assignedOfficerPosition: string;
  assignedOfficerDisplay: string;
};

type LocationForm = {
  code: string;
  locationName: string;
  minWorkers: string;
  officerId: string;
};

type Officer = {
  id: string;
  fullName: string;
  designation: string | null;
  email: string;
};

const emptyForm: LocationForm = {
  code: "",
  locationName: "",
  minWorkers: "0",
  officerId: "",
};

export default function LocationsPage() {
  const { data: session, status } = useSession();
  const [locations, setLocations] = useState<Location[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState("");
  const [workerFilter, setWorkerFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [form, setForm] = useState<LocationForm>(emptyForm);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [viewingLocation, setViewingLocation] = useState<Location | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadLocations() {
    setLoading(true);
    try {
      const response = await fetch("/api/locations");
      if (!response.ok) throw new Error("Failed to load locations");
      setLocations((await response.json()) as Location[]);
    } catch {
      setMessage("Failed to load locations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    Promise.all([fetch("/api/locations"), fetch("/api/officers")])
      .then(async ([locationsResponse, officersResponse]) => {
        if (!locationsResponse.ok || !officersResponse.ok) {
          throw new Error("Failed to load location data");
        }
        return Promise.all([
          locationsResponse.json() as Promise<Location[]>,
          officersResponse.json() as Promise<Officer[]>,
        ]);
      })
      .then(([locationsData, officersData]) => {
        if (!ignore) {
          setLocations(locationsData);
          setOfficers(officersData);
        }
      })
      .catch(() => {
        if (!ignore) setMessage("Failed to load locations.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const filteredLocations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return locations.filter((location) => {
      const assigned = location.assignedOfficerName !== "Not Assigned";
      const searchable = `${location.code} ${location.locationName} ${location.assignedOfficerDisplay}`.toLowerCase();
      return (
        (!query || searchable.includes(query)) &&
        (!assignmentFilter ||
          (assignmentFilter === "assigned" ? assigned : !assigned)) &&
        (!workerFilter ||
          (workerFilter === "1-3"
            ? location.minWorkers >= 1 && location.minWorkers <= 3
            : workerFilter === "4-6"
              ? location.minWorkers >= 4 && location.minWorkers <= 6
              : location.minWorkers >= 7))
      );
    });
  }, [locations, search, assignmentFilter, workerFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredLocations.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visibleLocations = filteredLocations.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );
  const visibleSelected =
    visibleLocations.length > 0 &&
    visibleLocations.every((location) =>
      selectedIds.includes(location.locationId)
    );

  if (status === "loading") {
    return <div className="p-6 text-sm text-slate-500">Loading locations...</div>;
  }

  if (session?.user?.role !== "General Administration Officer") {
    return <div className="p-6 text-sm text-red-600">Access Denied</div>;
  }

  function updateForm(field: keyof LocationForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function openCreate() {
    setForm(emptyForm);
    setEditingLocation(null);
    setCreateOpen(true);
    setMessage("");
  }

  function openEdit(location: Location) {
    setEditingLocation(location);
    setCreateOpen(false);
    setForm({
      code: location.code,
      locationName: location.locationName,
      minWorkers: String(location.minWorkers),
      officerId: "",
    });
    setMessage("");
  }

  function closeForm() {
    setCreateOpen(false);
    setEditingLocation(null);
    setForm(emptyForm);
  }

  async function saveLocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.code.trim() || !form.locationName.trim()) {
      setMessage("Location code and name are required.");
      return;
    }
    if (Number(form.minWorkers) < 0) {
      setMessage("Worker count cannot be negative.");
      return;
    }

    setSaving(true);
    setMessage("");
    const editing = Boolean(editingLocation);
    const response = await fetch(
      editing ? `/api/locations/${editingLocation?.locationId}` : "/api/locations",
      {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.trim(),
          locationName: form.locationName.trim(),
          minWorkers: Number(form.minWorkers),
          officerId: editing ? undefined : form.officerId,
        }),
      }
    );
    const result = await response.json();
    if (response.ok) {
      setMessage(editing ? "Location updated successfully." : "Location created successfully.");
      closeForm();
      await loadLocations();
    } else {
      setMessage(result.message || "Failed to save location.");
    }
    setSaving(false);
  }

  async function deactivateLocation(location: Location, skipConfirm = false) {
    if (!skipConfirm && !confirm(`Deactivate ${location.locationName}?`)) return false;
    const response = await fetch(`/api/locations/${location.locationId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setLocations((current) =>
        current.filter((item) => item.locationId !== location.locationId)
      );
      return true;
    }
    const result = await response.json();
    setMessage(result.message || "Failed to deactivate location.");
    return false;
  }

  async function bulkDeactivate() {
    const selected = locations.filter((location) =>
      selectedIds.includes(location.locationId)
    );
    if (!selected.length) {
      setMessage("Select at least one location.");
      return;
    }
    if (!confirm(`Deactivate ${selected.length} selected location(s)?`)) return;
    setSaving(true);
    const results = await Promise.all(
      selected.map((location) => deactivateLocation(location, true))
    );
    setSaving(false);
    if (results.every(Boolean)) {
      setSelectedIds([]);
      setMessage(`${selected.length} location(s) deactivated successfully.`);
    }
  }

  function resetFilters() {
    setSearch("");
    setAssignmentFilter("");
    setWorkerFilter("");
    setPage(1);
  }

  function exportCsv() {
    const rows = [
      ["Code", "Location Name", "Minimum Workers", "Assigned Evaluating Officer"],
      ...filteredLocations.map((location) => [
        location.code,
        location.locationName,
        String(location.minWorkers),
        location.assignedOfficerDisplay,
      ]),
    ];
    downloadBlob(
      rows.map((row) => row.map(csvCell).join(",")).join("\n"),
      "locations.csv",
      "text/csv;charset=utf-8"
    );
  }

  function exportExcel() {
    const rows = filteredLocations
      .map(
        (location) =>
          `<tr><td>${escapeHtml(location.code)}</td><td>${escapeHtml(location.locationName)}</td><td>${location.minWorkers}</td><td>${escapeHtml(location.assignedOfficerDisplay)}</td></tr>`
      )
      .join("");
    downloadBlob(
      `<table><tr><th>Code</th><th>Location Name</th><th>Minimum Workers</th><th>Assigned Evaluating Officer</th></tr>${rows}</table>`,
      "locations.xls",
      "application/vnd.ms-excel"
    );
  }

  return (
    <div className="space-y-4 text-slate-800">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Locations</h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage cleaning locations, assigned evaluating officers, and contract details.
          </p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700">
          <span className="text-lg leading-none">+</span> Add Location
        </button>
      </header>

      {message && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs font-medium text-blue-700">
          {message}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800">Search & Filter</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-[1.6fr_1fr_1fr_auto_auto]">
          <FilterField label="Search Location">
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search by code, name, or officer..." className="location-control" />
          </FilterField>
          <FilterField label="Assignment Status">
            <select value={assignmentFilter} onChange={(event) => { setAssignmentFilter(event.target.value); setPage(1); }} className="location-control">
              <option value="">All Assignments</option><option value="assigned">Assigned</option><option value="unassigned">Not Assigned</option>
            </select>
          </FilterField>
          <FilterField label="Minimum Workers">
            <select value={workerFilter} onChange={(event) => { setWorkerFilter(event.target.value); setPage(1); }} className="location-control">
              <option value="">All Worker Counts</option><option value="1-3">1 - 3 Workers</option><option value="4-6">4 - 6 Workers</option><option value="7+">7+ Workers</option>
            </select>
          </FilterField>
          <button type="button" onClick={resetFilters} className="mt-auto h-10 rounded-lg border border-slate-200 px-4 text-xs font-semibold hover:bg-slate-50">Reset</button>
          <button type="button" className="mt-auto h-10 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white">Filter</button>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-xs font-semibold text-slate-600">
            Showing {filteredLocations.length ? (safePage - 1) * pageSize + 1 : 0} to {Math.min(safePage * pageSize, filteredLocations.length)} of {filteredLocations.length} locations
          </p>
          <div className="flex flex-wrap gap-2">
            <ToolbarButton label="Export Excel" onClick={exportExcel} />
            <ToolbarButton label="Export CSV" onClick={exportCsv} />
            <ToolbarButton label="Export PDF" onClick={() => window.print()} />
            <ToolbarButton label="Print" onClick={() => window.print()} />
            <button type="button" disabled={!selectedIds.length || saving} onClick={() => void bulkDeactivate()} className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 disabled:opacity-40">Deactivate Selected</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3"><input type="checkbox" checked={visibleSelected} onChange={(event) => setSelectedIds((current) => event.target.checked ? Array.from(new Set([...current, ...visibleLocations.map((location) => location.locationId)])) : current.filter((id) => !visibleLocations.some((location) => location.locationId === id)))} /></th>
                <th className="px-3 py-3">Code</th><th className="px-3 py-3">Location Name</th><th className="px-3 py-3">Minimum Workers</th><th className="px-3 py-3">Assigned Evaluating Officer</th><th className="px-3 py-3">Assignment</th><th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-500">Loading locations...</td></tr>
              ) : visibleLocations.length ? visibleLocations.map((location) => {
                const assigned = location.assignedOfficerName !== "Not Assigned";
                return (
                  <tr key={location.locationId} className="border-t border-slate-100 hover:bg-slate-50/70">
                    <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(location.locationId)} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, location.locationId] : current.filter((id) => id !== location.locationId))} /></td>
                    <td className="px-3 py-3"><span className="rounded-md bg-blue-50 px-2 py-1 font-bold text-blue-700">{location.code}</span></td>
                    <td className="px-3 py-3 font-semibold text-slate-700">{location.locationName}</td>
                    <td className="px-3 py-3">{location.minWorkers}</td>
                    <td className="max-w-64 px-3 py-3">{location.assignedOfficerDisplay}</td>
                    <td className="px-3 py-3"><span className={`rounded-md px-2 py-1 text-[10px] font-semibold ${assigned ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{assigned ? "Assigned" : "Not Assigned"}</span></td>
                    <td className="px-3 py-3"><div className="flex justify-end gap-1.5"><ActionButton label="View" onClick={() => setViewingLocation(location)}>View</ActionButton><ActionButton label="Edit" onClick={() => openEdit(location)}>Edit</ActionButton><ActionButton label="Deactivate" danger onClick={() => void deactivateLocation(location)}>Delete</ActionButton></div></td>
                  </tr>
                );
              }) : <tr><td colSpan={7} className="p-8 text-center text-slate-500">No locations match the selected filters.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-xs text-slate-500">Show <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="rounded border border-slate-200 px-2 py-1.5"><option>5</option><option>10</option><option>20</option><option>50</option></select> entries</label>
          <div className="flex gap-1"><PageButton disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>Previous</PageButton>{Array.from({ length: pageCount }, (_, index) => index + 1).slice(Math.max(0, safePage - 3), safePage + 2).map((number) => <PageButton key={number} active={number === safePage} onClick={() => setPage(number)}>{number}</PageButton>)}<PageButton disabled={safePage === pageCount} onClick={() => setPage(safePage + 1)}>Next</PageButton></div>
        </div>
      </section>

      {(createOpen || editingLocation) && <LocationFormModal title={editingLocation ? "Edit Location" : "Add Location"} form={form} officers={officers} editing={Boolean(editingLocation)} saving={saving} updateForm={updateForm} onSubmit={saveLocation} onClose={closeForm} />}
      {viewingLocation && <LocationDetailsModal location={viewingLocation} onClose={() => setViewingLocation(null)} />}
      <style jsx global>{`.location-control{width:100%;height:2.5rem;border:1px solid #e2e8f0;border-radius:.5rem;background:#fff;padding:0 .75rem;font-size:.75rem;outline:none}.location-control:focus{border-color:#60a5fa;box-shadow:0 0 0 3px #dbeafe}@media print{aside,button,select,input{display:none!important}main{padding:0!important}.shadow-sm{box-shadow:none!important}}`}</style>
    </div>
  );
}

function LocationFormModal({ title, form, officers, editing, saving, updateForm, onSubmit, onClose }: { title: string; form: LocationForm; officers: Officer[]; editing: boolean; saving: boolean; updateForm: (field: keyof LocationForm, value: string) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onClose: () => void }) {
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/40 p-4"><form onSubmit={onSubmit} className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">{title}</h2><p className="mt-1 text-xs text-slate-500">Enter the cleaning location details.</p></div><button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold">Close</button></div><div className="mt-5 grid gap-4 md:grid-cols-2"><FormInput label="Location Code" value={form.code} onChange={(value) => updateForm("code", value)} required /><FormInput label="Location Name" value={form.locationName} onChange={(value) => updateForm("locationName", value)} required /><FormInput label="Minimum Workers" type="number" min="0" value={form.minWorkers} onChange={(value) => updateForm("minWorkers", value)} required />{!editing && <label className="text-xs font-semibold text-slate-600">Assign Evaluating Officer<select value={form.officerId} onChange={(event) => updateForm("officerId", event.target.value)} className="location-control mt-2"><option value="">Not Assigned</option>{officers.map((officer) => <option key={officer.id} value={officer.id}>{officer.designation ? `${officer.designation} - ${officer.fullName}` : officer.fullName}</option>)}</select><span className="mt-1 block text-[10px] font-normal text-slate-400">Optional. You can assign an officer later.</span></label>}</div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold">Cancel</button><button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : title}</button></div></form></div>;
}

function LocationDetailsModal({ location, onClose }: { location: Location; onClose: () => void }) {
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/40 p-4"><div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Location Details</h2><button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold">Close</button></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><Detail label="Code" value={location.code} /><Detail label="Location Name" value={location.locationName} /><Detail label="Minimum Workers" value={String(location.minWorkers)} /><Detail label="Assigned Officer" value={location.assignedOfficerName} /><Detail label="Officer Position" value={location.assignedOfficerPosition} /></div></div></div>;
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) { return <label className="text-[10px] font-semibold text-slate-600">{label}<span className="mt-2 block">{children}</span></label>; }
function FormInput({ label, value, onChange, type = "text", min, required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; min?: string; required?: boolean }) { return <label className="text-xs font-semibold text-slate-600">{label}<input type={type} min={min} value={value} onChange={(event) => onChange(event.target.value)} required={required} className="location-control mt-2" /></label>; }
function Detail({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-700">{value}</p></div>; }
function ToolbarButton({ label, onClick }: { label: string; onClick: () => void }) { return <button type="button" onClick={onClick} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50">{label}</button>; }
function ActionButton({ label, onClick, children, danger = false }: { label: string; onClick: () => void; children: React.ReactNode; danger?: boolean }) { return <button type="button" aria-label={label} onClick={onClick} className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold ${danger ? "border-red-200 text-red-600 hover:bg-red-50" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{children}</button>; }
function PageButton({ children, onClick, disabled = false, active = false }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; active?: boolean }) { return <button type="button" onClick={onClick} disabled={disabled} className={`rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-40 ${active ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600"}`}>{children}</button>; }
function csvCell(value: string) { return `"${value.replaceAll('"', '""')}"`; }
function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character); }
function downloadBlob(content: string, filename: string, type: string) { const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url); }
