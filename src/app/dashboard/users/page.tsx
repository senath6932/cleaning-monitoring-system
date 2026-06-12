"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type Role = {
  id: string;
  roleName: string;
  roleCode: string;
};

type User = {
  id: string;
  fullName: string;
  email: string;
  roleId: string;
  role: Role;
  phoneNumber: string | null;
  department: string | null;
  designation: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  assignedLocations: Array<{ code: string; locationName: string }>;
};

type UserForm = {
  fullName: string;
  email: string;
  password: string;
  newPassword: string;
  roleId: string;
  phoneNumber: string;
  department: string;
  designation: string;
  isActive: boolean;
};

const emptyForm: UserForm = {
  fullName: "",
  email: "",
  password: "",
  newPassword: "",
  roleId: "",
  phoneNumber: "",
  department: "",
  designation: "",
  isActive: true,
};

const roleTone: Record<string, string> = {
  "General Administration Officer": "bg-emerald-50 text-emerald-700",
  "Administration Officer": "bg-blue-50 text-blue-700",
  "Evaluating Officer": "bg-violet-50 text-violet-700",
  "Vice Chancellor": "bg-red-50 text-red-700",
  "Finance Officer": "bg-amber-50 text-amber-700",
};

export default function UsersPage() {
  const { data: session, status } = useSession();
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [designationFilter, setDesignationFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [rolesResponse, usersResponse] = await Promise.all([
        fetch("/api/roles"),
        fetch("/api/users"),
      ]);
      if (!rolesResponse.ok || !usersResponse.ok) {
        throw new Error("Failed to load user data");
      }
      setRoles((await rolesResponse.json()) as Role[]);
      setUsers((await usersResponse.json()) as User[]);
    } catch {
      setMessage("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    Promise.all([fetch("/api/roles"), fetch("/api/users")])
      .then(async ([rolesResponse, usersResponse]) => {
        if (!rolesResponse.ok || !usersResponse.ok) {
          throw new Error("Failed to load user data");
        }
        return Promise.all([
          rolesResponse.json() as Promise<Role[]>,
          usersResponse.json() as Promise<User[]>,
        ]);
      })
      .then(([rolesData, usersData]) => {
        if (!ignore) {
          setRoles(rolesData);
          setUsers(usersData);
        }
      })
      .catch(() => {
        if (!ignore) setMessage("Failed to load users.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const departments = useMemo(
    () =>
      Array.from(
        new Set(users.map((user) => user.department).filter(Boolean) as string[])
      ).sort(),
    [users]
  );

  const designations = useMemo(
    () =>
      Array.from(
        new Set(users.map((user) => user.designation).filter(Boolean) as string[])
      ).sort(),
    [users]
  );

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const searchable = [
        user.fullName,
        user.email,
        user.phoneNumber,
        user.department,
        user.designation,
        ...user.assignedLocations.map((location) => location.locationName),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!query || searchable.includes(query)) &&
        (!roleFilter || user.roleId === roleFilter) &&
        (!departmentFilter || user.department === departmentFilter) &&
        (!statusFilter ||
          (statusFilter === "active" ? user.isActive : !user.isActive)) &&
        (!designationFilter || user.designation === designationFilter)
      );
    });
  }, [
    users,
    search,
    roleFilter,
    departmentFilter,
    statusFilter,
    designationFilter,
  ]);

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visibleUsers = filteredUsers.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );
  const visibleSelected =
    visibleUsers.length > 0 &&
    visibleUsers.every((user) => selectedIds.includes(user.id));

  const selectedRole = roles.find((role) => role.id === form.roleId);
  const evaluatingOfficer = selectedRole?.roleName === "Evaluating Officer";

  if (status === "loading") {
    return <div className="p-6 text-sm text-slate-500">Loading users...</div>;
  }

  if (session?.user?.role !== "General Administration Officer") {
    return <div className="p-6 text-sm text-red-600">Access Denied</div>;
  }

  function resetFilters() {
    setSearch("");
    setRoleFilter("");
    setDepartmentFilter("");
    setStatusFilter("");
    setDesignationFilter("");
    setPage(1);
  }

  function openCreate() {
    setForm(emptyForm);
    setEditingUser(null);
    setCreateOpen(true);
    setMessage("");
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setCreateOpen(false);
    setForm({
      fullName: user.fullName,
      email: user.email,
      password: "",
      newPassword: "",
      roleId: user.roleId,
      phoneNumber: user.phoneNumber ?? "",
      department: user.department ?? "",
      designation: user.designation ?? "",
      isActive: user.isActive,
    });
    setMessage("");
  }

  function closeForm() {
    setCreateOpen(false);
    setEditingUser(null);
    setForm(emptyForm);
  }

  function updateForm(field: keyof UserForm, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (evaluatingOfficer && !form.designation.trim()) {
      setMessage("Evaluating Officer Position is required.");
      return;
    }

    setSaving(true);
    setMessage("");
    const editing = Boolean(editingUser);
    const response = await fetch(
      editing ? `/api/users/${editingUser?.id}` : "/api/users",
      {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
          newPassword: form.newPassword.trim(),
          roleId: form.roleId,
          phoneNumber: form.phoneNumber.trim(),
          department: form.department.trim(),
          designation: form.designation.trim(),
          isActive: form.isActive,
        }),
      }
    );
    const result = await response.json();

    if (response.ok) {
      setMessage(editing ? "User updated successfully." : "User created successfully.");
      closeForm();
      await loadData();
    } else {
      setMessage(result.message || "Failed to save user.");
    }
    setSaving(false);
  }

  async function setUserStatus(user: User, isActive: boolean) {
    if (!isActive && !confirm(`Deactivate ${user.fullName}?`)) return;
    const response = await fetch(`/api/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: user.fullName,
        email: user.email,
        roleId: user.roleId,
        phoneNumber: user.phoneNumber ?? "",
        department: user.department ?? "",
        designation: user.designation ?? "",
        isActive,
      }),
    });
    if (response.ok) {
      setUsers((current) =>
        current.map((item) => (item.id === user.id ? { ...item, isActive } : item))
      );
      setMessage(`User ${isActive ? "activated" : "deactivated"} successfully.`);
    } else {
      const result = await response.json();
      setMessage(result.message || "Failed to update user status.");
    }
  }

  async function bulkStatus(isActive: boolean) {
    const selected = users.filter((user) => selectedIds.includes(user.id));
    if (!selected.length) {
      setMessage("Select at least one user.");
      return;
    }
    if (!confirm(`${isActive ? "Activate" : "Deactivate"} ${selected.length} selected user(s)?`)) return;
    setSaving(true);
    const results = await Promise.all(
      selected.map((user) =>
        fetch(`/api/users/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: user.fullName,
            email: user.email,
            roleId: user.roleId,
            phoneNumber: user.phoneNumber ?? "",
            department: user.department ?? "",
            designation: user.designation ?? "",
            isActive,
          }),
        })
      )
    );
    setSaving(false);
    if (results.every((response) => response.ok)) {
      setSelectedIds([]);
      setMessage(`${selected.length} user(s) updated successfully.`);
      await loadData();
    } else {
      setMessage("Some selected users could not be updated.");
    }
  }

  function exportCsv() {
    const rows = [
      ["Full Name", "Email", "Role", "Department", "Designation", "Assigned Locations", "Status"],
      ...filteredUsers.map((user) => [
        user.fullName,
        user.email,
        user.role.roleName,
        user.department ?? "",
        user.designation ?? "",
        locationsText(user),
        user.isActive ? "Active" : "Inactive",
      ]),
    ];
    downloadBlob(
      rows.map((row) => row.map(csvCell).join(",")).join("\n"),
      "users.csv",
      "text/csv;charset=utf-8"
    );
  }

  function exportExcel() {
    const header = "<tr><th>Full Name</th><th>Email</th><th>Role</th><th>Department</th><th>Designation</th><th>Assigned Locations</th><th>Status</th></tr>";
    const rows = filteredUsers
      .map((user) => `<tr><td>${escapeHtml(user.fullName)}</td><td>${escapeHtml(user.email)}</td><td>${escapeHtml(user.role.roleName)}</td><td>${escapeHtml(user.department ?? "")}</td><td>${escapeHtml(user.designation ?? "")}</td><td>${escapeHtml(locationsText(user))}</td><td>${user.isActive ? "Active" : "Inactive"}</td></tr>`)
      .join("");
    downloadBlob(`<table>${header}${rows}</table>`, "users.xls", "application/vnd.ms-excel");
  }

  return (
    <div className="space-y-4 text-slate-800">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">User Management</h1>
          <p className="mt-1 text-xs text-slate-500">Manage system users, their roles and account details.</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700">
          <span className="text-lg leading-none">+</span> Create User
        </button>
      </header>

      {message && <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs font-medium text-blue-700">{message}</div>}

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800">Search & Filter</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-[1.25fr_1fr_1fr_1fr_1fr_auto_auto]">
          <FilterField label="Search User"><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search by name, email, phone..." className="filter-control" /></FilterField>
          <FilterField label="Role"><select value={roleFilter} onChange={(event) => { setRoleFilter(event.target.value); setPage(1); }} className="filter-control"><option value="">All Roles</option>{roles.map((role) => <option key={role.id} value={role.id}>{role.roleName}</option>)}</select></FilterField>
          <FilterField label="Department"><select value={departmentFilter} onChange={(event) => { setDepartmentFilter(event.target.value); setPage(1); }} className="filter-control"><option value="">All Departments</option>{departments.map((value) => <option key={value}>{value}</option>)}</select></FilterField>
          <FilterField label="Status"><select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className="filter-control"><option value="">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option></select></FilterField>
          <FilterField label="Designation / Position"><select value={designationFilter} onChange={(event) => { setDesignationFilter(event.target.value); setPage(1); }} className="filter-control"><option value="">All Positions</option>{designations.map((value) => <option key={value}>{value}</option>)}</select></FilterField>
          <button type="button" onClick={resetFilters} className="mt-auto h-10 rounded-lg border border-slate-200 px-4 text-xs font-semibold hover:bg-slate-50">Reset</button>
          <button type="button" className="mt-auto h-10 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white">Filter</button>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-xs font-semibold text-slate-600">
            Showing {filteredUsers.length ? (safePage - 1) * pageSize + 1 : 0} to {Math.min(safePage * pageSize, filteredUsers.length)} of {filteredUsers.length} users
          </p>
          <div className="flex flex-wrap gap-2">
            <ToolbarButton label="Export Excel" onClick={exportExcel} />
            <ToolbarButton label="Export CSV" onClick={exportCsv} />
            <ToolbarButton label="Export PDF" onClick={() => window.print()} />
            <ToolbarButton label="Print" onClick={() => window.print()} />
            <select disabled={!selectedIds.length || saving} defaultValue="" onChange={(event) => { if (event.target.value) void bulkStatus(event.target.value === "activate"); event.target.value = ""; }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold disabled:opacity-50">
              <option value="">Bulk Actions</option><option value="activate">Activate selected</option><option value="deactivate">Deactivate selected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3"><input type="checkbox" checked={visibleSelected} onChange={(event) => setSelectedIds((current) => event.target.checked ? Array.from(new Set([...current, ...visibleUsers.map((user) => user.id)])) : current.filter((id) => !visibleUsers.some((user) => user.id === id)))} /></th>
                <th className="px-3 py-3">Full Name</th><th className="px-3 py-3">Email</th><th className="px-3 py-3">Role</th><th className="px-3 py-3">Department</th><th className="px-3 py-3">Designation / Position</th><th className="px-3 py-3">Assigned Locations</th><th className="px-3 py-3">Last Updated</th><th className="px-3 py-3">Status</th><th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="p-8 text-center text-slate-500">Loading users...</td></tr>
              ) : visibleUsers.length ? visibleUsers.map((user) => (
                <tr key={user.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                  <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(user.id)} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, user.id] : current.filter((id) => id !== user.id))} /></td>
                  <td className="px-3 py-3 font-semibold text-slate-700">{user.fullName}</td>
                  <td className="px-3 py-3 text-slate-600">{user.email}</td>
                  <td className="px-3 py-3"><span className={`rounded-md px-2 py-1 text-[10px] font-semibold ${roleTone[user.role.roleName] ?? "bg-slate-100 text-slate-600"}`}>{user.role.roleName}</span></td>
                  <td className="px-3 py-3">{user.department || "Not Provided"}</td>
                  <td className="px-3 py-3">{user.designation || "Not Provided"}</td>
                  <td className="max-w-48 px-3 py-3">{locationsText(user)}</td>
                  <td className="px-3 py-3 text-slate-500">{relativeTime(user.updatedAt)}</td>
                  <td className="px-3 py-3"><span className={`rounded-md px-2 py-1 text-[10px] font-semibold ${user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{user.isActive ? "Active" : "Inactive"}</span></td>
                  <td className="px-3 py-3"><div className="flex justify-end gap-1.5"><ActionButton label="View" onClick={() => setViewingUser(user)}>○</ActionButton><ActionButton label="Edit" onClick={() => openEdit(user)}>✎</ActionButton><ActionButton label={user.isActive ? "Deactivate" : "Activate"} onClick={() => void setUserStatus(user, !user.isActive)}>⋮</ActionButton></div></td>
                </tr>
              )) : <tr><td colSpan={10} className="p-8 text-center text-slate-500">No users match the selected filters.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-xs text-slate-500">Show <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="rounded border border-slate-200 px-2 py-1.5"><option>5</option><option>10</option><option>20</option><option>50</option></select> entries</label>
          <div className="flex gap-1"><PageButton disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>Previous</PageButton>{Array.from({ length: pageCount }, (_, index) => index + 1).slice(Math.max(0, safePage - 3), safePage + 2).map((number) => <PageButton key={number} active={number === safePage} onClick={() => setPage(number)}>{number}</PageButton>)}<PageButton disabled={safePage === pageCount} onClick={() => setPage(safePage + 1)}>Next</PageButton></div>
        </div>
      </section>

      {(createOpen || editingUser) && <UserFormModal title={editingUser ? "Edit User" : "Create User"} form={form} roles={roles} evaluatingOfficer={evaluatingOfficer} saving={saving} updateForm={updateForm} onSubmit={saveUser} onClose={closeForm} editing={Boolean(editingUser)} />}
      {viewingUser && <UserDetailsModal user={viewingUser} onClose={() => setViewingUser(null)} />}
      <style jsx global>{`.filter-control{width:100%;height:2.5rem;border:1px solid #e2e8f0;border-radius:.5rem;background:#fff;padding:0 .75rem;font-size:.75rem;outline:none}.filter-control:focus{border-color:#60a5fa;box-shadow:0 0 0 3px #dbeafe}@media print{aside,button,select,input,.no-print{display:none!important}main{padding:0!important}.shadow-sm{box-shadow:none!important}}`}</style>
    </div>
  );
}

function UserFormModal({ title, form, roles, evaluatingOfficer, saving, updateForm, onSubmit, onClose, editing }: { title: string; form: UserForm; roles: Role[]; evaluatingOfficer: boolean; saving: boolean; updateForm: (field: keyof UserForm, value: string | boolean) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onClose: () => void; editing: boolean }) {
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/40 p-4"><form onSubmit={onSubmit} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">{title}</h2><p className="mt-1 text-xs text-slate-500">Enter the account and role details below.</p></div><button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold">Close</button></div><div className="mt-5 grid gap-4 md:grid-cols-2"><FormInput label="Full Name" value={form.fullName} onChange={(value) => updateForm("fullName", value)} required /><FormInput label="Email" type="email" value={form.email} onChange={(value) => updateForm("email", value)} required /><FormInput label={editing ? "New Password" : "Password"} type="password" value={editing ? form.newPassword : form.password} onChange={(value) => updateForm(editing ? "newPassword" : "password", value)} required={!editing} /><label className="text-xs font-semibold text-slate-600">Role<select value={form.roleId} onChange={(event) => { updateForm("roleId", event.target.value); updateForm("designation", ""); }} required className="filter-control mt-2"><option value="">Select Role</option>{roles.map((role) => <option key={role.id} value={role.id}>{role.roleName}</option>)}</select></label><FormInput label="Phone Number" value={form.phoneNumber} onChange={(value) => updateForm("phoneNumber", value)} /><FormInput label="Department" value={form.department} onChange={(value) => updateForm("department", value)} /><FormInput label={evaluatingOfficer ? "Evaluating Officer Position" : "Designation / Position"} value={form.designation} onChange={(value) => updateForm("designation", value)} required={evaluatingOfficer} /><label className="flex items-center gap-3 self-end rounded-lg border border-slate-200 px-3 py-3 text-xs font-semibold"><input type="checkbox" checked={form.isActive} onChange={(event) => updateForm("isActive", event.target.checked)} /> Active account</label></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold">Cancel</button><button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : title}</button></div></form></div>;
}

