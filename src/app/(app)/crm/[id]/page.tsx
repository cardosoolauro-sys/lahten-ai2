import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ContactForm from "@/components/crm/ContactForm";
import DeleteContactButton from "@/components/crm/DeleteContactButton";
import { KINDS, STATUSES } from "@/lib/crm/constants";
import { createClient } from "@/lib/supabase/server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const supabase = await createClient();

  const { data: contact } = await supabase
    .from("contacts")
    .select("id, full_name, phone, email, kind, status, source, interest, notes, org_id")
    .eq("id", id)
    .maybeSingle();
  if (!contact) notFound();

  const { data: memberships } = await supabase
    .from("memberships")
    .select("role")
    .eq("org_id", contact.org_id)
    .limit(1);
  const role = String(memberships?.[0]?.role ?? "");
  const canEdit = ["owner", "admin", "agent"].includes(role);
  const isAdmin = ["owner", "admin"].includes(role);

  const details: [string, string | null][] = [
    ["Tipo", KINDS[contact.kind] ?? contact.kind],
    ["Status", STATUSES[contact.status] ?? contact.status],
    ["Telefone", contact.phone],
    ["E-mail", contact.email],
    ["Origem", contact.source],
    ["Interesse", contact.interest],
    ["Observações", contact.notes],
  ];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/crm"
          className="rounded-md p-2 text-slate-300 hover:bg-navy-800"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="min-w-0 truncate text-xl font-semibold tracking-tight">
          {contact.full_name}
        </h1>
      </div>

      {canEdit ? (
        <>
          <ContactForm contact={contact} />
          {isAdmin && (
            <div className="border-t border-navy-700 pt-6">
              <DeleteContactButton id={contact.id} />
            </div>
          )}
        </>
      ) : (
        <dl className="space-y-3 rounded-xl border border-navy-700 bg-navy-900 p-4">
          {details.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-slate-400">{label}</dt>
              <dd className="whitespace-pre-wrap break-words text-sm">
                {value || "—"}
              </dd>
            </div>
          ))}
          <p className="pt-2 text-xs text-slate-500">
            Seu papel permite apenas visualizar contatos.
          </p>
        </dl>
      )}
    </div>
  );
}
