"use client";

import { Menu } from "lucide-react";

export default function Topbar({ onMenu }: { onMenu: () => void }) {
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

      <span className="rounded-full border border-navy-700 bg-navy-900 px-3 py-1 text-xs text-electric-soft">
        Protótipo
      </span>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-700 text-xs font-medium">
        LA
      </div>
    </header>
  );
}