function UserDetailsModal({ user, onClose }: { user: User; onClose: () => void }) {
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/40 p-4"><div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">User Details</h2><button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold">Close</button></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><Detail label="Full Name" value={user.fullName} /><Detail label="Email" value={user.email} /><Detail label="Role" value={user.role.roleName} /><Detail label="Phone" value={user.phoneNumber || "Not Provided"} /><Detail label="Department" value={user.department || "Not Provided"} /><Detail label="Designation" value={user.designation || "Not Provided"} /><Detail label="Assigned Locations" value={locationsText(user)} /><Detail label="Status" value={user.isActive ? "Active" : "Inactive"} /></div></div></div>;
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) { return <label className="text-[10px] font-semibold text-slate-600">{label}<span className="mt-2 block">{children}</span></label>; }
function FormInput({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) { return <label className="text-xs font-semibold text-slate-600">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} className="filter-control mt-2" /></label>; }
function Detail({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-700">{value}</p></div>; }
function ToolbarButton({ label, onClick }: { label: string; onClick: () => void }) { return <button type="button" onClick={onClick} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50">{label}</button>; }
function ActionButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) { return <button type="button" title={label} aria-label={label} onClick={onClick} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50">{children}</button>; }
function PageButton({ children, onClick, disabled = false, active = false }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; active?: boolean }) { return <button type="button" onClick={onClick} disabled={disabled} className={`rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-40 ${active ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600"}`}>{children}</button>; }
function locationsText(user: User) { return user.assignedLocations.length ? user.assignedLocations.map((location) => location.locationName).join(", ") : "-"; }
function relativeTime(value: string) { const seconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000)); if (seconds < 60) return "Just now"; const minutes = Math.floor(seconds / 60); if (minutes < 60) return `${minutes} min ago`; const hours = Math.floor(minutes / 60); if (hours < 24) return `${hours} hours ago`; return `${Math.floor(hours / 24)} days ago`; }
function csvCell(value: string) { return `"${value.replaceAll('"', '""')}"`; }
function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character); }
function downloadBlob(content: string, filename: string, type: string) { const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url); }
