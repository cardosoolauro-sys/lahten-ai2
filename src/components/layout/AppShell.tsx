"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({
  children,
  orgName,
}: {
  children: React.ReactNode;
  orgName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar
        open={open}
        onClose={() => setOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
      />
      <div
        className={`transition-[padding] duration-200 ${
          collapsed ? "lg:pl-[72px]" : "lg:pl-64"
        }`}
      >
        <Topbar onMenu={() => setOpen(true)} orgName={orgName} />
        <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
