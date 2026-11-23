"use client";

import { LogOut, Menu } from "lucide-react";
import { logout } from "@/lib/auth/actions";
import type { ShellUser } from "./AppShell";

function initials(name: string): string {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  return letters || "?";
}

export default function Topbar({
  user,
  onMenu,
}: {
  user: ShellUser;
  onMenu: () => void;
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

      <div className="flex-1" />

      <span className="max-w-[10rem] truncate rounded-full border border-navy-700 bg-navy-900 px-3 py-1 text-xs text-electric-soft sm:max-w-xs">
        {user.orgName}
      </span>

      <div
        className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-700 text-xs font-medium"
        title={`${user.name} · ${user.email}`}
      >
        {initials(user.name)}
      </div>

      <form action={logout}>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-slate-400 hover:bg-navy-800 hover:text-white"
          aria-label="Sair"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </form>
    </header>
  );
}
