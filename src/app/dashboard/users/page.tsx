"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Role = {
  roleId: string;
  roleName: string;
};

export default function UsersPage() {
  const { data: session, status } = useSession();
  const [roles, setRoles] = useState<Role[]>([]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");

  useEffect(() => {
    fetch("/api/roles")
      .then((res) => res.json())
      .then((data) => setRoles(data));
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
      "/api/users",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
          roleId,
        }),
      }
    );

    if (response.ok) {
      alert("User created");

      setFullName("");
      setEmail("");
      setPassword("");
      setRoleId("");
    } else {
      alert("Error creating user");
    }
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">
        User Management
      </h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-md space-y-4"
      >
        <input
          className="w-full border p-2"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) =>
            setFullName(e.target.value)
          }
        />

        <input
          className="w-full border p-2"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          className="w-full border p-2"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <select
          className="w-full border p-2"
          value={roleId}
          onChange={(e) =>
            setRoleId(e.target.value)
          }
        >
          <option value="">
            Select Role
          </option>

          {roles.map((role) => (
            <option
              key={role.roleId}
              value={role.roleId}
            >
              {role.roleName}
            </option>
          ))}
        </select>

        <button
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Create User
        </button>
      </form>
    </div>
  );
}
