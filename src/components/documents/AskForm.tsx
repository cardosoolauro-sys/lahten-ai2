"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { askDocuments } from "@/lib/documents/ask";

export default function AskForm() {
  const [state, action, pending] = useActionState(askDocuments, undefined);

  return (
    <div className="space-y-4">
      <form action={action} className="space-y-3">
        <textarea
          name="question"
          required
          minLength={3}
          maxLength={500}
          rows={3}
          placeholder="Ex.: Qual é o prazo do contrato de locação?"
          className="w-full resize-none rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm outline-none focus:border-electric"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 rounded-lg bg-electric px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <Send size={16} />
          {pending ? "Consultando os documentos..." : "Perguntar"}
        </button>
      </form>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      {state?.answer && (
        <div className="rounded-xl border border-navy-700 bg-navy-900 p-4">
          <p className="whitespace-pre-wrap break-words text-sm text-slate-200">
            {state.answer}
          </p>
          {state.sources && state.sources.length > 0 && (
            <div className="mt-4 border-t border-navy-700 pt-3">
              <p className="text-xs font-medium text-slate-400">
                Documentos consultados
              </p>
              <ul className="mt-1 space-y-0.5">
                {state.sources.map((s) => (
                  <li key={s} className="text-xs text-electric-soft">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
