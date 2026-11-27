"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, LogOut, Menu, Search } from "lucide-react";
import { logout } from "@/lib/auth/actions";

export default function Topbar({
  onMenu,
  orgName,
}: {
  onMenu: () => void;
  orgName?: string;
}) {
  const pathname = usePathname();
  const overlay = pathname === "/dashboard";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const transparent = overlay && !scrolled;
  const initial = (orgName ?? "").trim().charAt(0).toUpperCase();

  return (
    <header
      className={`sticky top-0 z-20 flex h-16 items-center gap-3 px-4 transition-colors sm:gap-4 sm:px-6 lg:h-20 lg:px-10 ${
        transparent
          ? "border-b border-transparent bg-transparent"
          : "border-b border-navy-700 bg-navy-950/85 backdrop-blur-md"
      }`}
    >
      <button
        onClick={onMenu}
        className="rounded-md p-2 text-slate-200 hover:bg-white/[0.06] lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu size={20} strokeWidth={1.5} />
      </button>

      {/* Busca real nos documentos da Knowledge Base */}
      <form
        action="/knowledge"
        method="get"
        role="search"
        className="hidden h-12 max-w-xl flex-1 items-center gap-3 rounded-md border border-white/20 bg-black/25 px-4 backdrop-blur-sm focus-within:border-electric sm:flex"
      >
        <Search size={18} strokeWidth={1.5} className="text-slate-300" />
        <input
          name="q"
          maxLength={200}
          placeholder="Buscar nos documentos..."
          aria-label="Buscar nos documentos"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </form>

      <div className="flex-1" />

      {/* Ainda não existe sistema de notificações: ícone desativado */}
      <button
        type="button"
        disabled
        aria-disabled="true"
        title="Notificações em breve"
        className="cursor-not-allowed rounded-md p-2 text-slate-500"
      >
        <Bell size={20} strokeWidth={1.5} />
      </button>

      {orgName && (
        <div className="flex min-w-0 items-center gap-2.5 rounded-lg border border-white/15 bg-black/30 px-2.5 py-1.5 backdrop-blur-sm">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-navy-700 text-sm text-electric">
            {initial}
          </span>
          <p className="hidden max-w-[12rem] truncate text-sm text-slate-100 sm:block">
            {orgName}
          </p>
        </div>
      )}

      <form action={logout}>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white"
          aria-label="Sair"
        >
          <LogOut size={18} strokeWidth={1.5} />
          <span className="hidden xl:inline">Sair</span>
        </button>
      </form>
    </header>
  );
}
