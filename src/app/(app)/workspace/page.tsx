import Link from "next/link";
import { MessageSquarePlus } from "lucide-react";
import { createConversation } from "@/lib/workspace/actions";
import { createClient } from "@/lib/supabase/server";

type ConversationRow = { id: string; title: string; updated_at: string };

export default async function WorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from("conversations")
    .select("id, title, updated_at")
    .order("updated_at", { ascending: false })
    .limit(50);

  const conversations: ConversationRow[] = data ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            AI Workspace
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Suas conversas ficam salvas e visíveis só para você.
          </p>
        </div>
        <form action={createConversation}>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-electric px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <MessageSquarePlus size={16} />
            Nova
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-electric/30 bg-electric/10 px-4 py-3 text-sm text-electric-soft">
        A IA ainda não está conectada. As mensagens são salvas, mas não há
        resposta automática (prevista para a Tarefa 3.2).
      </div>

      {erro && (
        <p className="text-sm text-red-400">
          Não foi possível criar a conversa. Tente novamente.
        </p>
      )}

      {conversations.length === 0 ? (
        <p className="rounded-xl border border-navy-700 bg-navy-900 p-6 text-center text-sm text-slate-400">
          Nenhuma conversa ainda. Toque em &ldquo;Nova&rdquo; para começar.
        </p>
      ) : (
        <ul className="space-y-2">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                href={`/workspace/${c.id}`}
                className="block rounded-xl border border-navy-700 bg-navy-900 px-4 py-3 transition-colors hover:border-electric/50"
              >
                <p className="truncate text-sm font-medium">{c.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(c.updated_at).toLocaleString("pt-BR", {
                    timeZone: "America/Sao_Paulo",
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
