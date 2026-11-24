"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  AiNotConfiguredError,
  generateReply,
  type ChatTurn,
} from "@/lib/ai/gemini";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DEFAULT_TITLE = "Nova conversa";
// Quantas mensagens recentes são enviadas à IA como contexto.
const HISTORY_LIMIT = 20;

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

  // A mensagem do usuário já está salva. Daqui em diante, qualquer falha
  // só impede a resposta da IA e nada se perde.
  const done = (): MessageFormState => {
    revalidatePath(`/workspace/${conversationId}`);
    revalidatePath("/workspace");
    return { ok: true };
  };
  // ok: true limpa o campo (a mensagem já foi salva); error mostra o aviso.
  const fail = (message: string): MessageFormState => {
    revalidatePath(`/workspace/${conversationId}`);
    return { ok: true, error: message };
  };

  // Limite diário por usuário e por organização (função do banco).
  const { data: allowed, error: limitError } = await supabase.rpc(
    "reserve_ai_call",
    { p_conversation: conversationId }
  );
  if (limitError) {
    return fail("Mensagem salva, mas não foi possível verificar o limite de uso da IA.");
  }
  if (allowed !== true) {
    return fail("Mensagem salva. O limite diário de uso da IA foi atingido; tente novamente amanhã.");
  }

  // Histórico recente da conversa, do mais antigo para o mais novo.
  const { data: recent, error: historyError } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(HISTORY_LIMIT);
  if (historyError || !recent) {
    return fail("Mensagem salva, mas não foi possível ler o histórico da conversa.");
  }

  const history: ChatTurn[] = recent
    .filter((m) => m.role === "user" || m.role === "assistant")
    .reverse()
    .map((m) => ({ role: m.role as ChatTurn["role"], content: m.content }));

  let reply: string;
  try {
    reply = await generateReply(history);
  } catch (error) {
    if (error instanceof AiNotConfiguredError) {
      return fail("Mensagem salva. A IA ainda não está configurada neste ambiente.");
    }
    console.error(
      "Erro ao chamar a IA:",
      error instanceof Error ? error.message : "erro desconhecido"
    );
    return fail("Mensagem salva, mas a IA não respondeu. Tente novamente.");
  }

  const { error: saveError } = await supabase.rpc("save_ai_reply", {
    p_conversation: conversationId,
    p_content: reply,
  });
  if (saveError) {
    return fail("A IA respondeu, mas não foi possível salvar a resposta.");
  }

  return done();
}
