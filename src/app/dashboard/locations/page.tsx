"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function LocationsPage() {
  const { data: session, status } = useSession();
  const [locations, setLocations] = useState<any[]>([]);
  const [newCode, setNewCode] = useState("");
  const [newLocationName, setNewLocationName] =
    useState("");
  const [newMinWorkers, setNewMinWorkers] =
    useState(0);
  const [creating, setCreating] = useState(false);

  async function loadLocations() {
    const res = await fetch("/api/locations");
    const data = await res.json();
    setLocations(data);
  }

  useEffect(() => {
    loadLocations();
  }, []);

  if (status === "loading") {
    return <div className="p-6">Loading...</div>;
  }

  if (session?.user?.role !== "General Administration Officer") {
    return <div className="p-6">Access Denied</div>;
  }

  async function createLocation() {
    if (!newCode.trim() || !newLocationName.trim()) {
      alert("Please enter a code and location name.");
      return;
    }

    setCreating(true);

    const response = await fetch("/api/locations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: newCode.trim(),
        locationName: newLocationName.trim(),
        minWorkers: newMinWorkers,
      }),
    });

    if (response.ok) {
      alert("Location created");
      setNewCode("");
      setNewLocationName("");
      setNewMinWorkers(0);
      await loadLocations();
    } else {
      const data = await response.json();
      alert(data.message || "Failed to create location");
    }

    setCreating(false);
  }

  return (
    <div className="p-6 text-slate-900">
      <h1 className="mb-6 text-3xl font-bold">
        Locations
      </h1>

      <div className="mb-8 rounded border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">
          Add New Location
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Code
            </label>

            <input
              type="text"
              value={newCode}
              onChange={(e) =>
                setNewCode(e.target.value)
              }
              className="w-full rounded border border-slate-300 bg-white p-2"
              placeholder="A"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Location Name
            </label>

            <input
              type="text"
              value={newLocationName}
              onChange={(e) =>
                setNewLocationName(e.target.value)
              }
              className="w-full rounded border border-slate-300 bg-white p-2"
              placeholder="Faculty of Business Studies & Finance"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Number of Workers
            </label>

            <input
              type="number"
              value={newMinWorkers}
              onChange={(e) =>
                setNewMinWorkers(Number(e.target.value))
              }
              className="w-full rounded border border-slate-300 bg-white p-2"
            />
          </div>
        </div>

        <button
          onClick={createLocation}
          disabled={creating}
          className="mt-4 rounded bg-emerald-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {creating ? "Creating..." : "Create Location"}
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">Code</th>
            <th className="border p-2">Location</th>
            <th className="border p-2">Workers</th>
          </tr>
        </thead>

        <tbody>
          {locations.map((location) => (
            <tr key={location.locationId}>
              <td className="border p-2">
                {location.code}
              </td>

              <td className="border p-2">
                {location.locationName}
              </td>

              <td className="border p-2">
                {location.minWorkers}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
