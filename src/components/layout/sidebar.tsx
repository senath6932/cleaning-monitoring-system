"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Sidebar({
  collapsed,
  mobileOpen,
  onNavigate,
  onToggle,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onNavigate: () => void;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const menuItems = [
    {
      name: "Home",
      href:
        role === "General Administration Officer"
          ? "/dashboard/gaa"
          : role === "Evaluating Officer"
            ? "/dashboard/officer"
            : role === "Administration Officer"
              ? "/dashboard/admin"
          : "/dashboard",
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
      name: "Company",
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
      roles: ["General Administration Officer"],
    },
    {
      name: "VC Approval",
      href: "/dashboard/vc-approval",
      roles: ["Vice Chancellor"],
    },
    {
      name: "GAA Reports",
      href: "/dashboard/gaa/reports",
      roles: ["General Administration Officer"],
    },
    {
      name: "Final Reports",
      href: "/dashboard/final-reports",
      roles: [
        "General Administration Officer",
        "Administration Officer",
        "Vice Chancellor",
        "Finance Officer",
      ],
    },
    {
      name: "Reports",
      href: "/dashboard/reports",
      roles: [
        "Administration Officer",
        "Vice Chancellor",
        "Finance Officer",
      ],
    },
  ].filter((item) => !item.roles || item.roles.includes(role ?? ""));

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col bg-slate-800 text-white shadow-2xl transition-all duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none ${
        mobileOpen ? "translate-x-0" : ""
      } ${collapsed ? "lg:w-20" : "lg:w-72 xl:w-80"}`}
    >
      <button
        type="button"
        aria-label={mobileOpen ? "Close sidebar" : "Open sidebar"}
        aria-expanded={mobileOpen}
        onClick={onToggle}
        className="absolute -right-10 top-4 grid h-10 w-10 place-items-center bg-slate-800 text-white lg:hidden"
      >
        <MenuIcon />
      </button>

      <div className={`border-b border-slate-700 ${collapsed ? "px-3 py-5" : "p-5"}`}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              aria-label="Maximize sidebar"
              aria-expanded="false"
              onClick={onToggle}
              className="grid h-8 w-8 place-items-center text-white"
            >
              <MenuIcon />
            </button>
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-sm font-black">
              CS
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold tracking-wide">
                Cleaning System
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                University operations home
              </p>
            </div>
            <button
              type="button"
              aria-label="Minimize sidebar"
              aria-expanded="true"
              onClick={onToggle}
              className="grid h-8 w-8 shrink-0 place-items-center text-white"
            >
              <MenuIcon />
            </button>
          </div>
        )}
      </div>

      <nav className={`flex-1 space-y-2 overflow-y-auto ${collapsed ? "p-3" : "p-4"}`}>
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.name : undefined}
            className={`flex items-center rounded-lg transition ${
              collapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-2.5"
            } ${
              pathname === item.href
                ? "bg-blue-600"
                : "hover:bg-slate-700"
            }`}
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded text-[10px] font-black text-slate-200">
              {menuInitials(item.name)}
            </span>
            {!collapsed && <span>{item.name}</span>}
          </Link>
        ))}
      </nav>

      <div className={`mt-auto border-t border-slate-700 ${collapsed ? "p-3" : "p-5"}`}>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title={collapsed ? "Logout" : undefined}
          className={`flex w-full items-center rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 ${
            collapsed ? "justify-center px-2" : "justify-center gap-2 px-3"
          }`}
        >
          <LogoutIcon />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

function menuInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeWidth="2"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className="h-5 w-5 shrink-0"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M14 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-3m-4-4h11m0 0-3-3m3 3-3 3"
      />
    </svg>
  );
}

