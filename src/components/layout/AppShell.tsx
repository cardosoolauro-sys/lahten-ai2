"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({
  children,
  orgName,
  userEmail,
  role,
}: {
  children: React.ReactNode;
  orgName?: string;
  userEmail?: string;
  role?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar
        open={open}
        onClose={() => setOpen(false)}
        orgName={orgName}
        userEmail={userEmail}
        role={role}
      />
      <div className="lg:pl-60">
        <Topbar onMenu={() => setOpen(true)} orgName={orgName} />
        <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
