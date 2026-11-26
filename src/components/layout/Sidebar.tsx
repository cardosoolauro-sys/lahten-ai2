"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import BrandMark from "@/components/brand/BrandMark";
import { groups, modules } from "@/lib/modules";

export default function Sidebar({
  open,
  onClose,
  collapsed,
  onToggleCollapse,
  orgName,
  userEmail,
}: {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  orgName?: string;
  userEmail?: string;
}) {
  const pathname = usePathname();
  const hide = collapsed ? "lg:hidden" : "";
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
        className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col border-r border-navy-700 bg-navy-900 transition-[transform,width] duration-200 lg:max-w-none lg:translate-x-0 ${
          collapsed ? "lg:w-[72px]" : "lg:w-64"
        } ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div
          className={`flex h-16 shrink-0 items-center justify-between border-b border-navy-700 px-5 ${
            collapsed ? "lg:justify-center lg:px-0" : ""
          }`}
        >
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 text-[#ece7d8]"
            aria-label="LAHTEN AI"
          >
            <BrandMark size={26} />
            <span
              className={`font-serif text-[15px] tracking-[0.3em] ${hide}`}
            >
              LAHTEN
              <span className="ml-2 text-electric">AI</span>
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

        <nav className="flex-1 overflow-y-auto px-3 py-6">
          {groups.map((group, gi) => (
            <div key={group} className="mb-7">
              {collapsed && gi > 0 && (
                <div className="mx-3 mb-4 hidden h-px bg-navy-700 lg:block" />
              )}
              <p className={`eyebrow mb-2.5 px-3 ${hide}`}>{group}</p>
              <ul className="space-y-0.5">
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
                          title={collapsed ? m.label : undefined}
                          aria-current={active ? "page" : undefined}
                          className={`group relative flex items-center gap-3 rounded-md px-3 py-2 text-[13px] ${
                            collapsed ? "lg:justify-center lg:px-0" : ""
                          } ${
                            active
                              ? "bg-electric/10 text-[#f1ecdd]"
                              : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-100"
                          }`}
                        >
                          {active && (
                            <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-electric" />
                          )}
                          <Icon
                            size={17}
                            strokeWidth={1.6}
                            className={
                              active
                                ? "text-electric"
                                : "text-slate-500 group-hover:text-slate-300"
                            }
                          />
                          <span className={`truncate ${hide}`}>{m.label}</span>
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-navy-700 p-3">
          <div
            className={`flex items-center gap-3 rounded-md px-2 py-2 ${
              collapsed ? "lg:justify-center lg:px-0" : ""
            }`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-electric/40 bg-navy-800 text-xs font-medium text-electric">
              {initial || "·"}
            </span>
            <div className={`min-w-0 flex-1 ${hide}`}>
              <p className="truncate text-xs text-slate-200">
                {userEmail ?? "Usuário"}
              </p>
              <p className="truncate text-[11px] text-slate-500">
                {orgName ?? ""}
              </p>
            </div>
          </div>
          <div
            className={`mt-1 flex items-center justify-between px-2 ${
              collapsed ? "lg:justify-center" : ""
            }`}
          >
            <span className={`eyebrow ${hide}`}>Protótipo v0.6</span>
            <button
              onClick={onToggleCollapse}
              className="hidden rounded-md p-1.5 text-slate-500 hover:text-white lg:block"
              aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            >
              {collapsed ? (
                <PanelLeftOpen size={16} strokeWidth={1.6} />
              ) : (
                <PanelLeftClose size={16} strokeWidth={1.6} />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
