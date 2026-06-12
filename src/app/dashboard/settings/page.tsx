"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type Status = "ACTIVE" | "EXPIRED" | "TERMINATED" | "UPCOMING";

type Agreement = {
  agreementId: string;
  companyName: string;
  registrationNumber: string | null;
  contactPerson: string | null;
  contactNumber: string | null;
  email: string | null;
  address: string | null;
  tenderNumber: string | null;
  agreementNumber: string | null;
  contractStartDate: string;
  contractEndDate: string;
  monthlyContractAmount: number;
  totalContractAmount: number | null;
  serviceScope: string | null;
  coveredLocations: string | null;
  minimumWorkersRequired: number | null;
  equipmentResponsibility: string | null;
  chemicalResponsibility: string | null;
  supervisorResponsibility: string | null;
  paymentTerms: string | null;
  penaltyTerms: string | null;
  renewalDetails: string | null;
  remarks: string | null;
  status: Status;
};

type FormData = {
  companyName: string;
  registrationNumber: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  address: string;
  tenderNumber: string;
  agreementNumber: string;
  contractStartDate: string;
  contractEndDate: string;
  monthlyContractAmount: string;
  totalContractAmount: string;
  serviceScope: string;
  coveredLocations: string;
  minimumWorkersRequired: string;
  equipmentResponsibility: string;
  chemicalResponsibility: string;
  supervisorResponsibility: string;
  paymentTerms: string;
  penaltyTerms: string;
  renewalDetails: string;
  remarks: string;
  status: Status;
};

const emptyForm: FormData = {
  companyName: "",
  registrationNumber: "",
  contactPerson: "",
  contactNumber: "",
  email: "",
  address: "",
  tenderNumber: "",
  agreementNumber: "",
  contractStartDate: "",
  contractEndDate: "",
  monthlyContractAmount: "",
  totalContractAmount: "",
  serviceScope: "",
  coveredLocations: "",
  minimumWorkersRequired: "",
  equipmentResponsibility: "",
  chemicalResponsibility: "",
  supervisorResponsibility: "",
  paymentTerms: "",
  penaltyTerms: "",
  renewalDetails: "",
  remarks: "",
  status: "ACTIVE",
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-LK");
}

