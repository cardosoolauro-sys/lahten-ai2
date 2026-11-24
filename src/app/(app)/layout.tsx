import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("memberships")
    .select("org_id")
    .limit(1);

  const orgId = memberships?.[0]?.org_id;
  if (!orgId) redirect("/onboarding");

  const { data: org } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", orgId)
    .maybeSingle();

  return <AppShell orgName={org?.name ?? ""}>{children}</AppShell>;
}
