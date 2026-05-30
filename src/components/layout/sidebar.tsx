"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
    },
    {
      name: "Users",
      href: "/dashboard/users",
      roles: ["General Administration Officer"],
    },
    {
      name: "Locations",
      href: "/dashboard/locations",
      roles: ["General Administration Officer"],
    },
    {
      name: "Location Tasks",
      href: "/dashboard/location-tasks",
      roles: ["General Administration Officer"],
    },
    {
      name: "Assignments",
      href: "/dashboard/assignments",
      roles: ["General Administration Officer"],
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      roles: ["General Administration Officer"],
    },
    {
      name: "Evaluations",
      href: "/dashboard/evaluations",
      roles: ["Evaluating Officer"],
    },
    {
      name: "Evaluation History",
      href: "/dashboard/evaluations/history",
      roles: ["Evaluating Officer"],
    },
    {
      name: "Admin Review",
      href: "/dashboard/admin-review",
      roles: ["Administration Officer"],
    },
    {
      name: "Payment Recommendation",
      href: "/dashboard/payment-recommendation",
      roles: ["Administration Officer"],
    },
    {
      name: "VC Approval",
      href: "/dashboard/vc-approval",
      roles: ["Vice Chancellor"],
    },
    {
      name: "Reports",
      href: "/dashboard/reports",
      roles: [
        "General Administration Officer",
        "Administration Officer",
        "Vice Chancellor",
        "Finance Officer",
      ],
    },
  ].filter((item) => !item.roles || item.roles.includes(role ?? ""));

  return (
    <div className="w-64 min-h-screen bg-slate-800 text-white">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold">
          Cleaning System
        </h1>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded p-2 ${
              pathname === item.href
                ? "bg-blue-600"
                : "hover:bg-slate-700"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
