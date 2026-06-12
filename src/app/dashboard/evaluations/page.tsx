"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Location = {
  locationId: string;
  code?: string;
  locationName: string;
};

type Task = {
  locationTaskId: string;
  taskName: string;
  categoryName: string;
};

type TaskResult = "P" | "X" | "NA";

type EditableReport = {
  reportId: string;
  locationId: string;
  evaluationMonth: number;
  evaluationYear: number;
  officerRemarks: string | null;
  status: string;
  taskEvaluations: {
    locationTaskId: string;
    result: TaskResult;
    remarks: string | null;
  }[];
};

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const resubmissionStatuses = new Set([
  "CORRECTION_REQUESTED",
  "ADMIN_REJECTED",
  "VC_REJECTED",
  "REJECTED",
]);

const preferredCategoryOrder = ["Daily", "Weekly", "Monthly"];

export default function EvaluationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reportId, setReportId] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [locationId, setLocationId] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [officerRemarks, setOfficerRemarks] = useState("");
  const [editingStatus, setEditingStatus] = useState("");
  const [results, setResults] = useState<Record<string, TaskResult>>({});
  const [taskRemarks, setTaskRemarks] = useState<Record<string, string>>({});
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error" | "info">("info");

  useEffect(() => {
    let ignore = false;

    async function loadLocations() {
      try {
        const res = await fetch("/api/evaluations/locations");
        const data = (await res.json()) as Location[];

        if (!ignore) setLocations(Array.isArray(data) ? data : []);
      } catch {
        if (!ignore) showPopup("Failed to load assigned locations.", "error");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void loadLocations();

    void Promise.resolve().then(() => {
      if (!ignore) {
        setReportId(new URLSearchParams(window.location.search).get("reportId"));
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!reportId) return;

    async function loadReport() {
      const res = await fetch(`/api/evaluations?reportId=${reportId}`);
      const data = (await res.json()) as EditableReport;

      if (!res.ok) {
        showPopup("Failed to load editable report.", "error");
        return;
      }

      setLocationId(data.locationId);
      setMonth(data.evaluationMonth);
      setYear(data.evaluationYear);
      setOfficerRemarks(data.officerRemarks ?? "");
      setEditingStatus(data.status);
      setResults(
        Object.fromEntries(
          data.taskEvaluations.map((evaluation) => [
            evaluation.locationTaskId,
            evaluation.result,
          ])
        )
      );
      setTaskRemarks(
        Object.fromEntries(
          data.taskEvaluations.map((evaluation) => [
            evaluation.locationTaskId,
            evaluation.remarks ?? "",
          ])
        )
      );
    }

    void loadReport();
  }, [reportId]);

  useEffect(() => {
    if (!locationId) return;

    let ignore = false;

    void Promise.resolve().then(() => {
      if (!ignore) setTasksLoading(true);

      return fetch(`/api/evaluations/tasks/${locationId}`)
        .then((res) => res.json())
        .then((data) => {
          if (!ignore) {
            const loadedTasks = Array.isArray(data) ? (data as Task[]) : [];
            setTasks(loadedTasks);
            setActiveCategory((current) =>
              loadedTasks.some(
                (task) => normalizeCategory(task.categoryName) === current
              )
                ? current
                : getOrderedCategories(loadedTasks)[0] ?? ""
            );
          }
        })
        .catch(() => {
          if (!ignore) showPopup("Failed to load task checklist.", "error");
        })
        .finally(() => {
          if (!ignore) setTasksLoading(false);
        });
    });

    return () => {
      ignore = true;
    };
  }, [locationId]);

  const groupedTasks = useMemo(() => {
    const categories = getOrderedCategories(tasks);

    return categories.map((category) => ({
      category,
      tasks: tasks.filter(
        (task) => normalizeCategory(task.categoryName) === category
      ),
    }));
  }, [tasks]);

  const activeTaskGroup =
    groupedTasks.find((group) => group.category === activeCategory) ??
    groupedTasks[0];
  const markedTaskCount = Object.keys(results).length;

  if (status === "loading" || loading) {
    return <div className="p-6 text-slate-700">Loading evaluation form...</div>;
  }

  if (session?.user?.role !== "Evaluating Officer") {
    return <div className="p-6 text-slate-700">Access Denied</div>;
  }

  function updateResult(locationTaskId: string, result: TaskResult) {
    setResults((prev) => ({
      ...prev,
      [locationTaskId]: result,
    }));
  }

  function updateTaskRemark(locationTaskId: string, value: string) {
    setTaskRemarks((prev) => ({
      ...prev,
      [locationTaskId]: value,
    }));
  }

  function showPopup(message: string, tone: "success" | "error" | "info" = "info") {
    setMessageTone(tone);
    setToast(message);
  }

  async function saveEvaluation(action: "DRAFT" | "SUBMIT") {
    setToast("");

    if (!locationId || !month || !year) {
      showPopup("Please select location, month, and year.", "error");
      return;
    }

    if (action !== "DRAFT" && Object.keys(results).length === 0) {
      showPopup("Please mark at least one task before submitting.", "error");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/evaluations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId,
          locationId,
          month,
          year,
          officerRemarks,
          results,
          taskRemarks,
          action:
            action === "DRAFT"
              ? "DRAFT"
              : resubmissionStatuses.has(editingStatus)
                ? "RESUBMIT"
                : "SUBMIT",
        }),
      });

      const data = await response.json().catch(() => ({} as { message?: string }));
      const message = data.message || "Failed to save evaluation.";

      if (response.ok) {
        showPopup(message, "success");

        if (action !== "DRAFT") {
          router.push("/dashboard/evaluations/history?submitted=1");
        }
      } else {
        showPopup(message, "error");
      }
    } catch {
      showPopup("Could not connect to the server. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await saveEvaluation("SUBMIT");
  }

  return (
    <div className="space-y-6 p-6 text-slate-900">
      <div>
        <p className="text-sm font-medium text-blue-700">Evaluating Officer</p>
        <h1 className="text-3xl font-bold">Evaluation Submission</h1>
      </div>

      {toast && <PopupMessage message={toast} tone={messageTone} onClose={() => setToast("")} />}

      {locations.length === 0 ? (
        <div className="rounded border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          No assigned locations found.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-3">
              <label className="block text-sm font-semibold text-slate-800">
                Location
                <select
                  value={locationId}
                  onChange={(e) => {
                    setLocationId(e.target.value);
                    setTasks([]);
                    setResults({});
                    setTaskRemarks({});
                    setActiveCategory("");
                  }}
                  className="mt-2 w-full rounded border border-slate-300 bg-white p-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                  disabled={Boolean(reportId)}
                  required
                >
                  <option value="">Select Location</option>
                  {locations.map((location) => (
                    <option key={location.locationId} value={location.locationId}>
                      {location.code ? `${location.code} - ` : ""}
                      {location.locationName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-800">
                Month
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="mt-2 w-full rounded border border-slate-300 bg-white p-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                  disabled={Boolean(reportId)}
                >
                  {months.map((name, index) => (
                    <option key={name} value={index + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-800">
                Year
                <input
                  type="number"
                  value={year}
                  min={2020}
                  max={2100}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="mt-2 w-full rounded border border-slate-300 bg-white p-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                  disabled={Boolean(reportId)}
                />
              </label>
            </div>
          </section>

          {!locationId ? (
            <div className="rounded border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
              Select an assigned location to load its task checklist.
            </div>
          ) : tasksLoading ? (
            <div className="rounded border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
              Loading task checklist...
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
              No cleaning tasks are assigned to this location.
            </div>
          ) : (
            <>
              <CategoryBar
                groups={groupedTasks}
                activeCategory={activeTaskGroup?.category ?? ""}
                results={results}
                onSelect={setActiveCategory}
              />

              {activeTaskGroup && (
                <TaskSection
                  key={activeTaskGroup.category}
                  title={`${activeTaskGroup.category} Tasks`}
                  tasks={activeTaskGroup.tasks}
                  results={results}
                  taskRemarks={taskRemarks}
                  updateResult={updateResult}
                  updateTaskRemark={updateTaskRemark}
                />
              )}

              <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
                <label className="block text-sm font-semibold text-slate-800">
                  Officer Remarks
                  <textarea
                    value={officerRemarks}
                    onChange={(e) => setOfficerRemarks(e.target.value)}
                    rows={4}
                    className="mt-2 w-full rounded border border-slate-300 bg-white p-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                  />
                </label>
              </section>

              <div className="flex flex-wrap gap-3">
                <div className="mr-auto flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
                  Marked {markedTaskCount} of {tasks.length} tasks
                </div>
                <button
                  type="button"
                  onClick={() => saveEvaluation("DRAFT")}
                  disabled={saving}
                  className="rounded bg-slate-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Draft"}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving
                    ? "Submitting..."
                    : resubmissionStatuses.has(editingStatus)
                      ? "Resubmit Evaluation"
                      : "Submit Evaluation"}
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  );
}

function CategoryBar({
  groups,
  activeCategory,
  results,
  onSelect,
}: {
  groups: Array<{ category: string; tasks: Task[] }>;
  activeCategory: string;
  results: Record<string, TaskResult>;
  onSelect: (category: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-sm font-bold text-slate-900">Choose Task Schedule</h2>
        <p className="mt-1 text-xs text-slate-500">
          Switch schedules freely. Your marked results and remarks are preserved.
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {groups.map((group) => {
          const marked = group.tasks.filter(
            (task) => results[task.locationTaskId]
          ).length;
          const selected = group.category === activeCategory;

          return (
            <button
              key={group.category}
              type="button"
              onClick={() => onSelect(group.category)}
              className={`rounded-xl border px-4 py-3 text-left transition ${
                selected
                  ? "border-blue-600 bg-blue-600 text-white shadow-md"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              <span className="block text-sm font-bold">{group.category} Tasks</span>
              <span
                className={`mt-1 block text-xs ${
                  selected ? "text-blue-100" : "text-slate-500"
                }`}
              >
                {marked} of {group.tasks.length} marked
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function getOrderedCategories(tasks: Task[]) {
  return Array.from(
    new Set(tasks.map((task) => normalizeCategory(task.categoryName)))
  ).sort((left, right) => {
    const leftIndex = preferredCategoryOrder.indexOf(left);
    const rightIndex = preferredCategoryOrder.indexOf(right);

    if (leftIndex === -1 && rightIndex === -1) return left.localeCompare(right);
    if (leftIndex === -1) return 1;
    if (rightIndex === -1) return -1;
    return leftIndex - rightIndex;
  });
}

function normalizeCategory(categoryName: string) {
  return categoryName.trim() || "Uncategorized";
}

function PopupMessage({
  message,
  tone,
  onClose,
}: {
  message: string;
  tone: "success" | "error" | "info";
  onClose: () => void;
}) {
  const toneClasses = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-blue-200 bg-blue-50 text-blue-800",
  };

  const title = tone === "success" ? "Success" : tone === "error" ? "Evaluation not saved" : "Notice";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <div className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl ${toneClasses[tone]}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-6">{message}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-current/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/60"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function TaskSection({
  title,
  tasks,
  results,
  taskRemarks,
  updateResult,
  updateTaskRemark,
}: {
  title: string;
  tasks: Task[];
  results: Record<string, TaskResult>;
  taskRemarks: Record<string, string>;
  updateResult: (locationTaskId: string, result: TaskResult) => void;
  updateTaskRemark: (locationTaskId: string, value: string) => void;
}) {
  return (
    <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <div className="mt-4 space-y-4">
        {tasks.map((task) => (
          <div
            key={task.locationTaskId}
            className="grid gap-3 rounded border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_220px] md:items-start"
          >
            <div>
              <div className="font-medium text-slate-900">{task.taskName}</div>
              <textarea
                value={taskRemarks[task.locationTaskId] ?? ""}
                onChange={(e) =>
                  updateTaskRemark(task.locationTaskId, e.target.value)
                }
                placeholder="Task remarks"
                rows={2}
                className="mt-3 w-full rounded border border-slate-300 bg-white p-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["P", "X", "NA"] as TaskResult[]).map((result) => (
                <label
                  key={result}
                  className={`flex cursor-pointer items-center justify-center rounded border px-3 py-2 text-sm font-semibold ${
                    results[task.locationTaskId] === result
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name={task.locationTaskId}
                    checked={results[task.locationTaskId] === result}
                    onChange={() => updateResult(task.locationTaskId, result)}
                    className="sr-only"
                  />
                  {result}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
