import { redirect } from "next/navigation";
import CreateOrgForm from "@/components/org/CreateOrgForm";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: memberships } = await supabase
    .from("memberships")
    .select("org_id")
    .limit(1);

  if (memberships && memberships.length > 0) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <p className="text-2xl font-semibold tracking-tight">
        LAHTEN <span className="text-electric">AI</span>
      </p>
      <CreateOrgForm />
    </main>
  );
}
