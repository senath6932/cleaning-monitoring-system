"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Officer = {
  userId: string;
  fullName: string;
};

type Location = {
  locationId: string;
  locationName: string;
};

export default function AssignmentPage() {
  const { data: session, status } = useSession();
  const [officers, setOfficers] = useState<
    Officer[]
  >([]);

  const [locations, setLocations] = useState<
    Location[]
  >([]);

  const [officerId, setOfficerId] =
    useState("");

  const [locationId, setLocationId] =
    useState("");

  useEffect(() => {
    fetch("/api/officers")
      .then((res) => res.json())
      .then(setOfficers);

    fetch("/api/locations")
      .then((res) => res.json())
      .then(setLocations);
  }, []);

  if (status === "loading") {
    return <div className="p-8">Loading...</div>;
  }

  if (session?.user?.role !== "General Administration Officer") {
    return <div className="p-8">Access Denied</div>;
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const response = await fetch(
      "/api/assignments",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          officerId,
          locationId,
        }),
      }
    );

    if (response.ok) {
      alert("Assignment created");
    }
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">
        Location Assignment
      </h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-md space-y-4"
      >
        <select
          className="w-full border p-2"
          value={officerId}
          onChange={(e) =>
            setOfficerId(e.target.value)
          }
        >
          <option value="">
            Select Officer
          </option>

          {officers.map((officer) => (
            <option
              key={officer.userId}
              value={officer.userId}
            >
              {officer.fullName}
            </option>
          ))}
        </select>

        <select
          className="w-full border p-2"
          value={locationId}
          onChange={(e) =>
            setLocationId(e.target.value)
          }
        >
          <option value="">
            Select Location
          </option>

          {locations.map((location) => (
            <option
              key={location.locationId}
              value={location.locationId}
            >
              {location.locationName}
            </option>
          ))}
        </select>

        <button
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Assign
        </button>
      </form>
    </div>
  );
}
