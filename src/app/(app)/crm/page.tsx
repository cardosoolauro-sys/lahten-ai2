import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { KINDS, STATUSES } from "@/lib/crm/constants";
import { createClient } from "@/lib/supabase/server";

type ContactRow = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  kind: string;
  status: string;
};

export default async function CrmPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; status?: string | string[] }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const status =
    typeof params.status === "string" && Object.hasOwn(STATUSES, params.status)
      ? params.status
      : "";

  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("memberships")
    .select("org_id, role")
    .limit(1);
  const membership = memberships?.[0];
  if (!membership) redirect("/onboarding");

  const canEdit = ["owner", "admin", "agent"].includes(
    String(membership.role)
  );

  let query = supabase
    .from("contacts")
    .select("id, full_name, phone, email, kind, status")
    .eq("org_id", membership.org_id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (status) query = query.eq("status", status);
  if (q) {
    // Remove caracteres que quebrariam o filtro.
    const safe = q.replace(/[%,()*\\]/g, " ").trim();
    if (safe) {
      query = query.or(
        `full_name.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%`
      );
    }
  }

  const { data } = await query;
  const contacts: ContactRow[] = data ?? [];

  const chip = (value: string, label: string) => {
    const active = status === value;
    const href = `/crm?${new URLSearchParams({
      ...(q ? { q } : {}),
      ...(value ? { status: value } : {}),
    }).toString()}`;
    return (
      <Link
        key={value || "all"}
        href={href}
        className={`shrink-0 rounded-full border px-3 py-1 text-xs ${
          active
            ? "border-electric bg-electric/15 text-white"
            : "border-navy-700 text-slate-400 hover:text-white"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">CRM</h1>
          <p className="mt-1 text-sm text-slate-400">
            Clientes e leads da sua organização.
          </p>
        </div>
        {canEdit && (
          <Link
            href="/crm/new"
            className="flex items-center gap-2 rounded-lg bg-electric px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus size={16} />
            Novo
          </Link>
        )}
      </div>

      <form method="get" className="flex gap-2">
        {status && <input type="hidden" name="status" value={status} />}
        <input
          name="q"
          defaultValue={q}
          maxLength={100}
          placeholder="Buscar por nome, e-mail ou telefone..."
          className="min-w-0 flex-1 rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm outline-none focus:border-electric"
        />
        <button
          type="submit"
          aria-label="Buscar"
          className="rounded-lg bg-electric px-3 text-white hover:opacity-90"
        >
          <Search size={18} />
        </button>
      </form>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {chip("", "Todos")}
        {Object.entries(STATUSES).map(([value, label]) => chip(value, label))}
      </div>

      {contacts.length === 0 ? (
        <p className="rounded-xl border border-navy-700 bg-navy-900 p-6 text-center text-sm text-slate-400">
          {q || status
            ? "Nenhum contato encontrado com esses filtros."
            : "Nenhum contato ainda."}
        </p>
      ) : (
        <ul className="space-y-2">
          {contacts.map((c) => (
            <li key={c.id}>
              <Link
                href={`/crm/${c.id}`}
                className="block rounded-xl border border-navy-700 bg-navy-900 px-4 py-3 transition-colors hover:border-electric/50"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium">{c.full_name}</p>
                  <span className="shrink-0 rounded-full bg-navy-800 px-2 py-0.5 text-xs text-electric-soft">
                    {STATUSES[c.status] ?? c.status}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {KINDS[c.kind] ?? c.kind}
                  {c.phone ? ` · ${c.phone}` : ""}
                  {c.email ? ` · ${c.email}` : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
      }
