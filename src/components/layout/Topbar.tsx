"use client";

import { LogOut, Menu, Search } from "lucide-react";
import { logout } from "@/lib/auth/actions";

export default function Topbar({
  onMenu,
  orgName,
}: {
  onMenu: () => void;
  orgName?: string;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-navy-700 bg-navy-950/85 px-4 backdrop-blur-md sm:px-6 lg:px-10">
      <button
        onClick={onMenu}
        className="rounded-md p-2 text-slate-300 hover:bg-white/[0.04] lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu size={20} strokeWidth={1.6} />
      </button>

      {/* Busca real nos documentos da Knowledge Base */}
      <form
        action="/knowledge"
        method="get"
        role="search"
        className="hidden max-w-md flex-1 items-center gap-2 rounded-lg border border-navy-700 bg-navy-900 px-3 sm:flex"
      >
        <Search size={16} strokeWidth={1.6} className="text-slate-500" />
        <input
          name="q"
          maxLength={200}
          placeholder="Buscar nos documentos..."
          aria-label="Buscar nos documentos"
          className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-slate-500"
        />
      </form>

      <div className="flex-1" />

      {orgName && (
        <p className="min-w-0 max-w-[50%] truncate text-sm text-slate-300">
          {orgName}
        </p>
      )}

      <form action={logout}>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-slate-400 hover:bg-white/[0.04] hover:text-white"
          aria-label="Sair"
        >
          <LogOut size={17} strokeWidth={1.6} />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </form>
    </header>
  );
}
