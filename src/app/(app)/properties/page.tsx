import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Search } from "lucide-react";
import {
  STATUSES,
  TYPES,
  formatBRL,
} from "@/lib/properties/constants";
import { createClient } from "@/lib/supabase/server";

type PropertyRow = {
  id: string;
  title: string;
  property_type: string;
  purpose: string;
  status: string;
  sale_price: number | string | null;
  rent_price: number | string | null;
  city: string | null;
  state: string | null;
  bedrooms: number | null;
  area_m2: number | string | null;
};

export default async function PropertiesPage({
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
    .from("properties")
    .select(
      "id, title, property_type, purpose, status, sale_price, rent_price, city, state, bedrooms, area_m2"
    )
    .eq("org_id", membership.org_id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (status) query = query.eq("status", status);
  if (q) {
    const safe = q.replace(/[%,()*\\]/g, " ").trim();
    if (safe) {
      query = query.or(
        `title.ilike.%${safe}%,address.ilike.%${safe}%,city.ilike.%${safe}%`
      );
    }
  }

  const { data } = await query;
  const properties: PropertyRow[] = data ?? [];

  const chip = (value: string, label: string) => {
    const active = status === value;
    const href = `/properties?${new URLSearchParams({
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

  const priceLine = (p: PropertyRow) => {
    const parts: string[] = [];
    if (p.sale_price !== null && p.purpose !== "rent") {
      parts.push(formatBRL(p.sale_price));
    }
    if (p.rent_price !== null && p.purpose !== "sale") {
      parts.push(`${formatBRL(p.rent_price)}/mês`);
    }
    return parts.join(" · ") || "Preço não informado";
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Property Management</p>
          <h1 className="mt-3 text-3xl font-medium">Imóveis</h1>
        </div>
        {canEdit && (
          <Link
            href="/properties/new"
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
          placeholder="Buscar por título, endereço ou cidade..."
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

      {properties.length === 0 ? (
        <p className="rounded-xl border border-navy-700 bg-navy-900 p-6 text-center text-sm text-slate-400">
          {q || status
            ? "Nenhum imóvel encontrado com esses filtros."
            : "Nenhum imóvel cadastrado ainda."}
        </p>
      ) : (
        <ul className="space-y-2">
          {properties.map((p) => (
            <li key={p.id}>
              <Link
                href={`/properties/${p.id}`}
                className="block rounded-xl border border-navy-700 bg-navy-900 px-4 py-4 hover:border-electric/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 truncate text-sm font-medium">
                    {p.title}
                  </p>
                  <span className="shrink-0 rounded-full bg-navy-800 px-2 py-0.5 text-xs text-electric-soft">
                    {STATUSES[p.status] ?? p.status}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {TYPES[p.property_type] ?? p.property_type}
                  {p.bedrooms !== null ? ` · ${p.bedrooms} quartos` : ""}
                  {p.area_m2 ? ` · ${p.area_m2} m²` : ""}
                  {p.city
                    ? ` · ${p.city}${p.state ? `/${p.state}` : ""}`
                    : ""}
                </p>
                <p className="mt-3 font-serif text-lg">{priceLine(p)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
                  }