function formatAmount(value: number | null) {
  return `Rs. ${Number(value ?? 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function dateInput(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function statusClass(status: Status) {
  if (status === "ACTIVE") return "bg-green-100 text-green-700";
  if (status === "UPCOMING") return "bg-yellow-100 text-yellow-800";
  if (status === "EXPIRED" || status === "TERMINATED") {
    return "bg-red-100 text-red-700";
  }

  return "bg-gray-100 text-gray-700";
}

function toForm(agreement: Agreement): FormData {
  return {
    companyName: agreement.companyName,
    registrationNumber: agreement.registrationNumber ?? "",
    contactPerson: agreement.contactPerson ?? "",
    contactNumber: agreement.contactNumber ?? "",
    email: agreement.email ?? "",
    address: agreement.address ?? "",
    tenderNumber: agreement.tenderNumber ?? "",
    agreementNumber: agreement.agreementNumber ?? "",
    contractStartDate: dateInput(agreement.contractStartDate),
    contractEndDate: dateInput(agreement.contractEndDate),
    monthlyContractAmount: String(agreement.monthlyContractAmount),
    totalContractAmount: String(agreement.totalContractAmount ?? ""),
    serviceScope: agreement.serviceScope ?? "",
    coveredLocations: agreement.coveredLocations ?? "",
    minimumWorkersRequired: String(
      agreement.minimumWorkersRequired ?? ""
    ),
    equipmentResponsibility: agreement.equipmentResponsibility ?? "",
    chemicalResponsibility: agreement.chemicalResponsibility ?? "",
    supervisorResponsibility: agreement.supervisorResponsibility ?? "",
    paymentTerms: agreement.paymentTerms ?? "",
    penaltyTerms: agreement.penaltyTerms ?? "",
    renewalDetails: agreement.renewalDetails ?? "",
    remarks: agreement.remarks ?? "",
    status: agreement.status,
  };
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [activeAgreement, setActiveAgreement] =
    useState<Agreement | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [selectedAgreement, setSelectedAgreement] =
    useState<Agreement | null>(null);
  const [editData, setEditData] = useState<FormData>(emptyForm);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filteredAgreements = useMemo(() => {
    const query = search.trim().toLowerCase();
    return agreements.filter((agreement) =>
      !query
        ? true
        : `${agreement.companyName} ${agreement.tenderNumber ?? ""} ${agreement.agreementNumber ?? ""} ${agreement.status}`
            .toLowerCase()
            .includes(query)
    );
  }, [agreements, search]);
  const pageCount = Math.max(1, Math.ceil(filteredAgreements.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visibleAgreements = filteredAgreements.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  async function loadAgreements() {
    const [allRes, activeRes] = await Promise.all([
      fetch("/api/company-agreements"),
      fetch("/api/company-agreements/active"),
    ]);

    const all = (await allRes.json()) as Agreement[];
    setAgreements(all);

    if (activeRes.ok) {
      setActiveAgreement((await activeRes.json()) as Agreement);
    } else {
      setActiveAgreement(null);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function loadInitial() {
      try {
        const [allRes, activeRes] = await Promise.all([
          fetch("/api/company-agreements"),
          fetch("/api/company-agreements/active"),
        ]);

        const all = (await allRes.json()) as Agreement[];
        const active = activeRes.ok
          ? ((await activeRes.json()) as Agreement)
          : null;

        if (!ignore) {
          setAgreements(all);
          setActiveAgreement(active);
        }
      } catch {
        if (!ignore) {
          setMessage("Failed to load company agreements.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadInitial();

    return () => {
      ignore = true;
    };
  }, []);

  if (status === "loading") {
    return <div className="p-6 text-slate-700">Loading...</div>;
  }

  if (session?.user?.role !== "General Administration Officer") {
    return <div className="p-6 text-slate-700">Access Denied</div>;
  }

  function updateForm(field: keyof FormData, value: string) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateEdit(field: keyof FormData, value: string) {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function validate(data: FormData) {
    if (!data.companyName.trim()) return "Company name is required.";
    if (!data.contractStartDate) {
      return "Contract start date is required.";
    }
    if (!data.contractEndDate) return "Contract end date is required.";
    if (new Date(data.contractEndDate) <= new Date(data.contractStartDate)) {
      return "Contract end date must be after start date.";
    }
    if (Number(data.monthlyContractAmount) <= 0) {
      return "Monthly contract amount must be positive.";
    }
    if (
      data.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())
    ) {
      return "Email must be valid.";
    }

    return null;
  }

  function payload(data: FormData) {
    return {
      ...data,
      monthlyContractAmount: Number(data.monthlyContractAmount),
      totalContractAmount: data.totalContractAmount
        ? Number(data.totalContractAmount)
        : "",
      minimumWorkersRequired: data.minimumWorkersRequired
        ? Number(data.minimumWorkersRequired)
        : "",
    };
  }

  async function saveAgreement(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const error = validate(formData);

    if (error) {
      setMessage(error);
      return;
    }

    setSaving(true);
    const res = await fetch("/api/company-agreements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload(formData)),
    });
    const data = await res.json();

    if (res.ok) {
      setMessage("Company agreement saved.");
      setFormData(emptyForm);
      setAddModalOpen(false);
      await loadAgreements();
    } else {
      setMessage(data.message || "Failed to save agreement.");
    }

    setSaving(false);
  }

  async function updateAgreement(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedAgreement) return;

    const error = validate(editData);

    if (error) {
      setMessage(error);
      return;
    }

    setSaving(true);
    const res = await fetch(
      `/api/company-agreements/${selectedAgreement.agreementId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload(editData)),
      }
    );
    const data = await res.json();

    if (res.ok) {
      setMessage("Company agreement updated.");
      setSelectedAgreement(null);
      await loadAgreements();
    } else {
      setMessage(data.message || "Failed to update agreement.");
    }

    setSaving(false);
  }

  async function deleteAgreement(agreementId: string) {
    if (!confirm("Mark this agreement as TERMINATED?")) return;

    const res = await fetch(`/api/company-agreements/${agreementId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setMessage("Company agreement deleted.");
      await loadAgreements();
    } else {
      setMessage("Failed to delete agreement.");
    }
  }

  function openAgreement(agreement: Agreement, mode: "view" | "edit") {
    setSelectedAgreement(agreement);
    setModalMode(mode);
    setEditData(toForm(agreement));
    setMessage("");
  }

  function exportCsv() {
    const rows = [
      ["Company Name", "Tender No", "Agreement No", "Start Date", "End Date", "Monthly Amount", "Status"],
      ...filteredAgreements.map((agreement) => [
        agreement.companyName,
        agreement.tenderNumber ?? "",
        agreement.agreementNumber ?? "",
        formatDate(agreement.contractStartDate),
        formatDate(agreement.contractEndDate),
        formatAmount(agreement.monthlyContractAmount),
        agreement.status,
      ]),
    ];
    downloadBlob(
      rows.map((row) => row.map(csvCell).join(",")).join("\n"),
      "company-agreements.csv",
      "text/csv;charset=utf-8"
    );
  }

  return (
    <div className="space-y-4 text-slate-800">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-blue-600">Company</p>
          <h1 className="mt-1 text-xl font-bold text-slate-900">
            Company & Tender Agreement Details
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            View and manage current company information and tender agreement details.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setFormData(emptyForm);
            setMessage("");
            setAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <span className="text-lg leading-none">+</span>
          Add Company
        </button>
      </header>

      {message && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs font-medium text-blue-700">
          {message}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800">Current Active Company</h2>
            {activeAgreement && <span className="rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">ACTIVE</span>}
          </div>
          {activeAgreement && (
            <button type="button" onClick={() => openAgreement(activeAgreement, "edit")} className="rounded-lg border border-blue-200 px-3 py-2 text-[10px] font-semibold text-blue-600 hover:bg-blue-50">
              Edit Company Info
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-slate-600">Loading...</p>
        ) : !activeAgreement ? (
          <p className="rounded bg-slate-50 p-4 text-sm text-slate-600">
            No active company agreement found. Please add company details
            first.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Info label="Company Name" value={activeAgreement.companyName} icon="CO" tone="blue" />
            <Info
              label="Tender No"
              value={activeAgreement.tenderNumber || "-"}
              icon="TN"
              tone="violet"
            />
            <Info
              label="Agreement No"
              value={activeAgreement.agreementNumber || "-"}
              icon="AG"
              tone="green"
            />
            <Info
              label="Contract Period"
              value={`${formatDate(
                activeAgreement.contractStartDate
              )} - ${formatDate(activeAgreement.contractEndDate)}`}
              icon="CP"
              tone="orange"
            />
            <Info
              label="Monthly Contract Amount"
              value={formatAmount(activeAgreement.monthlyContractAmount)}
              icon="RS"
              tone="green"
            />
            <Info label="Status" value={activeAgreement.status} icon="OK" tone="green" />
            <Info
              label="Contact Person"
              value={activeAgreement.contactPerson || "-"}
              icon="PE"
              tone="violet"
            />
            <Info
              label="Contact Number"
              value={activeAgreement.contactNumber || "-"}
              icon="PH"
              tone="blue"
            />
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Previous Tender Company History</h2>
            <p className="mt-1 text-[10px] text-slate-500">List of previously completed tender agreements.</p>
          </div>
          <div className="flex gap-2">
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search company, tender or agreement..." className="company-control w-72" />
            <button type="button" onClick={exportCsv} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50">Export</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Company Name</th>
                <th className="px-4 py-3">Tender No</th>
                <th className="px-4 py-3">Agreement No</th>
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3">End Date</th>
                <th className="px-4 py-3">Monthly Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleAgreements.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    No company agreements found.
                  </td>
                </tr>
              ) : (
                visibleAgreements.map((agreement, index) => (
                  <tr key={agreement.agreementId} className="border-t border-slate-100 hover:bg-slate-50/70">
                    <td className="px-4 py-3 text-slate-400">{(safePage - 1) * pageSize + index + 1}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      {agreement.companyName}
                    </td>
                    <td className="px-4 py-3">
                      {agreement.tenderNumber || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {agreement.agreementNumber || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {formatDate(agreement.contractStartDate)}
                    </td>
                    <td className="px-4 py-3">
                      {formatDate(agreement.contractEndDate)}
                    </td>
                    <td className="px-4 py-3">
                      {formatAmount(agreement.monthlyContractAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-1 text-xs font-semibold ${statusClass(
                          agreement.status
                        )}`}
                      >
                        {agreement.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => openAgreement(agreement, "view")} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50">
                          View
                        </button>
                        <button type="button" onClick={() => openAgreement(agreement, "edit")} className="rounded-lg bg-blue-600 px-2.5 py-1.5 text-[10px] font-semibold text-white hover:bg-blue-700">
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            deleteAgreement(agreement.agreementId)
                          }
                          className="rounded-lg bg-red-600 px-2.5 py-1.5 text-[10px] font-semibold text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Showing {filteredAgreements.length ? (safePage - 1) * pageSize + 1 : 0} to {Math.min(safePage * pageSize, filteredAgreements.length)} of {filteredAgreements.length} entries
          </p>
          <div className="flex gap-1">
            <PageButton disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>Previous</PageButton>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <PageButton key={number} active={number === safePage} onClick={() => setPage(number)}>{number}</PageButton>)}
            <PageButton disabled={safePage === pageCount} onClick={() => setPage(safePage + 1)}>Next</PageButton>
          </div>
        </div>
      </section>

      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-company-title"
            className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 id="add-company-title" className="text-xl font-bold text-slate-900">
                  Add Company Agreement
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the company and tender agreement details.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                disabled={saving}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Close
              </button>
            </div>
            <div className="p-6">
              {message && (
                <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
                  {message}
                </div>
              )}
              <AgreementForm
                data={formData}
                onChange={updateForm}
                onSubmit={saveAgreement}
                saving={saving}
                submitLabel="Add Company"
              />
            </div>
          </div>
        </div>
      )}

      {selectedAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded bg-white p-5 shadow-xl">
            <div className="mb-4 flex justify-between gap-4">
              <h2 className="text-xl font-semibold">
                {modalMode === "view" ? "View Agreement" : "Edit Agreement"}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedAgreement(null)}
                className="rounded bg-gray-500 px-3 py-1 text-white"
              >
                Close
              </button>
            </div>
            {modalMode === "view" ? (
              <AgreementView agreement={selectedAgreement} />
            ) : (
              <AgreementForm
                data={editData}
                onChange={updateEdit}
                onSubmit={updateAgreement}
                saving={saving}
                submitLabel="Save Changes"
              />
            )}
          </div>
        </div>
      )}
      <style jsx global>{`.company-control{height:2.5rem;border:1px solid #e2e8f0;border-radius:.5rem;background:#fff;padding:0 .75rem;font-size:.75rem;outline:none}.company-control:focus{border-color:#60a5fa;box-shadow:0 0 0 3px #dbeafe}@media print{aside,button,input{display:none!important}main{padding:0!important}.shadow-sm{box-shadow:none!important}}`}</style>
    </div>
  );
}

