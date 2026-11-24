"use client";

import { useActionState } from "react";
import { createOrganization } from "@/lib/org/actions";

export default function CreateOrgForm() {
  const [state, action, pending] = useActionState(
    createOrganization,
    undefined
  );

  return (
    <div className="w-full max-w-sm rounded-xl border border-navy-700 bg-navy-900 p-6">
      <h1 className="text-xl font-semibold tracking-tight">
        Criar sua organização
      </h1>
      <p className="mt-1 text-sm text-slate-400">
        Informe o nome da sua imobiliária. Você será o proprietário.
      </p>

      <form action={action} className="mt-5 space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-xs text-slate-400">
            Nome da imobiliária
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={80}
            autoComplete="organization"
            className="w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2 text-sm outline-none focus:border-electric"
          />
        </div>

        {state?.error && (
          <p className="text-sm text-red-400">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-electric px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Criando..." : "Criar organização"}
        </button>
      </form>
    </div>
  );
}
