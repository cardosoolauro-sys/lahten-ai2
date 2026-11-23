import Link from "next/link";
import Field from "@/components/auth/Field";
import SubmitButton from "@/components/auth/SubmitButton";
import { login } from "@/lib/auth/actions";
import { errorMessage, infoMessage } from "@/lib/auth/messages";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const errorText = errorMessage(error);
  const infoText = infoMessage(message);

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight">Entrar</h1>
      <p className="mt-1 text-sm text-slate-400">
        Acesse a sua conta para continuar.
      </p>

      {infoText && (
        <div
          role="status"
          className="mt-5 rounded-lg border border-electric/30 bg-electric/10 px-3 py-2.5 text-sm text-electric-soft"
        >
          {infoText}
        </div>
      )}
      {errorText && (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300"
        >
          {errorText}
        </div>
      )}

      <form action={login} className="mt-6 space-y-4">
        <Field
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@imobiliaria.com"
        />
        <Field
          label="Senha"
          name="password"
          type="password"
          autoComplete="current-password"
        />
        <SubmitButton pendingText="Entrando...">Entrar</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="text-electric-soft hover:text-white">
          Criar conta
        </Link>
      </p>
    </>
  );
}
