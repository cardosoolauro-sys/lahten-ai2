"use client";

import { LogOut, Menu } from "lucide-react";
import { logout } from "@/lib/auth/actions";

export default function Topbar({
  onMenu,
  orgName,
}: {
  onMenu: () => void;
  orgName?: string;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-navy-700 bg-navy-950/80 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        onClick={onMenu}
        className="rounded-md p-2 text-slate-300 hover:bg-navy-800 lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-200">
        {orgName}
      </p>

      <span className="rounded-full border border-navy-700 bg-navy-900 px-3 py-1 text-xs text-electric-soft">
        Protótipo
      </span>
      <form action={logout}>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-md p-2 text-sm text-slate-300 hover:bg-navy-800"
          aria-label="Sair"
        >
          <LogOut size={18} />
        </button>
      </form>
    </header>
  );
}
