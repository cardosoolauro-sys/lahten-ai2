"use client";

import { useActionState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { sendMessage } from "@/lib/workspace/actions";

export default function MessageForm({
  conversationId,
}: {
  conversationId: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(sendMessage, undefined);

  useEffect(() => {
    if (state?.saved) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={action}
      className="sticky bottom-0 -mx-4 border-t border-navy-700 bg-navy-950 px-4 py-3 sm:mx-0 sm:px-0"
    >
      <input type="hidden" name="conversationId" value={conversationId} />
      {pending && (
        <p className="mb-2 text-sm text-electric-soft">
          A IA está respondendo...
        </p>
      )}
      {state?.error && (
        <p className="mb-2 text-sm text-red-400">{state.error}</p>
      )}
      <div className="flex items-end gap-2">
        <textarea
          name="content"
          required
          maxLength={4000}
          rows={2}
          placeholder="Escreva sua mensagem..."
          className="min-h-[3rem] flex-1 resize-none rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm outline-none focus:border-electric"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Enviar"
          className="rounded-lg bg-electric p-3 text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
}
