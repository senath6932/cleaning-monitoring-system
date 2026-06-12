"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

const roleLinks: Record<string, Array<{ label: string; href: string }>> = {
  "General Administration Officer": [
    { label: "GAA Dashboard", href: "/dashboard/gaa" },
    { label: "User Management", href: "/dashboard/users" },
    { label: "Company Settings", href: "/dashboard/settings" },
    { label: "Final Reports", href: "/dashboard/final-reports" },
  ],
  "Administration Officer": [
    { label: "Dashboard", href: "/dashboard/admin" },
    { label: "Pending Reviews", href: "/dashboard/admin-review" },
    { label: "Reports", href: "/dashboard/reports" },
    { label: "Final Reports", href: "/dashboard/final-reports" },
  ],
  "Evaluating Officer": [
    { label: "Dashboard", href: "/dashboard/officer" },
    { label: "New Evaluation", href: "/dashboard/evaluations" },
    { label: "Evaluation History", href: "/dashboard/evaluations/history" },
  ],
  "Vice Chancellor": [
    { label: "Dashboard", href: "/dashboard/vc" },
    { label: "VC Approvals", href: "/dashboard/vc-approval" },
    { label: "Reports", href: "/dashboard/reports" },
    { label: "Final Reports", href: "/dashboard/final-reports" },
  ],
  "Finance Officer": [
    { label: "Dashboard", href: "/dashboard/finance" },
    { label: "Reports", href: "/dashboard/reports" },
    { label: "Final Reports", href: "/dashboard/final-reports" },
  ],
};

export default function UserMenu({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const user = session?.user;
  const name = user?.name ?? user?.email ?? "User";
  const position = user?.designation ?? user?.role ?? "System User";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const links = roleLinks[user?.role ?? ""] ?? [
    { label: "Dashboard", href: "/dashboard" },
  ];

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-slate-50"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm">
          {initials}
        </span>
        {!compact && (
          <span className="hidden min-w-0 sm:block">
            <span className="block truncate text-sm font-semibold text-slate-800">
              {name}
            </span>
            <span className="block truncate text-xs text-slate-500">
              {position}
            </span>
          </span>
        )}
        <ChevronIcon />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-[80] w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <div className="border-b border-slate-100 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-800">{name}</p>
            <p className="mt-1 text-xs text-slate-500">{user?.email}</p>
            <span className="mt-3 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
              {position}
            </span>
          </div>

          <div className="p-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-700"
              >
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-[9px] font-black text-slate-500">
                  {menuInitials(link.label)}
                </span>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-slate-100 p-2">
            <button
              type="button"
              role="menuitem"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              <LogoutIcon />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function menuInitials(label: string) {
  return label
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className="h-4 w-4 shrink-0 text-slate-500"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="m8 10 4 4 4-4"
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
      className="h-4 w-4"
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
