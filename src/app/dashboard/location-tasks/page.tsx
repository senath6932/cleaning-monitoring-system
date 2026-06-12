"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type Location = {
  locationId: string;
  code: string;
  locationName: string;
  minWorkers: number;
  assignedOfficerDisplay: string;
};

type Task = {
  taskId: string;
  taskName: string;
  description: string | null;
  category: {
    categoryId: string;
    categoryName: string;
  };
};

export default function LocationTasksPage() {
  const { data: session, status } = useSession();
  const [locations, setLocations] = useState<Location[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [locationId, setLocationId] = useState("");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [savedTasks, setSavedTasks] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingAssignment, setLoadingAssignment] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskCategoryId, setNewTaskCategoryId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    Promise.all([fetch("/api/locations"), fetch("/api/tasks")])
      .then(async ([locationsResponse, tasksResponse]) => {
        if (!locationsResponse.ok || !tasksResponse.ok) {
          throw new Error("Failed to load assignment data");
        }
        return Promise.all([
          locationsResponse.json() as Promise<Location[]>,
          tasksResponse.json() as Promise<Task[]>,
        ]);
      })
      .then(([locationsData, tasksData]) => {
        if (!ignore) {
          setLocations(locationsData);
          setTasks(tasksData);
        }
      })
      .catch(() => {
        if (!ignore) setMessage("Failed to load location task data.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!locationId) return;

    let ignore = false;

    fetch(`/api/location-tasks?locationId=${encodeURIComponent(locationId)}`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message || "Failed to load assigned tasks");
        }
        return Array.isArray(payload) ? (payload as string[]) : [];
      })
      .then((taskIds) => {
        if (!ignore) {
          setSelectedTasks(taskIds);
          setSavedTasks(taskIds);
        }
      })
      .catch((error: Error) => {
        if (!ignore) setMessage(error.message);
      })
      .finally(() => {
        if (!ignore) setLoadingAssignment(false);
      });

    return () => {
      ignore = true;
    };
  }, [locationId]);

  const selectedLocation = locations.find(
    (location) => location.locationId === locationId
  );

  const categories = useMemo(
    () =>
      Array.from(new Set(tasks.map((task) => task.category.categoryName))).sort(),
    [tasks]
  );

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter(
      (task) =>
        (!query ||
          `${task.taskName} ${task.description ?? ""}`
            .toLowerCase()
            .includes(query)) &&
        (!category || task.category.categoryName === category)
    );
  }, [tasks, search, category]);

  const selectedTaskObjects = tasks.filter((task) =>
    selectedTasks.includes(task.taskId)
  );
  const hasChanges =
    [...selectedTasks].sort().join(",") !== [...savedTasks].sort().join(",");

  if (status === "loading" || loading) {
    return <div className="p-6 text-sm text-slate-500">Loading task assignment...</div>;
  }

  if (session?.user?.role !== "General Administration Officer") {
    return <div className="p-6 text-sm text-red-600">Access Denied</div>;
  }

  function selectLocation(value: string) {
    setLocationId(value);
    setSearch("");
    setCategory("");
    setMessage("");
    setLoadingAssignment(Boolean(value));
    if (!value) {
      setSelectedTasks([]);
      setSavedTasks([]);
    }
  }

  function toggleTask(taskId: string) {
    if (!locationId) {
      setMessage("Select a location before assigning tasks.");
      return;
    }
    setSelectedTasks((current) =>
      current.includes(taskId)
        ? current.filter((id) => id !== taskId)
        : [...current, taskId]
    );
  }

  function selectAllVisible() {
    if (!locationId) {
      setMessage("Select a location before assigning tasks.");
      return;
    }
    setSelectedTasks((current) =>
      Array.from(new Set([...current, ...filteredTasks.map((task) => task.taskId)]))
    );
  }

  function loadDefaults() {
    if (!locationId) {
      setMessage("Select a location before assigning tasks.");
      return;
    }
    const defaultTasks = tasks
      .filter((task) => task.category.categoryName === "Daily")
      .map((task) => task.taskId);
    setSelectedTasks(defaultTasks.length ? defaultTasks : tasks.map((task) => task.taskId));
    setMessage("Default daily tasks loaded. Save to apply them.");
  }

  async function saveAssignment() {
    if (!locationId) {
      setMessage("Select a location before assigning tasks.");
      return;
    }
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/location-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locationId,
        taskIds: selectedTasks,
      }),
    });
    const result = await response.json();
    if (response.ok) {
      const saved = Array.isArray(result.taskIds) ? result.taskIds : selectedTasks;
      setSelectedTasks(saved);
      setSavedTasks(saved);
      setMessage("Tasks assigned successfully.");
    } else {
      setMessage(result.message || "Failed to assign tasks.");
    }
    setSaving(false);
  }

  async function createTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreatingTask(true);
    setMessage("");

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskName: newTaskName,
          description: newTaskDescription,
          categoryId: newTaskCategoryId,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create task.");
      }

      const createdTask = result as Task;
      setTasks((current) =>
        [...current, createdTask].sort((first, second) =>
          first.taskName.localeCompare(second.taskName)
        )
      );
      if (locationId) {
        setSelectedTasks((current) => [...current, createdTask.taskId]);
      }
      setNewTaskName("");
      setNewTaskDescription("");
      setNewTaskCategoryId("");
      setShowAddTask(false);
      setSearch("");
      setCategory("");
      setMessage(
        locationId
          ? "Task created and selected. Use Assign Tasks to save it to this location."
          : "Task created successfully."
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to create task.");
    } finally {
      setCreatingTask(false);
    }
  }

  return (
    <div className="space-y-4 text-slate-800">
      <header className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">Location Task Assignment</h1>
        <p className="mt-1 text-xs text-slate-500">
          Assign cleaning tasks that need to be performed at the selected location.
        </p>
      </header>

      {message && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs font-medium text-blue-700">
          {message}
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="text-xs font-bold text-slate-700">
            Select Location <span className="text-red-500">*</span>
            <select value={locationId} onChange={(event) => selectLocation(event.target.value)} className="task-control mt-3">
              <option value="">Select Location</option>
              {locations.map((location) => <option key={location.locationId} value={location.locationId}>{location.locationName}</option>)}
            </select>
          </label>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          {selectedLocation ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-blue-50 text-lg font-black text-blue-600">{selectedLocation.code}</div>
              <div className="grid flex-1 gap-3 sm:grid-cols-4">
                <Info label="Location Name" value={selectedLocation.locationName} />
                <Info label="Code" value={selectedLocation.code} />
                <Info label="Minimum Workers" value={String(selectedLocation.minWorkers)} />
                <Info label="Assigned Officer" value={selectedLocation.assignedOfficerDisplay} />
              </div>
              <div className="rounded-lg bg-blue-50 px-3 py-2 text-center text-xs font-bold text-blue-700">{savedTasks.length} Tasks</div>
            </div>
          ) : (
            <div className="grid min-h-20 place-items-center text-xs text-slate-400">Select a location to view its assignment summary.</div>
          )}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.7fr_0.8fr]">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_0.7fr_auto_auto_auto_auto]">
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search task name..." className="task-control" />
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="task-control"><option value="">All Categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>
              <ToolButton onClick={() => setShowAddTask((current) => !current)}>{showAddTask ? "Close Form" : "Add Task"}</ToolButton>
              <ToolButton onClick={selectAllVisible}>Select All</ToolButton>
              <ToolButton danger onClick={() => setSelectedTasks([])}>Clear All</ToolButton>
              <ToolButton onClick={loadDefaults}>Load Default Tasks</ToolButton>
            </div>
          </div>

          <div className="p-4">
            {showAddTask && (
              <form onSubmit={(event) => void createTask(event)} className="mb-5 rounded-xl border border-blue-200 bg-blue-50/60 p-4">
                <h2 className="text-sm font-bold text-slate-800">Add Cleaning Task</h2>
                <p className="mt-1 text-xs text-slate-500">Create a task and make it available for location assignments.</p>
                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_0.65fr_1.2fr_auto]">
                  <input required maxLength={120} value={newTaskName} onChange={(event) => setNewTaskName(event.target.value)} placeholder="Task name" className="task-control" />
                  <select required value={newTaskCategoryId} onChange={(event) => setNewTaskCategoryId(event.target.value)} className="task-control">
                    <option value="">Select frequency</option>
                    {Array.from(new Map(tasks.map((task) => [task.category.categoryId, task.category])).values()).map((item) => <option key={item.categoryId} value={item.categoryId}>{item.categoryName}</option>)}
                  </select>
                  <input value={newTaskDescription} onChange={(event) => setNewTaskDescription(event.target.value)} placeholder="Description (optional)" className="task-control" />
                  <button type="submit" disabled={creatingTask} className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white disabled:opacity-50">{creatingTask ? "Adding..." : "Add Task"}</button>
                </div>
              </form>
            )}
            <h2 className="text-sm font-bold text-slate-800">Cleaning Tasks</h2>
            <p className="mt-1 text-xs text-slate-500">Select the tasks that should be assigned to this location.</p>
            {loadingAssignment ? (
              <div className="grid min-h-60 place-items-center text-xs text-slate-400">Loading assigned tasks...</div>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                {filteredTasks.map((task) => {
                  const selected = selectedTasks.includes(task.taskId);
                  return <button key={task.taskId} type="button" disabled={!locationId} onClick={() => toggleTask(task.taskId)} className={`flex min-h-20 items-center gap-3 rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${selected ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-blue-200"}`}><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[10px] font-black ${selected ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>{taskInitials(task.taskName)}</span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-slate-700">{task.taskName}</span><span className="mt-1 block text-[10px] text-slate-400">{task.category.categoryName}</span></span><span className={`grid h-4 w-4 shrink-0 place-items-center rounded border text-[9px] ${selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"}`}>{selected ? "✓" : ""}</span></button>;
                })}
                {!filteredTasks.length && <div className="col-span-full grid min-h-32 place-items-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">No tasks match your search.</div>}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800">Task Summary</h2>
            <div className="mt-4 grid grid-cols-2 gap-3"><Summary label="Total Tasks" value={tasks.length} tone="blue" /><Summary label="Selected Tasks" value={selectedTasks.length} tone="green" /></div>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800">Selected Tasks Preview</h2>
            <div className="mt-3 max-h-[380px] overflow-y-auto">
              {selectedTaskObjects.length ? selectedTaskObjects.map((task) => <div key={task.taskId} className="flex items-center gap-2 border-b border-slate-100 py-2.5 last:border-0"><span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">✓</span><span className="flex-1 text-xs font-semibold text-slate-600">{task.taskName}</span><button type="button" aria-label={`Remove ${task.taskName}`} onClick={() => toggleTask(task.taskId)} className="text-xs text-slate-400 hover:text-red-500">×</button></div>) : <div className="grid min-h-32 place-items-center text-xs text-slate-400">No tasks selected.</div>}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold"><span>Total Selected</span><span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">{selectedTasks.length} Tasks</span></div>
          </section>
        </div>
      </section>

      <footer className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-lg bg-blue-50 px-4 py-3 text-xs text-blue-700">Assigned tasks will be visible to the evaluating officer for this location.</div>
        <div className="flex gap-2"><button type="button" onClick={() => setSelectedTasks(savedTasks)} disabled={!hasChanges || saving} className="rounded-lg border border-slate-200 px-5 py-2.5 text-xs font-semibold disabled:opacity-40">Reset</button><button type="button" onClick={() => void saveAssignment()} disabled={!locationId || saving || !hasChanges} className="rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white disabled:opacity-40">{saving ? "Assigning..." : "Assign Tasks"}</button></div>
      </footer>
      <style jsx global>{`.task-control{width:100%;height:2.6rem;border:1px solid #e2e8f0;border-radius:.6rem;background:#fff;padding:0 .8rem;font-size:.75rem;outline:none}.task-control:focus{border-color:#60a5fa;box-shadow:0 0 0 3px #dbeafe}`}</style>
    </div>
  );
}

function ToolButton({ children, onClick, danger = false }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) { return <button type="button" onClick={onClick} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${danger ? "border-red-200 text-red-600 hover:bg-red-50" : "border-slate-200 text-blue-600 hover:bg-blue-50"}`}>{children}</button>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="min-w-0"><p className="text-[9px] font-semibold uppercase text-slate-400">{label}</p><p className="mt-1 truncate text-xs font-bold text-slate-700" title={value}>{value}</p></div>; }
function Summary({ label, value, tone }: { label: string; value: number; tone: "blue" | "green" }) { return <div className={`rounded-xl p-4 text-center ${tone === "blue" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"}`}><p className="text-[10px] font-semibold">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></div>; }
function taskInitials(name: string) { return name.split(" ").map((word) => word[0]).slice(0, 2).join("").toUpperCase(); }
