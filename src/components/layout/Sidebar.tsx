"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import BrandMark from "@/components/brand/BrandMark";
import { groups, modules } from "@/lib/modules";

export default function Sidebar({
  open,
  onClose,
  orgName,
  userEmail,
}: {
  open: boolean;
  onClose: () => void;
  orgName?: string;
  userEmail?: string;
}) {
  const pathname = usePathname();
  const initial = (userEmail ?? orgName ?? "").trim().charAt(0).toUpperCase();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 max-w-[85vw] flex-col border-r border-navy-700 bg-navy-900 transition-transform duration-200 lg:w-60 lg:max-w-none lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 shrink-0 items-center justify-between px-6">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 text-[#ece7d8]"
            aria-label="LAHTEN AI"
          >
            <BrandMark size={28} />
            <span className="font-serif text-[17px] leading-none tracking-[0.28em]">
              LAHTEN
              <span className="mt-1.5 block text-[10px] tracking-[0.5em] text-electric">
                AI
              </span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:text-white lg:hidden"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-6">
          {groups.map((group, gi) => (
            <ul
              key={group}
              className={`space-y-0.5 ${
                gi > 0 ? "mt-4 border-t border-navy-700 pt-4" : ""
              }`}
            >
              {modules
                .filter((m) => m.group === group)
                .map((m) => {
                  const href = `/${m.slug}`;
                  const active =
                    pathname === href || pathname.startsWith(`${href}/`);
                  const Icon = m.icon;
                  return (
                    <li key={m.slug}>
                      <Link
                        href={href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={`group relative flex items-center gap-3 rounded-md px-3 py-2 text-[13px] ${
                          active
                            ? "bg-electric/10 text-[#f1ecdd]"
                            : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-100"
                        }`}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-electric" />
                        )}
                        <Icon
                          size={16}
                          strokeWidth={1.5}
                          className={
                            active
                              ? "text-electric"
                              : "text-slate-500 group-hover:text-slate-300"
                          }
                        />
                        <span className="truncate">{m.label}</span>
                      </Link>
                    </li>
                  );
                })}
            </ul>
          ))}
        </nav>

        <div className="shrink-0 border-t border-navy-700 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-electric/40 bg-navy-800 text-xs font-medium text-electric">
              {initial || "·"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-slate-200">
                {userEmail ?? "Usuário"}
              </p>
              <p className="truncate text-[11px] text-slate-500">
                {orgName ?? ""}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
