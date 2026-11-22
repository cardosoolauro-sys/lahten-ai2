"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { groups, modules } from "@/lib/modules";

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-navy-700 bg-navy-900 transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-navy-700 px-5">
          <Link href="/dashboard" onClick={onClose} className="text-lg font-semibold tracking-tight">
            LAHTEN <span className="text-electric">AI</span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:text-white lg:hidden"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {groups.map((group) => (
            <div key={group}>
              <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                {group}
              </p>
              <ul className="space-y-1">
                {modules
                  .filter((m) => m.group === group)
                  .map((m) => {
                    const href = `/${m.slug}`;
                    const active = pathname === href;
                    const Icon = m.icon;
                    return (
                      <li key={m.slug}>
                        <Link
                          href={href}
                          onClick={onClose}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                            active
                              ? "bg-electric/15 text-white"
                              : "text-slate-400 hover:bg-navy-800 hover:text-white"
                          }`}
                        >
                          <Icon
                            size={18}
                            className={active ? "text-electric" : ""}
                          />
                          {m.label}
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-navy-700 px-5 py-4 text-xs text-slate-500">
          Protótipo v0.2
        </div>
      </aside>
    </>
  );
}
