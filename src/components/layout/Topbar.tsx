"use client";

import { usePathname } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { logout } from "@/lib/auth/actions";
import { modules } from "@/lib/modules";

export default function Topbar({
  onMenu,
  orgName,
}: {
  onMenu: () => void;
  orgName?: string;
}) {
  const pathname = usePathname();
  const segment = pathname.split("/")[1] ?? "";
  const current = modules.find((m) => m.slug === segment);
  const initial = (orgName ?? "").trim().charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-navy-700 bg-navy-950/80 px-4 backdrop-blur-md sm:px-6 lg:px-10">
      <button
        onClick={onMenu}
        className="rounded-md p-2 text-slate-300 hover:bg-white/[0.04] lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu size={20} strokeWidth={1.6} />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        {initial && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-navy-700 bg-navy-800 text-xs font-medium text-slate-200">
            {initial}
          </span>
        )}
        <p className="truncate text-sm font-medium text-slate-200">
          {orgName}
        </p>
        {current && (
          <>
            <span className="hidden text-slate-600 md:inline">/</span>
            <p className="hidden truncate text-sm text-slate-500 md:block">
              {current.label}
            </p>
          </>
        )}
      </div>

      <span className="hidden rounded-full border border-navy-700 px-2.5 py-0.5 text-[11px] tracking-wide text-electric-soft sm:inline">
        Protótipo
      </span>

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
