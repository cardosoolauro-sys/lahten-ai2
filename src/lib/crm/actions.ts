"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { KINDS, STATUSES } from "./constants";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ContactFormState = { error?: string } | undefined;
export type DeleteResult = { ok?: boolean; error?: string };

function parse(formData: FormData) {
  const get = (k: string) => String(formData.get(k) ?? "").trim();

  const full_name = get("full_name").replace(/\s+/g, " ");
  const email = get("email").toLowerCase();
  const phone = get("phone");
  const kind = get("kind");
  const status = get("status");
  const source = get("source");
  const interest = get("interest");
  const notes = get("notes");

  if (full_name.length < 2 || full_name.length > 120) {
    return { error: "O nome deve ter de 2 a 120 caracteres." };
  }
  if (
    email &&
    (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  ) {
    return { error: "E-mail inválido." };
  }
  if (phone && !/^[0-9+()\-.\s]{6,30}$/.test(phone)) {
    return { error: "Telefone inválido." };
  }
  if (!Object.hasOwn(KINDS, kind)) return { error: "Tipo inválido." };
  if (!Object.hasOwn(STATUSES, status)) return { error: "Status inválido." };
  if (source.length > 100 || interest.length > 500 || notes.length > 5000) {
    return { error: "Algum campo passou do tamanho máximo." };
  }

  return {
    values: {
      full_name,
      email: email || null,
      phone: phone || null,
      kind,
      status,
      source: source || null,
      interest: interest || null,
      notes: notes || null,
    },
  };
}

export async function createContact(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const parsed = parse(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { data: memberships } = await supabase
    .from("memberships")
    .select("org_id")
    .limit(1);
  const orgId = memberships?.[0]?.org_id;
  if (!orgId) redirect("/onboarding");

  const { error } = await supabase
    .from("contacts")
    .insert({ org_id: orgId, ...parsed.values });
  if (error) {
    return {
      error:
        "Não foi possível salvar o contato. Seu papel pode não permitir criar contatos.",
    };
  }

  revalidatePath("/crm");
  redirect("/crm");
}

export async function updateContact(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const id = String(formData.get("id") ?? "");
  if (!UUID_RE.test(id)) return { error: "Contato inválido." };

  const parsed = parse(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .update(parsed.values)
    .eq("id", id)
    .select("id");

  if (error || !data || data.length === 0) {
    return {
      error:
        "Não foi possível salvar. Seu papel pode não permitir editar contatos.",
    };
  }

  revalidatePath("/crm");
  redirect("/crm");
}

export async function deleteContact(id: string): Promise<DeleteResult> {
  if (!UUID_RE.test(id)) return { error: "Contato inválido." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", id)
    .select("id");

  if (error || !data || data.length === 0) {
    return { error: "Somente owner e admin podem apagar contatos." };
  }

  revalidatePath("/crm");
  return { ok: true };
    }
