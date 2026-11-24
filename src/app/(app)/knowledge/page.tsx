import { redirect } from "next/navigation";
import { FileText, Search } from "lucide-react";
import DocumentActions from "@/components/documents/DocumentActions";
import UploadForm from "@/components/documents/UploadForm";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

type DocRow = {
  id: string;
  name: string;
  size_bytes: number;
  status: string;
  error: string | null;
  created_at: string;
  created_by: string;
};

type SearchResult = {
  chunk_id: string;
  document_id: string;
  document_name: string;
  content: string;
  rank: number;
};

const STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "Aguardando leitura", className: "text-slate-400" },
  processing: { label: "Lendo...", className: "text-electric-soft" },
  ready: { label: "Pronto para busca", className: "text-emerald-400" },
  failed: { label: "Falhou", className: "text-red-400" },
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 200) : "";

  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("memberships")
    .select("org_id, role")
    .limit(1);
  const membership = memberships?.[0];
  if (!membership) redirect("/onboarding");

  const role = String(membership.role);
  const canEdit = ["owner", "admin", "agent"].includes(role);
  const isAdmin = ["owner", "admin"].includes(role);

  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;

  const { data } = await supabase
    .from("documents")
    .select("id, name, size_bytes, status, error, created_at, created_by")
    .eq("org_id", membership.org_id)
    .order("created_at", { ascending: false })
    .limit(100);
  const documents: DocRow[] = data ?? [];

  let results: SearchResult[] = [];
  let searchFailed = false;
  if (q) {
    const { data: found, error } = await supabase.rpc(
      "search_document_chunks",
      { p_query: q, p_limit: 10 }
    );
    if (error) searchFailed = true;
    else results = found ?? [];
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Knowledge Base
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Documentos da sua organização, visíveis a todos os membros.
        </p>
      </div>

      <div className="rounded-lg border border-electric/30 bg-electric/10 px-4 py-3 text-sm text-electric-soft">
        A busca encontra texto de PDF e TXT já lidos. Perguntas à IA sobre os
        documentos chegam na próxima tarefa. Use apenas documentos fictícios.
      </div>

      <form method="get" className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          maxLength={200}
          placeholder="Buscar no conteúdo dos documentos..."
          className="min-w-0 flex-1 rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm outline-none focus:border-electric"
        />
        <button
          type="submit"
          aria-label="Buscar"
          className="rounded-lg bg-electric px-3 text-white hover:opacity-90"
        >
          <Search size={18} />
        </button>
      </form>

      {q && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium">
            Resultados para &ldquo;{q}&rdquo;
          </h2>
          <p className="text-xs text-slate-500">
            A busca diferencia acentos: use a grafia correta (ex.: locação).
          </p>
          {searchFailed ? (
            <p className="text-sm text-red-400">
              Não foi possível realizar a busca. Tente novamente.
            </p>
          ) : results.length === 0 ? (
            <p className="text-sm text-slate-400">
              Nada encontrado nos documentos já lidos.
            </p>
          ) : (
            <ul className="space-y-2">
              {results.map((r) => (
                <li
                  key={r.chunk_id}
                  className="rounded-xl border border-navy-700 bg-navy-900 px-4 py-3"
                >
                  <p className="text-xs font-medium text-electric-soft">
                    {r.document_name}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-300">
                    {r.content.length > 400
                      ? `${r.content.slice(0, 400)}…`
                      : r.content}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {canEdit ? (
        <UploadForm orgId={String(membership.org_id)} />
      ) : (
        <p className="text-sm text-slate-500">
          Seu papel permite apenas visualizar e baixar documentos.
        </p>
      )}

      {documents.length === 0 ? (
        <p className="rounded-xl border border-navy-700 bg-navy-900 p-6 text-center text-sm text-slate-400">
          Nenhum documento ainda.
        </p>
      ) : (
        <ul className="space-y-2">
          {documents.map((d) => {
            const st = STATUS[d.status] ?? STATUS.pending;
            return (
              <li
                key={d.id}
                className="flex items-center gap-3 rounded-xl border border-navy-700 bg-navy-900 px-4 py-3"
              >
                <FileText size={20} className="shrink-0 text-electric" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{d.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatSize(d.size_bytes)} ·{" "}
                    {new Date(d.created_at).toLocaleString("pt-BR", {
                      timeZone: "America/Sao_Paulo",
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                  <p className={`mt-0.5 text-xs ${st.className}`}>
                    {st.label}
                    {d.status === "failed" && d.error ? `: ${d.error}` : ""}
                  </p>
                </div>
                <DocumentActions
                  id={d.id}
                  status={d.status}
                  canProcess={canEdit}
                  canDelete={isAdmin || (canEdit && d.created_by === userId)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
