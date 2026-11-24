import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import MessageForm from "@/components/workspace/MessageForm";
import { createClient } from "@/lib/supabase/server";
import { isAiConfigured } from "@/lib/ai/gemini";

// A chamada à IA roda dentro da server action desta página.
export const maxDuration = 60;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type MessageRow = {
  id: string;
  role: string;
  content: string;
  created_at: string;
};

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const supabase = await createClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, title")
    .eq("id", id)
    .maybeSingle();
  if (!conversation) notFound();

  const { data } = await supabase
    .from("messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })
    .limit(500);

  const messages: MessageRow[] = data ?? [];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link
          href="/workspace"
          className="rounded-md p-2 text-slate-300 hover:bg-navy-800"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="min-w-0 truncate text-lg font-semibold">
          {conversation.title}
        </h1>
      </div>

      {!isAiConfigured() && (
        <div className="rounded-lg border border-electric/30 bg-electric/10 px-4 py-3 text-sm text-electric-soft">
          A IA ainda não está configurada neste ambiente. As mensagens são
          salvas, mas não há resposta automática.
        </div>
      )}

      <div className="min-h-[40vh] space-y-3">
        {messages.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500">
            Envie a primeira mensagem.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2 text-sm ${
                m.role === "user"
                  ? "bg-electric text-white"
                  : "border border-navy-700 bg-navy-900 text-slate-200"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <MessageForm conversationId={id} />
    </div>
  );
}
