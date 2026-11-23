import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import EnvNotice from "@/components/EnvNotice";
import OrgSetupForm from "@/components/auth/OrgSetupForm";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!hasSupabaseEnv()) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <EnvNotice />
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("memberships")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  // Usuário logado, mas sem organização (ex.: falha na criação automática).
  if (!membership) {
    const metaName: unknown = user.user_metadata?.org_name;
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <OrgSetupForm
          defaultName={typeof metaName === "string" ? metaName : ""}
        />
      </div>
    );
  }

  const { data: organization } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", membership.org_id)
    .maybeSingle();

  const metaFullName: unknown = user.user_metadata?.full_name;
  const name =
    typeof metaFullName === "string" && metaFullName.trim()
      ? metaFullName.trim()
      : (user.email ?? "Usuário");

  return (
    <AppShell
      user={{
        name,
        email: user.email ?? "",
        orgName: organization?.name ?? "Minha imobiliária",
      }}
    >
      {children}
    </AppShell>
  );
}
