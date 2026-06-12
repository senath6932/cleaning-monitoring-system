"use client";

import { usePathname } from "next/navigation";
import UserMenu from "./user-menu";

export default function Topbar() {
  const pathname = usePathname();

  if (pathname === "/dashboard/gaa") {
    return null;
  }

  return (
    <div className="mb-6 flex items-center justify-end border-b border-slate-200 pb-4">
      <UserMenu />
    </div>
  );
}
