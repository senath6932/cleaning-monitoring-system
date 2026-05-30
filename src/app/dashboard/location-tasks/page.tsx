"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Location = {
  locationId: string;
  locationName: string;
};

type Task = {
  taskId: string;
  taskName: string;
};

export default function LocationTasksPage() {
  const { data: session, status } = useSession();
  const [locations, setLocations] = useState<Location[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [locationId, setLocationId] = useState("");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/locations")
      .then((res) => res.json())
      .then(setLocations);

    fetch("/api/tasks")
      .then((res) => res.json())
      .then(setTasks);
  }, []);

  if (status === "loading") {
    return <div className="p-6">Loading...</div>;
  }

  if (session?.user?.role !== "General Administration Officer") {
    return <div className="p-6">Access Denied</div>;
  }

  function toggleTask(taskId: string) {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const response = await fetch("/api/location-tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        locationId,
        taskIds: selectedTasks,
      }),
    });

    if (response.ok) {
      alert("Tasks Assigned");
    }
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Location Task Assignment</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          className="border p-2"
        >
          <option value="">Select Location</option>

          {locations.map((location) => (
            <option key={location.locationId} value={location.locationId}>
              {location.locationName}
            </option>
          ))}
        </select>

        <div className="grid gap-2">
          {tasks.map((task) => (
            <label key={task.taskId} className="flex gap-2">
              <input
                type="checkbox"
                checked={selectedTasks.includes(task.taskId)}
                onChange={() => toggleTask(task.taskId)}
              />

              {task.taskName}
            </label>
          ))}
        </div>

        <button className="rounded bg-blue-600 px-4 py-2 text-white">
          Assign Tasks
        </button>
      </form>
    </div>
  );
}
