"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DEFAULT_TITLE = "Nova conversa";

export type MessageFormState = { error?: string; ok?: boolean } | undefined;

export async function createConversation(): Promise<void> {
  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("memberships")
    .select("org_id")
    .limit(1);
  const orgId = memberships?.[0]?.org_id;
  if (!orgId) redirect("/onboarding");

  const { data, error } = await supabase
    .from("conversations")
    .insert({ org_id: orgId, title: DEFAULT_TITLE })
    .select("id")
    .single();

  if (error || !data) redirect("/workspace?erro=1");
  redirect(`/workspace/${data.id}`);
}

export async function sendMessage(
  _prev: MessageFormState,
  formData: FormData
): Promise<MessageFormState> {
  const conversationId = String(formData.get("conversationId") ?? "");
  const content = String(formData.get("content") ?? "").trim();

  if (!UUID_RE.test(conversationId)) return { error: "Conversa inválida." };
  if (content.length < 1 || content.length > 4000) {
    return { error: "A mensagem deve ter de 1 a 4000 caracteres." };
  }

  const supabase = await createClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("org_id")
    .eq("id", conversationId)
    .maybeSingle();
  if (!conversation) return { error: "Conversa não encontrada." };

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    org_id: conversation.org_id,
    role: "user",
    content,
  });
  if (error) return { error: "Não foi possível salvar a mensagem." };

  // A primeira mensagem vira o título da conversa.
  await supabase
    .from("conversations")
    .update({ title: content.replace(/\s+/g, " ").slice(0, 60) })
    .eq("id", conversationId)
    .eq("title", DEFAULT_TITLE);

  revalidatePath(`/workspace/${conversationId}`);
  revalidatePath("/workspace");
  return { ok: true };
}
