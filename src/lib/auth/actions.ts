"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureOrganization } from "@/lib/auth/organization";

function field(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

async function getOrigin(): Promise<string> {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;

  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function login(formData: FormData): Promise<void> {
  const email = field(formData, "email");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) redirect("/login?error=missing_fields");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    redirect(`/login?error=${encodeURIComponent(error?.code ?? "unknown")}`);
  }

  await ensureOrganization(supabase, data.user);
  redirect("/dashboard");
}

export async function signup(formData: FormData): Promise<void> {
  const fullName = field(formData, "full_name");
  const orgName = field(formData, "org_name");
  const email = field(formData, "email");
  const password = String(formData.get("password") ?? "");

  if (!fullName || !orgName || !email || !password) {
    redirect("/cadastro?error=missing_fields");
  }
  if (password.length < 8) redirect("/cadastro?error=weak_password");

  const origin = await getOrigin();
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, org_name: orgName },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/cadastro?error=${encodeURIComponent(error.code ?? "unknown")}`);
  }

  // Com a confirmação de e-mail desligada o Supabase já devolve a sessão.
  if (data.session && data.user) {
    await ensureOrganization(supabase, data.user);
    redirect("/dashboard");
  }

  redirect("/login?message=confirm_email");
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createOrganizationAction(
  _prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const name = field(formData, "org_name");
  if (!name) return { error: "Informe o nome da imobiliária." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_organization", { p_name: name });

  if (error) {
    return { error: "Não foi possível criar a organização. Tente novamente." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
