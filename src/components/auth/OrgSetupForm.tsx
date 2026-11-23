"use client";

import { useActionState } from "react";
import { createOrganizationAction, logout } from "@/lib/auth/actions";
import Field from "./Field";
import SubmitButton from "./SubmitButton";

const initialState: { error: string | null } = { error: null };

export default function OrgSetupForm({ defaultName }: { defaultName: string }) {
  const [state, formAction] = useActionState(
    createOrganizationAction,
    initialState,
  );

  return (
    <div className="w-full max-w-md rounded-xl border border-navy-700 bg-navy-900 p-6 sm:p-8">
      <h1 className="text-xl font-semibold tracking-tight">Quase lá</h1>
      <p className="mt-1 text-sm text-slate-400">
        Informe o nome da sua imobiliária para criar o seu espaço de trabalho.
      </p>

      {state.error && (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300"
        >
          {state.error}
        </div>
      )}

      <form action={formAction} className="mt-6 space-y-4">
        <Field
          label="Nome da imobiliária"
          name="org_name"
          autoComplete="organization"
          defaultValue={defaultName}
        />
        <SubmitButton pendingText="Criando...">Criar organização</SubmitButton>
      </form>

      <form action={logout} className="mt-4 text-center">
        <button
          type="submit"
          className="text-xs text-slate-500 hover:text-white"
        >
          Sair
        </button>
      </form>
    </div>
  );
}
