"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import BrandMark from "@/components/brand/BrandMark";
import { modules } from "@/lib/modules";

// Ordem e nomes curtos da referência; os demais módulos vêm depois.
const PRIMARY = [
  "dashboard",
  "knowledge",
  "agents",
  "crm",
  "properties",
  "automation",
  "settings",
];

const LABELS: Record<string, string> = {
  knowledge: "Knowledge Base",
  agents: "AI Agents",
  properties: "Properties",
  automation: "Workflows",
  settings: "Settings",
};

const ROLE_LABELS: Record<string, string> = {
  owner: "Proprietário",
  admin: "Admin",
  agent: "Corretor",
  viewer: "Leitor",
};

function displayName(email?: string): string {
  const local = (email ?? "").split("@")[0] ?? "";
  const token = local.split(/[._-]+/)[0] ?? "";
  if (/^[A-Za-zÀ-ÿ]{2,}$/.test(token)) {
    return token.charAt(0).toUpperCase() + token.slice(1);
  }
  return local || "Usuário";
}

function initials(email?: string): string {
  const local = (email ?? "").split("@")[0] ?? "";
  const tokens = local.split(/[._-]+/).filter(Boolean);
  const raw =
    tokens.length > 1 ? `${tokens[0][0]}${tokens[1][0]}` : local.slice(0, 2);
  return raw.toUpperCase() || "·";
}

export default function Sidebar({
  open,
  onClose,
  orgName,
  userEmail,
  role,
}: {
  open: boolean;
  onClose: () => void;
  orgName?: string;
  userEmail?: string;
  role?: string;
}) {
  const pathname = usePathname();

  const bySlug = (slug: string) => modules.find((m) => m.slug === slug);
  const primary = PRIMARY.map(bySlug).filter(
    (m): m is (typeof modules)[number] => Boolean(m)
  );
  const others = modules.filter((m) => !PRIMARY.includes(m.slug));

  const renderItem = (m: (typeof modules)[number]) => {
    const href = `/${m.slug}`;
    const active = pathname === href || pathname.startsWith(`${href}/`);
    const Icon = m.icon;
    return (
      <li key={m.slug}>
        <Link
          href={href}
          onClick={onClose}
          aria-current={active ? "page" : undefined}
          className={`relative flex items-center gap-4 px-6 py-3 text-[14px] ${
            active
              ? "bg-white/[0.05] text-[#f1ecdd]"
              : "text-slate-300 hover:bg-white/[0.03] hover:text-white"
          }`}
        >
          {active && (
            <span className="absolute inset-y-0 left-0 w-[3px] bg-electric" />
          )}
          <Icon
            size={20}
            strokeWidth={1.4}
            className={active ? "text-electric" : "text-slate-400"}
          />
          <span className="truncate">{LABELS[m.slug] ?? m.label}</span>
        </Link>
      </li>
    );
  };

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
        <div className="flex h-24 shrink-0 items-center justify-between px-6">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 text-[#ece7d8]"
            aria-label="LAHTEN AI"
          >
            <BrandMark size={34} />
            <span className="font-serif text-[18px] font-light tracking-[0.3em]">
              LAHTEN AI
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

        <nav className="flex-1 overflow-y-auto pb-4">
          <ul>{primary.map(renderItem)}</ul>
          {others.length > 0 && (
            <ul className="mt-3 border-t border-navy-700 pt-3">
              {others.map(renderItem)}
            </ul>
          )}
        </nav>

        <div className="shrink-0 border-t border-navy-700 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-navy-800 text-sm text-slate-200">
              {initials(userEmail)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-slate-100">
                {displayName(userEmail)}
              </p>
              <p className="truncate text-xs text-slate-500">
                {ROLE_LABELS[role ?? ""] ?? orgName ?? ""}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