function Info({ label, value, icon, tone }: { label: string; value: string; icon: string; tone: "blue" | "violet" | "green" | "orange" }) {
  const tones = { blue: "bg-blue-50 text-blue-600", violet: "bg-violet-50 text-violet-600", green: "bg-emerald-50 text-emerald-600", orange: "bg-orange-50 text-orange-600" };
  return (
    <div className="flex min-h-20 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-[10px] font-black ${tones[tone]}`}>{icon}</span>
      <span className="min-w-0">
        <span className="block text-[10px] font-medium text-slate-400">{label}</span>
        <span className="mt-1 block text-xs font-bold text-slate-700">{value}</span>
      </span>
    </div>
  );
}

function AgreementForm({
  data,
  onChange,
  onSubmit,
  saving,
  submitLabel,
}: {
  data: FormData;
  onChange: (field: keyof FormData, value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  saving: boolean;
  submitLabel: string;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Company Name" value={data.companyName} required onChange={(value) => onChange("companyName", value)} />
        <Field label="Registration Number" value={data.registrationNumber} onChange={(value) => onChange("registrationNumber", value)} />
        <Field label="Contact Person" value={data.contactPerson} onChange={(value) => onChange("contactPerson", value)} />
        <Field label="Contact Number" value={data.contactNumber} onChange={(value) => onChange("contactNumber", value)} />
        <Field label="Email" type="email" value={data.email} onChange={(value) => onChange("email", value)} />
        <Field label="Address" value={data.address} onChange={(value) => onChange("address", value)} />
        <Field label="Tender Number" value={data.tenderNumber} onChange={(value) => onChange("tenderNumber", value)} />
        <Field label="Agreement Number" value={data.agreementNumber} onChange={(value) => onChange("agreementNumber", value)} />
        <Field label="Contract Start Date" type="date" value={data.contractStartDate} required onChange={(value) => onChange("contractStartDate", value)} />
        <Field label="Contract End Date" type="date" value={data.contractEndDate} required onChange={(value) => onChange("contractEndDate", value)} />
        <Field label="Monthly Contract Amount" type="number" value={data.monthlyContractAmount} required onChange={(value) => onChange("monthlyContractAmount", value)} />
        <Field label="Total Contract Amount" type="number" value={data.totalContractAmount} onChange={(value) => onChange("totalContractAmount", value)} />
        <Field label="Minimum Workers Required" type="number" value={data.minimumWorkersRequired} onChange={(value) => onChange("minimumWorkersRequired", value)} />
        <label className="block text-sm font-medium text-slate-700">
          Status
          <select
            value={data.status}
            onChange={(e) => onChange("status", e.target.value)}
            className="mt-2 w-full rounded border border-slate-300 bg-white p-2"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="TERMINATED">TERMINATED</option>
            <option value="UPCOMING">UPCOMING</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextArea label="Service Scope" value={data.serviceScope} onChange={(value) => onChange("serviceScope", value)} />
        <TextArea label="Covered Locations" value={data.coveredLocations} onChange={(value) => onChange("coveredLocations", value)} />
        <TextArea label="Equipment Responsibility" value={data.equipmentResponsibility} onChange={(value) => onChange("equipmentResponsibility", value)} />
        <TextArea label="Chemical Responsibility" value={data.chemicalResponsibility} onChange={(value) => onChange("chemicalResponsibility", value)} />
        <TextArea label="Supervisor Responsibility" value={data.supervisorResponsibility} onChange={(value) => onChange("supervisorResponsibility", value)} />
        <TextArea label="Payment Terms" value={data.paymentTerms} onChange={(value) => onChange("paymentTerms", value)} />
        <TextArea label="Penalty Terms" value={data.penaltyTerms} onChange={(value) => onChange("penaltyTerms", value)} />
        <TextArea label="Renewal Details" value={data.renewalDetails} onChange={(value) => onChange("renewalDetails", value)} />
      </div>

      <TextArea label="Remarks" value={data.remarks} onChange={(value) => onChange("remarks", value)} />

      <button
        type="submit"
        disabled={saving}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
      >
        {saving ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        type={type}
        value={value}
        required={required}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "0.01" : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded border border-slate-300 bg-white p-2"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <textarea
        value={value}
        rows={3}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded border border-slate-300 bg-white p-2"
      />
    </label>
  );
}

function AgreementView({ agreement }: { agreement: Agreement }) {
  const rows = [
    ["Company Name", agreement.companyName],
    ["Registration Number", agreement.registrationNumber],
    ["Contact Person", agreement.contactPerson],
    ["Contact Number", agreement.contactNumber],
    ["Email", agreement.email],
    ["Address", agreement.address],
    ["Tender Number", agreement.tenderNumber],
    ["Agreement Number", agreement.agreementNumber],
    ["Contract Start Date", formatDate(agreement.contractStartDate)],
    ["Contract End Date", formatDate(agreement.contractEndDate)],
    ["Monthly Contract Amount", formatAmount(agreement.monthlyContractAmount)],
    ["Total Contract Amount", formatAmount(agreement.totalContractAmount)],
    ["Minimum Workers Required", agreement.minimumWorkersRequired?.toString()],
    ["Service Scope", agreement.serviceScope],
    ["Covered Locations", agreement.coveredLocations],
    ["Equipment Responsibility", agreement.equipmentResponsibility],
    ["Chemical Responsibility", agreement.chemicalResponsibility],
    ["Supervisor Responsibility", agreement.supervisorResponsibility],
    ["Payment Terms", agreement.paymentTerms],
    ["Penalty Terms", agreement.penaltyTerms],
    ["Renewal Details", agreement.renewalDetails],
    ["Remarks", agreement.remarks],
    ["Status", agreement.status],
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="rounded bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">
            {label}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm">
            {value || "Not Provided"}
          </p>
        </div>
      ))}
    </div>
  );
}

function PageButton({
  children,
  onClick,
  disabled = false,
  active = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-40 ${
        active
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-slate-200 bg-white text-slate-600"
      }`}
    >
      {children}
    </button>
  );
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function downloadBlob(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
