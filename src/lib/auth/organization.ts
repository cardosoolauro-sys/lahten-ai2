import type { User } from "@supabase/supabase-js";
import type { createClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Garante que o usuário pertença a uma organização.
 * Se não pertencer, cria uma pela função create_organization do banco
 * (o usuário vira "owner"). O nome vem do cadastro (org_name).
 */
export async function ensureOrganization(
  supabase: ServerClient,
  user: User,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("memberships")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1);

  if (error) return false;
  if (data && data.length > 0) return true;

  const metaName: unknown = user.user_metadata?.org_name;
  const name =
    typeof metaName === "string" && metaName.trim()
      ? metaName.trim()
      : "Minha imobiliária";

  const { error: rpcError } = await supabase.rpc("create_organization", {
    p_name: name,
  });

  return !rpcError;
}
