"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type OrgFormState = { error?: string } | undefined;

export async function createOrganization(
  _prev: OrgFormState,
  formData: FormData
): Promise<OrgFormState> {
  const name = String(formData.get("name") ?? "")
    .trim()
    .replace(/\s+/g, " ");

  if (name.length < 2 || name.length > 80) {
    return { error: "O nome deve ter de 2 a 80 caracteres." };
  }

  const supabase = await createClient();

  // Nesta fase, cada pessoa cria no máximo uma organização pela interface.
  const { data: existing } = await supabase
    .from("memberships")
    .select("org_id")
    .limit(1);
  if (existing && existing.length > 0) redirect("/dashboard");

  const { error } = await supabase.rpc("create_organization", {
    p_name: name,
  });
  if (error) {
    return { error: "Não foi possível criar a organização. Tente novamente." };
  }

  redirect("/dashboard");
}
