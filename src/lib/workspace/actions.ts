"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateReply } from "@/lib/ai/provider";
import { AiError, type AiErrorCode, type ChatMessage } from "@/lib/ai/types";
import { createClient } from "@/lib/supabase/server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DEFAULT_TITLE = "Nova conversa";
const HISTORY_LIMIT = 20;

export type MessageFormState =
  | { error?: string; ok?: boolean; saved?: boolean }
  | undefined;

function messageFor(code: AiErrorCode): string {
  if (code === "not_configured") {
    return "A IA não está configurada no servidor.";
  }
  if (code === "rate_limited") {
    return "O limite gratuito do Gemini foi atingido. Aguarde um pouco e envie de novo.";
  }
  return "A IA não respondeu. Sua mensagem foi salva; tente enviar de novo.";
}

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

  // 1. Salva a mensagem da pessoa.
  const { error: insertError } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    org_id: conversation.org_id,
    role: "user",
    content,
  });
  if (insertError) return { error: "Não foi possível salvar a mensagem." };

  await supabase
    .from("conversations")
    .update({ title: content.replace(/\s+/g, " ").slice(0, 60) })
    .eq("id", conversationId)
    .eq("title", DEFAULT_TITLE);

  revalidatePath(`/workspace/${conversationId}`);
  revalidatePath("/workspace");

  // 2. Reserva uma chamada de IA (limite diário por pessoa e por organização).
  const { data: allowed, error: quotaError } = await supabase.rpc(
    "reserve_ai_call",
    { p_conversation: conversationId }
  );
  if (quotaError) {
    return {
      saved: true,
      error: "Não foi possível verificar o limite de uso da IA.",
    };
  }
  if (!allowed) {
    return {
      saved: true,
      error: "Limite diário de uso da IA atingido. Tente novamente amanhã.",
    };
  }

  // 3. Monta o contexto com as últimas mensagens.
  const { data: history } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(HISTORY_LIMIT);

  const messages: ChatMessage[] = (
    (history ?? []) as { role: string; content: string }[]
  )
    .filter((m) => m.role === "user" || m.role === "assistant")
    .reverse()
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  // 4. Chama a IA (somente no servidor).
  let reply: string;
  try {
    reply = await generateReply(messages);
  } catch (e) {
    const code: AiErrorCode = e instanceof AiError ? e.code : "failed";
    console.error("Falha ao gerar resposta da IA:", code);
    return { saved: true, error: messageFor(code) };
  }

  // 5. Salva a resposta.
  const { error: saveError } = await supabase.rpc("save_ai_reply", {
    p_conversation: conversationId,
    p_content: reply,
  });
  if (saveError) {
    return {
      saved: true,
      error: "A IA respondeu, mas não foi possível salvar a resposta.",
    };
  }

  revalidatePath(`/workspace/${conversationId}`);
  revalidatePath("/workspace");
  return { ok: true, saved: true };
}
