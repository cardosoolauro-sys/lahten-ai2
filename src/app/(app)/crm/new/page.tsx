import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ContactForm from "@/components/crm/ContactForm";
import { createClient } from "@/lib/supabase/server";

export default async function NewContactPage() {
  const supabase = await createClient();
  const { data: memberships } = await supabase
    .from("memberships")
    .select("role")
    .limit(1);
  const role = String(memberships?.[0]?.role ?? "");

  if (!["owner", "admin", "agent"].includes(role)) redirect("/crm");

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
        <h1 className="text-xl font-semibold tracking-tight">Novo contato</h1>
      </div>
      <ContactForm />
    </div>
  );
}
