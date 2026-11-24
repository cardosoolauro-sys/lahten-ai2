import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import DocumentActions from "@/components/documents/DocumentActions";
import UploadForm from "@/components/documents/UploadForm";
import { createClient } from "@/lib/supabase/server";

type DocRow = {
  id: string;
  name: string;
  size_bytes: number;
  created_at: string;
  created_by: string;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function KnowledgePage() {
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
    .select("id, name, size_bytes, created_at, created_by")
    .eq("org_id", membership.org_id)
    .order("created_at", { ascending: false })
    .limit(100);

  const documents: DocRow[] = data ?? [];

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
        Por enquanto esta tela apenas guarda arquivos. Busca no conteúdo e
        perguntas à IA sobre os documentos chegam nas próximas tarefas. Use
        apenas documentos fictícios.
      </div>

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
          {documents.map((d) => (
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
              </div>
              <DocumentActions
                id={d.id}
                canDelete={
                  isAdmin || (canEdit && d.created_by === userId)
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
