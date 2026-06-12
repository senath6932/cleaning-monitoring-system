"use client";

import { useState } from "react";
import Sidebar from "./sidebar";
import Topbar from "./topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function toggleSidebar() {
    if (window.innerWidth < 1024) {
      setCollapsed(false);
      setMobileOpen((open) => !open);
      return;
    }

    setCollapsed((value) => !value);
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 lg:flex-row">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
        onToggle={toggleSidebar}
      />

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/45 lg:hidden"
        />
      )}

      <main className="relative min-w-0 flex-1 px-4 py-4 text-slate-900 transition-[padding] sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[1680px] flex-col rounded-[1.5rem] bg-gray-100 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-6 lg:p-8">
          <Topbar />
          {children}
        </div>
      </main>
    </div>
  );
}
