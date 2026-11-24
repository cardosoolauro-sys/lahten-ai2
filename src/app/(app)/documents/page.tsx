import Link from "next/link";
import AskForm from "@/components/documents/AskForm";

export const maxDuration = 60;

export default function DocumentIntelligencePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Document Intelligence
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Faça perguntas sobre os documentos da sua organização.
        </p>
      </div>

      <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
        IA em modo de teste (Gemini, plano gratuito). Os trechos encontrados
        são enviados ao Gemini: use apenas documentos fictícios.
      </div>

      <AskForm />

      <p className="text-xs text-slate-500">
        A IA só consulta documentos com estado &ldquo;Pronto para busca&rdquo;.
        Envie e leia arquivos na{" "}
        <Link href="/knowledge" className="text-electric-soft underline">
          Knowledge Base
        </Link>
        .
      </p>
    </div>
  );
}
