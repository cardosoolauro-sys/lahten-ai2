import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import DeletePropertyButton from "@/components/properties/DeletePropertyButton";
import PropertyForm from "@/components/properties/PropertyForm";
import {
  PURPOSES,
  STATUSES,
  TYPES,
  formatBRL,
} from "@/lib/properties/constants";
import { createClient } from "@/lib/supabase/server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const supabase = await createClient();

  const { data: property } = await supabase
    .from("properties")
    .select(
      "id, org_id, title, property_type, purpose, status, sale_price, rent_price, area_m2, bedrooms, bathrooms, address, city, state, description"
    )
    .eq("id", id)
    .maybeSingle();
  if (!property) notFound();

  const { data: memberships } = await supabase
    .from("memberships")
    .select("role")
    .eq("org_id", property.org_id)
    .limit(1);
  const role = String(memberships?.[0]?.role ?? "");
  const canEdit = ["owner", "admin", "agent"].includes(role);
  const isAdmin = ["owner", "admin"].includes(role);

  const place = [property.address, property.city, property.state]
    .filter(Boolean)
    .join(", ");

  const details: [string, string][] = [
    ["Tipo", TYPES[property.property_type] ?? property.property_type],
    ["Finalidade", PURPOSES[property.purpose] ?? property.purpose],
    ["Status", STATUSES[property.status] ?? property.status],
    ["Preço de venda", formatBRL(property.sale_price)],
    ["Aluguel mensal", formatBRL(property.rent_price)],
    ["Área", property.area_m2 ? `${property.area_m2} m²` : "—"],
    ["Quartos", property.bedrooms !== null ? String(property.bedrooms) : "—"],
    [
      "Banheiros",
      property.bathrooms !== null ? String(property.bathrooms) : "—",
    ],
    ["Localização", place || "—"],
    ["Descrição", property.description || "—"],
  ];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/properties"
          className="rounded-md p-2 text-slate-300 hover:bg-white/[0.04]"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="min-w-0">
          <p className="eyebrow">Imóveis</p>
          <h1 className="truncate text-2xl font-medium">{property.title}</h1>
        </div>
      </div>

      {canEdit ? (
        <>
          <PropertyForm property={property} />
          {isAdmin && (
            <div className="border-t border-navy-700 pt-6">
              <DeletePropertyButton id={property.id} />
            </div>
          )}
        </>
      ) : (
        <dl className="space-y-4 rounded-xl border border-navy-700 bg-navy-900 p-5">
          {details.map(([label, value]) => (
            <div key={label}>
              <dt className="eyebrow">{label}</dt>
              <dd className="mt-1 whitespace-pre-wrap break-words text-sm">
                {value}
              </dd>
            </div>
          ))}
          <p className="pt-2 text-xs text-slate-500">
            Seu papel permite apenas visualizar imóveis.
          </p>
        </dl>
      )}
    </div>
  );
}
