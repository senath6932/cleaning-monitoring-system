"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Location = {
  locationId: string;
  locationName: string;
};

type Task = {
  locationTaskId: string;
  taskName: string;
  categoryName: string;
};

type TaskResult = "P" | "X" | "NA";

export default function EvaluationsPage() {
  const { data: session, status } = useSession();
  const [locations, setLocations] = useState<Location[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [locationId, setLocationId] = useState("");
  const [month, setMonth] = useState(
    new Date().getMonth() + 1
  );
  const [year, setYear] = useState(
    new Date().getFullYear()
  );

  const [results, setResults] = useState<
    Record<string, TaskResult>
  >({});

  // Load locations
  useEffect(() => {
    fetch("/api/evaluations/locations")
      .then((res) => res.json())
      .then(setLocations);
  }, []);

  // Load tasks when location changes
  useEffect(() => {
    if (!locationId) return;

    fetch(`/api/evaluations/tasks/${locationId}`)
      .then((res) => res.json())
      .then(setTasks);
  }, [locationId]);

  if (status === "loading") {
    return <div className="p-6">Loading...</div>;
  }

  if (session?.user?.role !== "Evaluating Officer") {
    return <div className="p-6">Access Denied</div>;
  }

  function updateResult(
    locationTaskId: string,
    result: TaskResult
  ) {
    setResults((prev) => ({
      ...prev,
      [locationTaskId]: result,
    }));
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const response =
      await fetch("/api/evaluations", {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          locationId,
          month,
          year,
          results,
        }),
      });

    const data =
      await response.json();

    if (response.ok) {
      alert(
        `Evaluation Saved. Percentage: ${data.percentage.toFixed(
          2
        )}%`
      );
    } else {
      alert(data.message);
    }
  }

  const dailyTasks = tasks.filter(
    (t) => t.categoryName === "Daily"
  );

  const weeklyTasks = tasks.filter(
    (t) => t.categoryName === "Weekly"
  );

  const monthlyTasks = tasks.filter(
    (t) => t.categoryName === "Monthly"
  );

  return (
    <div className="p-6 text-slate-900">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">
        Evaluation Form
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        {/* Location */}
        <div>
          <label className="mb-2 block font-semibold text-slate-800">
            Location
          </label>

          <select
            value={locationId}
            onChange={(e) =>
              setLocationId(e.target.value)
            }
            className="rounded border border-slate-300 bg-white p-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
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
        </div>

        {/* Month / Year */}
        <div className="flex gap-4">
          <div>
            <label className="mb-2 block font-semibold text-slate-800">
              Month
            </label>

            <select
              value={month}
              onChange={(e) =>
                setMonth(Number(e.target.value))
              }
              className="rounded border border-slate-300 bg-white p-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
            >
              {Array.from(
                { length: 12 },
                (_, i) => (
                  <option
                    key={i + 1}
                    value={i + 1}
                  >
                    {i + 1}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-800">
              Year
            </label>

            <select
              value={year}
              onChange={(e) =>
                setYear(Number(e.target.value))
              }
              className="rounded border border-slate-300 bg-white p-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
            >
              {[2025, 2026, 2027].map((y) => (
                <option
                  key={y}
                  value={y}
                >
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Daily Tasks */}
        <TaskSection
          title="Daily Tasks"
          tasks={dailyTasks}
          results={results}
          updateResult={updateResult}
        />

        {/* Weekly Tasks */}
        <TaskSection
          title="Weekly Tasks"
          tasks={weeklyTasks}
          results={results}
          updateResult={updateResult}
        />

        {/* Monthly Tasks */}
        <TaskSection
          title="Monthly Tasks"
          tasks={monthlyTasks}
          results={results}
          updateResult={updateResult}
        />

        <button
          className="rounded bg-blue-600 px-6 py-2 font-medium text-white shadow-sm hover:bg-blue-700"
        >
          Submit Evaluation
        </button>
      </form>
    </div>
  );
}

function TaskSection({
  title,
  tasks,
  results,
  updateResult,
}: any) {
  if (tasks.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-slate-900">
        {title}
      </h2>

      <div className="space-y-4">
        {tasks.map((task: any) => (
          <div
            key={task.locationTaskId}
            className="rounded border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-2 font-medium text-slate-900">
              {task.taskName}
            </div>

            <div className="flex gap-6">
              {["P", "X", "NA"].map((result) => (
                <label
                  key={result}
                  className="flex items-center gap-2 text-slate-800"
                >
                  <input
                    type="radio"
                    name={task.locationTaskId}
                    checked={
                      results[
                        task.locationTaskId
                      ] === result
                    }
                    onChange={() =>
                      updateResult(
                        task.locationTaskId,
                        result as TaskResult
                      )
                    }
                  />
                  {result}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
