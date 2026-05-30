"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) =>
        setAmount(Number(data?.monthlyContractAmount ?? 0))
      );
  }, []);

  if (status === "loading") {
    return <div className="p-6">Loading...</div>;
  }

  if (session?.user?.role !== "General Administration Officer") {
    return <div className="p-6">Access Denied</div>;
  }

  async function save() {
    await fetch("/api/settings/update", {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        amount,
      }),
    });

    alert("Contract Amount Updated");
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        System Settings
      </h1>

      <label>
        Monthly Contract Amount
      </label>

      <input
        type="number"
        value={amount}
        onChange={(e) =>
          setAmount(Number(e.target.value))
        }
        className="mt-2 block border p-2"
      />

      <button
        onClick={save}
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
      >
        Save
      </button>
    </div>
  );
}
