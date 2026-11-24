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

  return (
    <div className="min-h-screen">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="lg:pl-64">
        <Topbar onMenu={() => setOpen(true)} orgName={orgName} />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
